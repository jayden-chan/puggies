/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

package main

import (
	"os"

	r2 "github.com/golang/geo/r2"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
	metadata "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/metadata"
)

func getOutputFilesList(path, heatmapsDir string) map[string]string {
	heatmapsDir = normalizeFolderPath(heatmapsDir)
	return map[string]string{
		"heatmapShotsFired": join(heatmapsDir, getHeatmapFileName(path, "shotsFired")),
	}
}

func parseDemo(path, heatmapsDir string, config Config, logger *Logger) (Output, error) {
	outputFiles := getOutputFilesList(path, heatmapsDir)

	f, err := os.Open(path)
	if err != nil {
		return Output{}, err
	}

	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	header, err := p.ParseHeader()
	if err != nil {
		return Output{}, err
	}

	mapMetadata := metadata.MapNameToMap[header.MapName]
	demoFileName := getDemoFileName(path)
	demoType := getDemoType(demoFileName)
	demoTime := getDemoTime(demoFileName)

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
				Weapon:            processWeaponName(*e.Weapon),
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

			// logger.Debugf("%s <%s> -> %s (%d HP)\n", e.Attacker.Name, e.Weapon, e.Player.Name, e.HealthDamageTaken)

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
				logger.DebugBig("NOT LIVE")
				consecutiveMatchStarts += 1
			} else {
				prd.isLive[len(prd.isLive)-1] = true
				isLive = true
				logger.DebugBig("GOING LIVE")
				consecutiveMatchStarts = 0
			}
		}
	})

	// Create a new 'round' map in each of the stats arrays
	p.RegisterEventHandler(func(e events.RoundStart) {
		logger.DebugBig("ROUND START")
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
		logger.DebugBig("SIDE SWITCH")
		updateTeams(&p, &teams, &ctClanTag, &tClanTag)
	})

	p.RegisterEventHandler(func(e events.RoundEnd) {
		logger.Debug(e)
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

	logger.Infof("demo=%s parsing demo", demoFileName)
	err = p.ParseToEnd()
	if err != nil {
		return Output{}, err
	}

	logger.Infof("demo=%s computing stats", demoFileName)

	if eseaMode {
		stripPlayerPrefixes(teams, &playerNames, "CT")
		stripPlayerPrefixes(teams, &playerNames, "T")
	}

	prd.CropToRealRounds(eseaMode)
	totals := prd.ComputeTotals()
	totalRounds := len(prd.kills)

	headshotPct, kd, kdiff, kpr := computeBasicStats(
		totalRounds,
		totals.kills,
		totals.headshots,
		totals.deaths,
	)

	kast := computeKAST(totalRounds, teams, prd.kills, prd.assists, prd.deaths, prd.deathsTraded)
	adr := computeADR(totalRounds, totals.damage)
	impact := computeImpact(totalRounds, teams, totals.assists, kpr)
	k2, k3, k4, k5 := computeMultikills(prd.kills)
	oKills, oDeaths, oAttempts, oAttemptsPct, oSuccess := computeOpenings(totals.openingKills)

	hltv := computeHLTV(
		totalRounds,
		teams,
		totals.deaths,
		kast,
		kpr,
		impact,
		adr,
	)

	teamAScore, _ := getScore(prd.rounds, "CT", 999999999)
	teamBScore, _ := getScore(prd.rounds, "T", 999999999)

	matchData := MatchData{
		TotalRounds: totalRounds,
		Teams:       teams,
		StartTeams:  computeStartSides(teams, prd.rounds),
		Rounds:      prd.rounds,

		Stats: Stats{
			Adr:                adr,
			Assists:            totals.assists,
			Deaths:             totals.deaths,
			EFPerFlash:         computeEFPerFlash(totals.flashesThrown, totals.enemiesFlashed),
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
			Rws:                computeRWS(prd.winners, prd.rounds, prd.damage),
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

		HeadToHead:   headToHeadTotal(&prd.headToHead),
		KillFeed:     prd.headToHead,
		RoundByRound: computeRoundByRound(prd.rounds, prd.headToHead),
		OpeningKills: totals.openingKills,
	}

	output := Output{
		Meta: MetaData{
			Map:           header.MapName,
			Id:            demoFileName,
			Date:          demoTime.Format("Mon Jan 2 2006"),
			DateTimestamp: demoTime.UnixMilli(),
			DemoType:      demoType,
			PlayerNames:   playerNames,
			TeamAScore:    teamAScore,
			TeamBScore:    teamBScore,
			TeamATitle:    getTeamName(ctClanTag, teams, playerNames, hltv, "CT"),
			TeamBTitle:    getTeamName(tClanTag, teams, playerNames, hltv, "T"),
		},
		MatchData: matchData,
	}

	if err != nil {
		return Output{}, err
	}

	logger.Infof("demo=%s generating heatmaps", demoFileName)
	err = genHeatmap(points_shotsFired, header, outputFiles["heatmapShotsFired"], join(config.assetsPath, "minimaps"))
	if err != nil {
		return Output{}, err
	}

	return output, nil
}
