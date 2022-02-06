package main

import (
	"encoding/json"
	"fmt"
	"os"

	r2 "github.com/golang/geo/r2"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
	metadata "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/metadata"
)

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}

func updateTeams(p *dem.Parser, teams *TeamsMap, ctClanTag, tClanTag *string) {
	tTeam := (*p).GameState().TeamTerrorists()
	tTag := tTeam.ClanName()
	ctTeam := (*p).GameState().TeamCounterTerrorists()
	ctTag := ctTeam.ClanName()

	if tTag != "" && ctTag != "" {
		*tClanTag = tTag
		*ctClanTag = ctTag
	}

	for _, tPlayer := range tTeam.Members() {
		(*teams)[tPlayer.SteamID64] = "T"
	}
	for _, ctPlayer := range ctTeam.Members() {
		(*teams)[ctPlayer.SteamID64] = "CT"
	}
}

func updatePlayerNames(p *dem.Parser, playerNames *NamesMap) {
	for _, player := range (*p).GameState().Participants().Playing() {
		(*playerNames)[player.SteamID64] = player.Name
	}
}

func main() {
	f, err := os.Open(os.Args[1])
	checkError(err)
	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	header, err := p.ParseHeader()
	checkError(err)

	mapMetadata := metadata.MapNameToMap[header.MapName]
	demoFileName := GetDemoFileName(os.Args[1])
	demoType := GetDemoType(demoFileName)

	prd := PerRoundData{}

	var teams TeamsMap
	var playerNames NamesMap

	// Only tracked for one round for use in KAST and RWS
	var bombPlanter uint64
	var bombDefuser uint64
	var bombPlanterTime int64 = 0
	var bombDefuserTime int64 = 0
	var roundStartTime int64 = 0
	var bombExplodeTime int64 = 0

	var ctClanTag string
	var tClanTag string

	consecutiveMatchStarts := 0
	eseaMode := demoType == "esea"
	isLive := !eseaMode

	deathTimes := make(map[uint64]Death)

	var points_shotsFired []r2.Point

	// Register handler on kill events
	p.RegisterEventHandler(func(e events.Kill) {
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the stats arrays will be
		// empty
		if len(prd.kills) == 0 {
			return
		}

		if e.Victim != nil {
			prd.deaths[len(prd.deaths)-1][e.Victim.SteamID64] += 1
		}

		if e.Assister != nil && e.Victim != nil && e.Assister.Team != e.Victim.Team {
			if e.AssistedFlash {
				prd.flashAssists[len(prd.flashAssists)-1][e.Assister.SteamID64] += 1
			} else {
				prd.assists[len(prd.assists)-1][e.Assister.SteamID64] += 1
			}
		}

		if e.Killer != nil && e.Victim != nil && e.Killer.Team != e.Victim.Team {
			prd.kills[len(prd.kills)-1][e.Killer.SteamID64] += 1

			if e.IsHeadshot {
				prd.headshots[len(prd.headshots)-1][e.Killer.SteamID64] += 1
			}

			deathTimes[e.Victim.SteamID64] = Death{
				KilledBy:    e.Killer.SteamID64,
				TimeOfDeath: p.CurrentTime().Seconds(),
			}

			if prd.headToHead[len(prd.headToHead)-1][e.Killer.SteamID64] == nil {
				prd.headToHead[len(prd.headToHead)-1][e.Killer.SteamID64] = make(map[uint64]Kill)
			}

			var assister uint64 = 0
			if e.Assister != nil {
				assister = e.Assister.SteamID64
			}

			killInfo := Kill{
				Weapon:            ProcessWeaponName(*e.Weapon),
				Assister:          assister,
				Time:              p.CurrentTime().Milliseconds() - roundStartTime,
				IsHeadshot:        e.IsHeadshot,
				AttackerBlind:     e.AttackerBlind,
				AssistedFlash:     e.AssistedFlash,
				NoScope:           e.NoScope,
				ThroughSmoke:      e.ThroughSmoke,
				PenetratedObjects: e.PenetratedObjects,
				AttackerLocation:  e.Killer.LastPlaceName(),
				VictimLocation:    e.Victim.LastPlaceName(),
			}

			if prd.openings[len(prd.openings)-1] == nil {
				prd.openings[len(prd.openings)-1] = &OpeningKill{
					Kill:     killInfo,
					Attacker: e.Killer.SteamID64,
					Victim:   e.Victim.SteamID64,
				}
			}

			prd.headToHead[len(prd.headToHead)-1][e.Killer.SteamID64][e.Victim.SteamID64] = killInfo

			// check for trade kills
			for deadPlayer := range prd.deaths[len(prd.deaths)-1] {
				if deathTimes[deadPlayer].KilledBy == e.Victim.SteamID64 {
					// Using 5 seconds as the trade window for now
					if p.CurrentTime().Seconds()-deathTimes[deadPlayer].TimeOfDeath <= 5 {
						prd.deathsTraded[len(prd.deathsTraded)-1][deadPlayer] += 1
						prd.tradeKills[len(prd.tradeKills)-1][e.Killer.SteamID64] += 1
					}

				}
			}
		}
	})

	p.RegisterEventHandler(func(e events.PlayerFlashed) {
		blindMs := e.FlashDuration().Milliseconds()

		// https://counterstrike.fandom.com/wiki/Flashbang
		if blindMs > 1950 {
			if e.Attacker.Team == e.Player.Team {
				prd.teammatesFlashed[len(prd.teammatesFlashed)-1][e.Attacker.SteamID64] += 1
			} else {
				prd.enemiesFlashed[len(prd.enemiesFlashed)-1][e.Attacker.SteamID64] += 1
			}
		}
	})

	p.RegisterEventHandler(func(e events.BombDefused) {
		bombDefuser = e.Player.SteamID64
		bombDefuserTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.BombPlanted) {
		bombPlanter = e.Player.SteamID64
		bombPlanterTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.BombExplode) {
		bombExplodeTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.WeaponFire) {
		if e.Shooter == nil || prd.flashesThrown == nil {
			return
		}

		if e.Weapon.Type == common.EqFlash {
			prd.flashesThrown[len(prd.flashesThrown)-1][e.Shooter.SteamID64] += 1
		}

		if e.Weapon.Type == common.EqHE {
			prd.HEsThrown[len(prd.HEsThrown)-1][e.Shooter.SteamID64] += 1
		}

		if e.Weapon.Type == common.EqMolotov || e.Weapon.Type == common.EqIncendiary {
			prd.molliesThrown[len(prd.molliesThrown)-1][e.Shooter.SteamID64] += 1
		}

		if e.Weapon.Type == common.EqSmoke {
			prd.smokesThrown[len(prd.smokesThrown)-1][e.Shooter.SteamID64] += 1
		}

		x, y := mapMetadata.TranslateScale(e.Shooter.Position().X, e.Shooter.Position().Y)
		points_shotsFired = append(points_shotsFired, r2.Point{X: x, Y: y})
	})

	p.RegisterEventHandler(func(e events.PlayerHurt) {
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the damage array will be
		// empty
		if len(prd.damage) == 0 {
			return
		}

		if e.Attacker != nil && e.Player != nil && e.Attacker.Team != e.Player.Team {
			prd.damage[len(prd.damage)-1][e.Attacker.SteamID64] += e.HealthDamageTaken

			// fmt.Fprintf(os.Stderr, "%s <%s> -> %s (%d HP)\n", e.Attacker.Name, e.Weapon, e.Player.Name, e.HealthDamageTaken)

			if e.Weapon.Type == common.EqHE ||
				e.Weapon.Type == common.EqMolotov ||
				e.Weapon.Type == common.EqIncendiary {
				prd.utilDamage[len(prd.utilDamage)-1][e.Attacker.SteamID64] += e.HealthDamageTaken
			}
		}
	})

	p.RegisterEventHandler(func(e events.MatchStart) {
		if prd.isLive == nil {
			return
		}

		if eseaMode {
			// The MatchStart event comes after the RoundStart in ESEA demos so we need to
			// set the current round's live status in addition to updating the isLive variable
			if consecutiveMatchStarts < 3 {
				prd.isLive[len(prd.isLive)-1] = false
				isLive = false
				DebugBig("NOT LIVE")
				consecutiveMatchStarts += 1
			} else {
				prd.isLive[len(prd.isLive)-1] = true
				isLive = true
				DebugBig("GOING LIVE")
				consecutiveMatchStarts = 0
			}
		}
	})

	// Create a new 'round' map in each of the stats arrays
	p.RegisterEventHandler(func(e events.RoundStart) {
		DebugBig("ROUND START")
		prd.NewRound(isLive)

		bombDefuser = 0
		bombPlanter = 0
		roundStartTime = p.CurrentTime().Milliseconds()
		bombExplodeTime = 0
		bombPlanterTime = 0
		bombDefuserTime = 0

		if teams == nil {
			teams = make(TeamsMap)
		}

		if playerNames == nil {
			playerNames = make(NamesMap)
		}

		updatePlayerNames(&p, &playerNames)
		updateTeams(&p, &teams, &ctClanTag, &tClanTag)
	})

	// Update the teams when the side switches
	p.RegisterEventHandler(func(e events.TeamSideSwitch) {
		DebugBig("SIDE SWITCH")
		updateTeams(&p, &teams, &ctClanTag, &tClanTag)
	})

	p.RegisterEventHandler(func(e events.RoundEnd) {
		Debug(e)
		winner := ""

		switch e.Winner {
		case common.TeamCounterTerrorists:
			winner = "CT"
		case common.TeamTerrorists:
			winner = "T"
		}

		if len(prd.rounds) == 0 {
			return
		}

		updateTeams(&p, &teams, &ctClanTag, &tClanTag)

		prd.rounds[len(prd.rounds)-1] = Round{
			Winner:          winner,
			Reason:          int(e.Reason),
			Planter:         bombPlanter,
			Defuser:         bombDefuser,
			PlanterTime:     bombPlanterTime,
			DefuserTime:     bombDefuserTime,
			BombExplodeTime: bombExplodeTime,
		}

		var roundWinners []uint64
		for player := range teams {
			if teams[player] == winner {
				roundWinners = append(roundWinners, player)
			}
		}

		prd.winners[len(prd.winners)-1] = roundWinners
	})

	fmt.Fprintln(os.Stderr, "Parsing demo...")
	err = p.ParseToEnd()
	checkError(err)
	fmt.Fprintln(os.Stderr, "Computing stats...")

	if eseaMode {
		StripPlayerPrefixes(teams, &playerNames, "CT")
		StripPlayerPrefixes(teams, &playerNames, "T")
	}

	prd.CropToRealRounds(eseaMode)
	totals := prd.ComputeTotals()
	totalRounds := len(prd.kills)

	headshotPct, kd, kdiff, kpr := ComputeBasicStats(
		totalRounds,
		totals.kills,
		totals.headshots,
		totals.deaths,
	)

	kast := ComputeKAST(totalRounds, teams, prd.kills, prd.assists, prd.deaths, prd.deathsTraded)
	adr := ComputeADR(totalRounds, totals.damage)
	impact := ComputImpact(totalRounds, teams, totals.assists, kpr)
	k2, k3, k4, k5 := ComputMultikills(prd.kills)
	oKills, oDeaths, oAttempts, oAttemptsPct, oSuccess := ComputeOpenings(totals.openingKills)

	hltv := ComputeHLTV(
		totalRounds,
		teams,
		totals.deaths,
		kast,
		kpr,
		impact,
		adr,
	)

	teamAScore, _ := GetScore(prd.rounds, "CT", 999999999)
	teamBScore, _ := GetScore(prd.rounds, "T", 999999999)

	jsonstring, err := json.Marshal(&Output{
		TotalRounds: totalRounds,
		Teams:       teams,
		StartTeams:  ComputeStartSides(teams, prd.rounds),
		Rounds:      prd.rounds,

		Stats: Stats{
			Adr:                adr,
			Assists:            totals.assists,
			Deaths:             totals.deaths,
			EFPerFlash:         ComputeEFPerFlash(totals.flashesThrown, totals.enemiesFlashed),
			EnemiesFlashed:     totals.enemiesFlashed,
			FlashAssists:       totals.flashAssists,
			FlashesThrown:      totals.flashesThrown,
			HEsThrown:          totals.hEsThrown,
			HeadshotPct:        headshotPct,
			Hltv:               hltv,
			Impact:             impact,
			Kast:               kast,
			Kd:                 kd,
			Kdiff:              kdiff,
			Kills:              totals.kills,
			Kpr:                kpr,
			MolliesThrown:      totals.molliesThrown,
			OpeningAttempts:    oAttempts,
			OpeningAttemptsPct: oAttemptsPct,
			OpeningDeaths:      oDeaths,
			OpeningKills:       oKills,
			OpeningSuccess:     oSuccess,
			Rws:                ComputeRWS(prd.winners, prd.rounds, prd.damage),
			SmokesThrown:       totals.smokesThrown,
			TeammatesFlashed:   totals.teammatesFlashed,
			DeathsTraded:       totals.deathsTraded,
			TradeKills:         totals.tradeKills,
			UtilDamage:         totals.utilDamage,

			K2: k2,
			K3: k3,
			K4: k4,
			K5: k5,
		},

		HeadToHead:   HeadToHeadTotal(&prd.headToHead),
		KillFeed:     prd.headToHead,
		RoundByRound: ComputeRoundByRound(prd.rounds, prd.headToHead),
		OpeningKills: totals.openingKills,

		Meta: MetaData{
			Map:         header.MapName,
			Id:          demoFileName,
			DemoType:    demoType,
			PlayerNames: playerNames,
			TeamAScore:  teamAScore,
			TeamBScore:  teamBScore,
			TeamATitle:  GetTeamName(ctClanTag, teams, playerNames, hltv, "CT"),
			TeamBTitle:  GetTeamName(tClanTag, teams, playerNames, hltv, "T"),
		},
	})

	checkError(err)
	fmt.Println(string(jsonstring))
	fmt.Fprintln(os.Stderr, "Generating heatmaps...")
	GenHeatmap(points_shotsFired, header, GetHeatmapFileName(os.Args[1], "shotsFired"))
}
