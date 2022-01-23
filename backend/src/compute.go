package main

import (
	"math"

	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
)

func ComputeRWS(
	winners [][]string,
	rounds []Round,
	damage []StringIntMap,
) StringF64Map {
	totalRounds := len(rounds)
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

	return rws
}

// returns headshotPct, kd, kdiff, kpr
func ComputeBasicStats(
	totalRounds int,
	totalKills StringIntMap,
	totalHeadshots StringIntMap,
	totalDeaths StringIntMap,
) (StringF64Map, StringF64Map, StringIntMap, StringF64Map) {
	// Compute headshot percentages, K/D & K-D etc
	kd := make(StringF64Map)
	kdiff := make(StringIntMap)
	kpr := make(StringF64Map)
	headshotPct := make(StringF64Map)
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
	teams map[string]string,
	kills []StringIntMap,
	assists []StringIntMap,
	deaths []StringIntMap,
	timesTraded []StringIntMap,
) StringF64Map {
	kast := make(StringF64Map)
	for i := 0; i < totalRounds; i++ {
		for p := range teams {
			// KAST
			if kills[i][p] != 0 ||
				assists[i][p] != 0 ||
				deaths[i][p] == 0 ||
				timesTraded[i][p] != 0 {
				kast[p] += 1 / float64(totalRounds)
			}
		}
	}

	for k, v := range kast {
		kast[k] = math.Round(v * 100)
	}

	return kast
}

func ComputeADR(totalRounds int, totalDamage StringIntMap) StringF64Map {
	adr := make(StringF64Map)
	for player, playerDamage := range totalDamage {
		adr[player] = math.Round((float64(playerDamage) / float64(totalRounds)))
	}
	return adr
}

func ComputImpact(
	totalRounds int,
	teams map[string]string,
	totalAssists StringIntMap,
	kpr StringF64Map,
) StringF64Map {
	impact := make(StringF64Map)
	for p := range teams {
		assistsPerRound := (float64(totalAssists[p]) / float64(totalRounds))

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		impact[p] = math.Round((2.13*kpr[p]+0.42*assistsPerRound-0.41)*100) / 100
	}

	return impact
}

func ComputeHLTV(
	totalRounds int,
	teams map[string]string,
	totalDeaths StringIntMap,
	kast StringF64Map,
	kpr StringF64Map,
	impact StringF64Map,
	adr StringF64Map,
) StringF64Map {
	hltv := make(StringF64Map)
	for p := range teams {
		dpr := float64(totalDeaths[p]) / float64(totalRounds)

		// https://flashed.gg/posts/reverse-engineering-hltv-rating/
		hltv[p] = math.Round((0.0073*kast[p]+0.3591*kpr[p]-0.5329*dpr+0.2372*impact[p]+0.0032*adr[p]+0.1587)*100) / 100
	}

	return hltv
}

func ComputMultikills(kills []StringIntMap) (StringIntMap, StringIntMap, StringIntMap, StringIntMap) {
	k2 := make(StringIntMap)
	k3 := make(StringIntMap)
	k4 := make(StringIntMap)
	k5 := make(StringIntMap)

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
