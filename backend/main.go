package main

import (
	"encoding/json"
	"fmt"
	"math"
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

func main() {
	f, err := os.Open(os.Args[1])
	checkError(err)
	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	var kills []map[string]int
	var deaths []map[string]int
	var assists []map[string]int
	var timesTraded []map[string]int
	var headshots []map[string]int
	var damage []map[string]int
	var flashAssists []map[string]int
	var enemiesFlashed []map[string]int
	var teammatesFlashed []map[string]int
	var utilDamage []map[string]int

	var flashesThrown []map[string]int
	var HEsThrown []map[string]int
	var molliesThrown []map[string]int
	var smokesThrown []map[string]int
	var headToHead []map[string]map[string]Kill

	var rounds []Round

	var teams map[string]string
	var winners [][]string

	// Only tracked for one round for use in KAST and RWS
	var bombPlanter string
	var bombDefuser string
	var bombPlanterTime int64 = 0
	var bombDefuserTime int64 = 0
	var roundStartTime int64 = 0
	var bombExplodeTime int64 = 0

	deathTimes := make(map[string]Death)

	header, err := p.ParseHeader()
	checkError(err)

	mapMetadata := metadata.MapNameToMap[header.MapName]
	var points_shotsFired []r2.Point

	// Register handler on kill events
	p.RegisterEventHandler(func(e events.Kill) {
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the stats arrays will be
		// empty
		if len(kills) == 0 {
			return
		}

		if e.Victim != nil {
			deaths[len(deaths)-1][e.Victim.Name] += 1
		}

		if e.Assister != nil && e.Victim != nil && e.Assister.Team != e.Victim.Team {
			if e.AssistedFlash {
				flashAssists[len(flashAssists)-1][e.Assister.Name] += 1
			} else {
				assists[len(assists)-1][e.Assister.Name] += 1
			}
		}

		if e.Killer != nil && e.Victim != nil && e.Killer.Team != e.Victim.Team {
			kills[len(kills)-1][e.Killer.Name] += 1

			if e.IsHeadshot {
				headshots[len(headshots)-1][e.Killer.Name] += 1
			}

			deathTimes[e.Victim.Name] = Death{
				KilledBy:    e.Killer.Name,
				TimeOfDeath: p.CurrentTime().Seconds(),
			}

			if headToHead != nil {
				if headToHead[len(headToHead)-1][e.Killer.Name] == nil {
					headToHead[len(headToHead)-1][e.Killer.Name] = make(map[string]Kill)
				}

				assister := ""
				if e.Assister != nil {
					assister = e.Assister.Name
				}

				headToHead[len(headToHead)-1][e.Killer.Name][e.Victim.Name] = Kill{
					Weapon:            ProcessWeaponName(e.Weapon.OriginalString),
					Assister:          assister,
					Time:              p.CurrentTime().Milliseconds() - roundStartTime,
					IsHeadshot:        e.IsHeadshot,
					AttackerBlind:     e.AttackerBlind,
					AssistedFlash:     e.AssistedFlash,
					NoScope:           e.NoScope,
					ThroughSmoke:      e.ThroughSmoke,
					PenetratedObjects: e.PenetratedObjects,
				}
			}

			// check for trade kills
			for player := range deaths[len(deaths)-1] {
				if deathTimes[player].KilledBy == e.Victim.Name {
					// Using 5 seconds as the trade window for now
					if p.CurrentTime().Seconds()-deathTimes[player].TimeOfDeath <= 5 {
						timesTraded[len(timesTraded)-1][player] += 1
					}

				}
			}
		}

		if e.Killer != nil && e.Killer.Name == "" {
			fmt.Printf("%s <%v> %s %f\n", e.Killer, e.Weapon, e.Victim, p.CurrentTime().Seconds())
		}
	})

	p.RegisterEventHandler(func(e events.PlayerFlashed) {
		blindMs := e.FlashDuration().Milliseconds()

		// https://counterstrike.fandom.com/wiki/Flashbang
		if blindMs > 1950 {
			if e.Attacker.Team == e.Player.Team {
				teammatesFlashed[len(teammatesFlashed)-1][e.Attacker.Name] += 1
			} else {
				enemiesFlashed[len(enemiesFlashed)-1][e.Attacker.Name] += 1
			}
		}
	})

	p.RegisterEventHandler(func(e events.BombDefused) {
		bombDefuser = e.Player.Name
		bombDefuserTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.BombPlanted) {
		bombPlanter = e.Player.Name
		bombPlanterTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.BombExplode) {
		bombExplodeTime = p.CurrentTime().Milliseconds() - roundStartTime
	})

	p.RegisterEventHandler(func(e events.WeaponFire) {
		if e.Shooter == nil {
			return
		}

		if e.Weapon.Type == common.EqFlash {
			flashesThrown[len(flashesThrown)-1][e.Shooter.Name] += 1
		}

		if e.Weapon.Type == common.EqHE {
			HEsThrown[len(HEsThrown)-1][e.Shooter.Name] += 1
		}

		if e.Weapon.Type == common.EqMolotov || e.Weapon.Type == common.EqIncendiary {
			molliesThrown[len(molliesThrown)-1][e.Shooter.Name] += 1
		}

		if e.Weapon.Type == common.EqSmoke {
			smokesThrown[len(smokesThrown)-1][e.Shooter.Name] += 1
		}

		x, y := mapMetadata.TranslateScale(e.Shooter.Position().X, e.Shooter.Position().Y)
		points_shotsFired = append(points_shotsFired, r2.Point{X: x, Y: y})
	})

	p.RegisterEventHandler(func(e events.PlayerHurt) {
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the damage array will be
		// empty
		if len(damage) == 0 {
			return
		}

		if e.Attacker != nil && e.Player != nil && e.Attacker.Team != e.Player.Team {
			damage[len(damage)-1][e.Attacker.Name] += e.HealthDamageTaken

			// fmt.Fprintf(os.Stderr, "%s <%s> -> %s (%d HP)\n", e.Attacker.Name, e.Weapon, e.Player.Name, e.HealthDamageTaken)

			if e.Weapon.Type == common.EqHE || e.Weapon.Type == common.EqMolotov || e.Weapon.Type == common.EqIncendiary {
				utilDamage[len(utilDamage)-1][e.Attacker.Name] += e.HealthDamageTaken
			}
		}
	})

	// Create a new 'round' map in each of the stats arrays
	p.RegisterEventHandler(func(e events.RoundStart) {
		kills = append(kills, make(map[string]int))
		deaths = append(deaths, make(map[string]int))
		assists = append(assists, make(map[string]int))
		timesTraded = append(timesTraded, make(map[string]int))
		headshots = append(headshots, make(map[string]int))
		damage = append(damage, make(map[string]int))
		flashAssists = append(flashAssists, make(map[string]int))
		enemiesFlashed = append(enemiesFlashed, make(map[string]int))
		teammatesFlashed = append(teammatesFlashed, make(map[string]int))
		utilDamage = append(utilDamage, make(map[string]int))

		flashesThrown = append(flashesThrown, make(map[string]int))
		HEsThrown = append(HEsThrown, make(map[string]int))
		molliesThrown = append(molliesThrown, make(map[string]int))
		smokesThrown = append(smokesThrown, make(map[string]int))

		bombDefuser = ""
		bombPlanter = ""
		roundStartTime = p.CurrentTime().Milliseconds()
		bombExplodeTime = 0
		bombPlanterTime = 0
		bombDefuserTime = 0

		headToHead = append(headToHead, make(map[string]map[string]Kill))
		teams = make(map[string]string)
		players := p.GameState().Participants().Playing()
		for idx := range players {
			player := players[idx]
			switch player.Team {
			case common.TeamCounterTerrorists:
				teams[player.Name] = "CT"
			case common.TeamTerrorists:
				teams[player.Name] = "T"
			}
		}
	})

	p.RegisterEventHandler(func(e events.RoundEnd) {
		winner := ""

		switch e.Winner {
		case common.TeamCounterTerrorists:
			winner = "CT"
		case common.TeamTerrorists:
			winner = "T"
		}

		rounds = append(rounds, Round{
			Winner:          winner,
			Reason:          int(e.Reason),
			Planter:         bombPlanter,
			Defuser:         bombDefuser,
			PlanterTime:     bombPlanterTime,
			DefuserTime:     bombDefuserTime,
			BombExplodeTime: bombExplodeTime,
		})

		var roundWinners []string
		for player := range teams {
			if teams[player] == winner {
				roundWinners = append(roundWinners, player)
			}
		}
		winners = append(winners, roundWinners)
	})

	fmt.Fprintln(os.Stderr, "Parsing demo...")
	err = p.ParseToEnd()
	checkError(err)

	fmt.Fprintln(os.Stderr, "Computing stats...")

	// Figure out where the game actually goes live
	startRound := 0
	for i := len(kills) - 2; i > 0; i-- {
		killsNext := MapValTotal(&kills[i+1])
		killsCurr := MapValTotal(&kills[i])
		killsPrev := MapValTotal(&kills[i-1])

		// Three consecutive rounds with 0 kills will be
		// considered the start of the game (faceit + pugsetup
		// have the triple-restart and then MATCH IS LIVE thing)
		if killsPrev+killsCurr+killsNext == 0 {
			startRound = i + 1
		}
	}

	kills = kills[startRound+1:]
	totalRounds := len(kills)

	deaths = deaths[startRound+1:]
	assists = assists[startRound+1:]
	timesTraded = timesTraded[startRound+1:]
	headshots = headshots[startRound+1:]
	damage = damage[startRound+1:]
	flashAssists = flashAssists[startRound+1:]
	enemiesFlashed = enemiesFlashed[startRound+1:]
	teammatesFlashed = teammatesFlashed[startRound+1:]
	utilDamage = utilDamage[startRound+1:]

	flashesThrown = flashesThrown[startRound+1:]
	HEsThrown = HEsThrown[startRound+1:]
	molliesThrown = molliesThrown[startRound+1:]
	smokesThrown = smokesThrown[startRound+1:]

	headToHead = headToHead[startRound+1:]

	// Need to slice the rounds array differently because it's not
	// being appended-to on the RoundStart event
	rounds = rounds[len(rounds)-totalRounds:]
	winners = winners[len(winners)-totalRounds:]

	h2hTotal := HeadToHeadTotal(&headToHead)
	totalKills := ArrayMapTotal(&kills)
	totalDeaths := ArrayMapTotal(&deaths)
	totalAssists := ArrayMapTotal(&assists)
	totalTimesTraded := ArrayMapTotal(&timesTraded)
	totalHeadshots := ArrayMapTotal(&headshots)
	totalDamage := ArrayMapTotal(&damage)
	totalFlashAssists := ArrayMapTotal(&flashAssists)
	totalEnemiesFlashed := ArrayMapTotal(&enemiesFlashed)
	totalTeammatesFlashed := ArrayMapTotal(&teammatesFlashed)
	totalUtilDamage := ArrayMapTotal(&utilDamage)

	totalFlashesThrown := ArrayMapTotal(&flashesThrown)
	totalHEsThrown := ArrayMapTotal(&HEsThrown)
	totalMolliesThrown := ArrayMapTotal(&molliesThrown)
	totalSmokesThrown := ArrayMapTotal(&smokesThrown)

	kast := make(map[string]float64)
	for i := 0; i < totalRounds; i++ {
		for p := range teams {
			// KAST
			if kills[i][p] != 0 || assists[i][p] != 0 || deaths[i][p] == 0 || timesTraded[i][p] != 0 {
				kast[p] += 1 / float64(totalRounds)
			}
		}
	}

	for k, v := range kast {
		kast[k] = math.Round(v * 100)
	}

	rws := make(map[string]float64)
	for i := 0; i < totalRounds; i++ {
		winTeamTotalDamage := 0
		for p := range winners[i] {
			player := winners[i][p]
			winTeamTotalDamage += damage[i][player]
		}

		for p := range winners[i] {
			switch rounds[i].Reason {
			case int(events.RoundEndReasonBombDefused):
				player := winners[i][p]
				if player == rounds[i].Defuser {
					rws[player] += 30.00 / float64(totalRounds)
				}
				rws[player] += (float64(damage[i][player]) / float64(winTeamTotalDamage) * 70.00) / float64(totalRounds)

			case int(events.RoundEndReasonTargetBombed):
				player := winners[i][p]
				if player == rounds[i].Planter {
					rws[player] += 30.00 / float64(totalRounds)
				}
				rws[player] += (float64(damage[i][player]) / float64(winTeamTotalDamage) * 70.00) / float64(totalRounds)

			default:
				player := winners[i][p]
				rws[player] += (float64(damage[i][player]) / float64(winTeamTotalDamage) * 100.00) / float64(totalRounds)
			}
		}
	}

	for player := range rws {
		rws[player] = math.Round(rws[player]*100) / 100
	}

	// Initialze these maps with all players from kills + deaths
	// in case anyone got 0 kills or 0 deaths (lol)
	kd := make(map[string]float64)
	kdiff := make(map[string]int)
	kpr := make(map[string]float64)
	headshotPct := make(map[string]float64)
	adr := make(map[string]float64)

	k2 := make(map[string]int)
	k3 := make(map[string]int)
	k4 := make(map[string]int)
	k5 := make(map[string]int)

	// Compute headshot percentages, K/D & K-D etc
	for player, numKills := range totalKills {
		numHeadshots := totalHeadshots[player]
		numDeaths := totalDeaths[player]

		if numHeadshots == 0 || numKills == 0 {
			headshotPct[player] = 0
		} else {
			headshotPct[player] = math.Round((float64(numHeadshots) / float64(numKills)) * 100)
		}

		if numDeaths == 0 {
			kd[player] = math.Inf(1)
		} else {
			kd[player] = math.Round((float64(numKills)/float64(numDeaths))*100) / 100
		}

		kdiff[player] = numKills - numDeaths
		kpr[player] = math.Round((float64(numKills)/float64(totalRounds))*100) / 100
	}

	for player, playerDamage := range totalDamage {
		adr[player] = math.Round((float64(playerDamage) / float64(totalRounds)))
	}

	impact := make(map[string]float64)
	for p := range teams {
		assistsPerRound := (float64(totalAssists[p]) / float64(totalRounds))

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		impact[p] = math.Round((2.13*kpr[p]+0.42*assistsPerRound-0.41)*100) / 100
	}

	hltv := make(map[string]float64)
	for p := range teams {
		dpr := float64(totalDeaths[p]) / float64(totalRounds)

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		hltv[p] = math.Round((0.0073*kast[p]+0.3591*kpr[p]-0.5329*dpr+0.2372*impact[p]+0.0032*adr[p]+0.1587)*100) / 100
	}

	for _, pKills := range kills {
		for p, numKills := range pKills {
			switch numKills {
			case 2:
				k2[p] += 1
			case 3:
				k3[p] += 1
			case 4:
				k4[p] += 1
			case 5:
				k5[p] += 1
			}
		}
	}

	jsonstring, _ := json.MarshalIndent(&Output{
		TotalRounds:      totalRounds,
		Teams:            teams,
		Kills:            totalKills,
		Assists:          totalAssists,
		Deaths:           totalDeaths,
		Trades:           totalTimesTraded,
		HeadshotPct:      headshotPct,
		Kd:               kd,
		Kdiff:            kdiff,
		Kpr:              kpr,
		Adr:              adr,
		Kast:             kast,
		Impact:           impact,
		Hltv:             hltv,
		Rws:              rws,
		K2:               k2,
		K3:               k3,
		K4:               k4,
		K5:               k5,
		UtilDamage:       totalUtilDamage,
		FlashAssists:     totalFlashAssists,
		EnemiesFlashed:   totalEnemiesFlashed,
		TeammatesFlashed: totalTeammatesFlashed,
		Rounds:           rounds,
		HeadToHead:       h2hTotal,
		KillFeed:         headToHead,

		FlashesThrown: totalFlashesThrown,
		SmokesThrown:  totalSmokesThrown,
		MolliesThrown: totalMolliesThrown,
		HEsThrown:     totalHEsThrown,
	}, "", "  ")

	fmt.Println(string(jsonstring))
	fmt.Fprintln(os.Stderr, "Generating heatmaps...")
	GenHeatmap(points_shotsFired, header, GetHeatmapFileName(os.Args[1], "shotsFired"))
}
