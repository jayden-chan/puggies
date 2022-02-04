package main

import (
	"math"
	"sort"

	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
)

func ComputeRWS(
	winners [][]uint64,
	rounds []Round,
	damage []PlayerIntMap,
) PlayerF64Map {
	totalRounds := len(rounds)
	rws := make(map[uint64]float64)
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

	return rws
}

// returns headshotPct, kd, kdiff, kpr
func ComputeBasicStats(
	totalRounds int,
	totalKills PlayerIntMap,
	totalHeadshots PlayerIntMap,
	totalDeaths PlayerIntMap,
) (PlayerF64Map, PlayerF64Map, PlayerIntMap, PlayerF64Map) {
	// Compute headshot percentages, K/D & K-D etc
	kd := make(PlayerF64Map)
	kdiff := make(PlayerIntMap)
	kpr := make(PlayerF64Map)
	headshotPct := make(PlayerF64Map)
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

	return headshotPct, kd, kdiff, kpr
}

func ComputeKAST(
	totalRounds int,
	teams map[uint64]string,
	kills []PlayerIntMap,
	assists []PlayerIntMap,
	deaths []PlayerIntMap,
	deathsTraded []PlayerIntMap,
) PlayerF64Map {
	kast := make(PlayerF64Map)
	for i := 0; i < totalRounds; i++ {
		for p := range teams {
			// KAST
			if kills[i][p] != 0 ||
				assists[i][p] != 0 ||
				deaths[i][p] == 0 ||
				deathsTraded[i][p] != 0 {
				kast[p] += 1 / float64(totalRounds)
			}
		}
	}

	for k, v := range kast {
		kast[k] = math.Round(v * 100)
	}

	return kast
}

func ComputeADR(totalRounds int, totalDamage PlayerIntMap) PlayerF64Map {
	adr := make(PlayerF64Map)
	for player, playerDamage := range totalDamage {
		adr[player] = math.Round((float64(playerDamage) / float64(totalRounds)))
	}
	return adr
}

func ComputImpact(
	totalRounds int,
	teams TeamsMap,
	totalAssists PlayerIntMap,
	kpr PlayerF64Map,
) PlayerF64Map {
	impact := make(PlayerF64Map)
	for p := range teams {
		assistsPerRound := (float64(totalAssists[p]) / float64(totalRounds))

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		impact[p] = math.Round((2.13*kpr[p]+0.42*assistsPerRound-0.41)*100) / 100
	}

	return impact
}

func ComputeHLTV(
	totalRounds int,
	teams TeamsMap,
	totalDeaths PlayerIntMap,
	kast PlayerF64Map,
	kpr PlayerF64Map,
	impact PlayerF64Map,
	adr PlayerF64Map,
) PlayerF64Map {
	hltv := make(PlayerF64Map)
	for p := range teams {
		dpr := float64(totalDeaths[p]) / float64(totalRounds)

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		hltv[p] = math.Round((0.0073*kast[p]+0.3591*kpr[p]-0.5329*dpr+0.2372*impact[p]+0.0032*adr[p]+0.1587)*100) / 100
	}

	return hltv
}

func ComputMultikills(kills []PlayerIntMap) (PlayerIntMap, PlayerIntMap, PlayerIntMap, PlayerIntMap) {
	k2 := make(PlayerIntMap)
	k3 := make(PlayerIntMap)
	k4 := make(PlayerIntMap)
	k5 := make(PlayerIntMap)

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

	return k2, k3, k4, k5
}

func ComputeEFPerFlash(flashesThrown PlayerIntMap, enemiesFlashed PlayerIntMap) PlayerF64Map {
	ret := make(PlayerF64Map)
	for player, f := range flashesThrown {
		ret[player] = math.Round((float64(enemiesFlashed[player])/float64(f))*100) / 100
	}
	return ret
}

func ComputeStartSides(teams map[uint64]string, rounds []Round) map[uint64]string {
	_, teamAStartSide := GetScore(rounds, "CT", 1)
	_, teamBStartSide := GetScore(rounds, "T", 1)
	ret := make(map[uint64]string)
	for player, team := range teams {
		if team == "CT" {
			ret[player] = teamAStartSide
		} else {
			ret[player] = teamBStartSide
		}
	}

	return ret
}

func ComputeOpenings(openingKills []OpeningKill) (
	PlayerIntMap,
	PlayerIntMap,
	PlayerIntMap,
	PlayerF64Map,
	PlayerF64Map,
) {
	numRounds := float64(len(openingKills))

	oKills := make(PlayerIntMap)
	oDeaths := make(PlayerIntMap)
	oAttempts := make(PlayerIntMap)
	oAttemptsPct := make(PlayerF64Map)
	oSuccess := make(PlayerF64Map)

	for _, openingKill := range openingKills {
		oKills[openingKill.Attacker] += 1
		oDeaths[openingKill.Victim] += 1
		oAttempts[openingKill.Attacker] += 1
		oAttempts[openingKill.Victim] += 1
		oAttemptsPct[openingKill.Attacker] += 1.0 / numRounds
		oAttemptsPct[openingKill.Victim] += 1.0 / numRounds
	}

	for player, v := range oAttemptsPct {
		oAttemptsPct[player] = math.Round(v * 100)
		oSuccess[player] = math.Round((float64(oKills[player]) / float64(oAttempts[player])) * 100)
	}

	return oKills, oDeaths, oAttempts, oAttemptsPct, oSuccess
}

func ComputeRoundByRound(rounds []Round, killFeed KillFeed) []RoundOverview {
	var ret []RoundOverview
	for i, k := range killFeed {
		roundInfo := rounds[i]
		teamAScore, teamASide := GetScore(rounds, "CT", i+1)
		teamBScore, teamBSide := GetScore(rounds, "T", i+1)
		var events []RoundEvent

		for killer, k2 := range k {
			for victim, deathInfo := range k2 {
				kill := deathInfo
				events = append(events, RoundEvent{
					Kind:   "kill",
					Killer: killer,
					Victim: victim,
					Time:   kill.Time,
					Kill:   &kill,
				})
			}
		}

		if roundInfo.Planter != 0 {
			events = append(events, RoundEvent{
				Kind:    "plant",
				Time:    roundInfo.PlanterTime,
				Planter: roundInfo.Planter,
			})
		}

		if roundInfo.Defuser != 0 {
			events = append(events, RoundEvent{
				Kind:    "defuse",
				Time:    roundInfo.DefuserTime,
				Defuser: roundInfo.Defuser,
			})
		}

		if roundInfo.BombExplodeTime != 0 {
			events = append(events, RoundEvent{
				Kind: "bomb_explode",
				Time: roundInfo.BombExplodeTime,
			})
		}

		sort.Slice(events, func(i, j int) bool {
			return events[i].Time < events[j].Time
		})

		ret = append(ret, RoundOverview{
			TeamAScore: teamAScore,
			TeamBScore: teamBScore,
			TeamASide:  teamASide,
			TeamBSide:  teamBSide,
			Events:     events,
		})
	}

	return ret
}
