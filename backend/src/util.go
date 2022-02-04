package main

import (
	"sort"
	"strings"
)

func MapValTotal(m *PlayerIntMap) int {
	sum := 0
	for _, val := range *m {
		sum += val
	}
	return sum
}

func ArrayMapTotal(a *[]PlayerIntMap) PlayerIntMap {
	ret := make(PlayerIntMap)
	for _, m := range *a {
		for k, v := range m {
			ret[k] += v
		}
	}
	return ret
}

func HeadToHeadTotal(h *[]map[uint64]map[uint64]Kill) map[uint64]PlayerIntMap {
	ret := make(map[uint64]PlayerIntMap)
	for _, m := range *h {
		for killer, victims := range m {
			if ret[killer] == nil {
				ret[killer] = make(PlayerIntMap)
			}

			for victim := range victims {
				ret[killer][victim] += 1
			}
		}
	}

	return ret
}

func ProcessWeaponName(name string) string {
	toReplace := [][]string{
		{"models/weapons/", ""},
		{"v_", ""},
		{"w_", ""},
		{"_dropped", ""},
		{".mdl", ""},
		{"eq_incendiarygrenade", "fire"},
		{"eq_molotov", "fire"},
		{"eq_molotovgrenade", "fire"},
	}

	ret := name
	for _, s := range toReplace {
		ret = strings.Replace(ret, s[0], s[1], 1)
	}
	return ret
}

func GetPlayers(teams TeamsMap, playerNames NamesMap, hltv PlayerF64Map, side string) []string {
	ids := make([]uint64, 0)
	ret := make([]string, 0)
	for player, team := range teams {
		if team == side {
			ids = append(ids, player)
		}
	}

	sort.Slice(ids, func(i, j int) bool {
		return hltv[ids[j]] < hltv[ids[i]]
	})

	for _, id := range ids {
		ret = append(ret, playerNames[id])
	}

	return ret
}

func GetScore(rounds []Round, side string, toRound int) (int, string) {
	score := 0
	currSide := side
	roundSide := ""

	// We will iterate the array backwards since the `side`
	// parameter is for which side the team finished on
	for i := len(rounds); i > 0; i-- {
		round := rounds[i-1]

		// Switch sides at half time and during overtime
		if i == 15 || (i > 30 && (i-3)%6 == 0) {
			if currSide == "T" {
				currSide = "CT"
			} else {
				currSide = "T"
			}
		}

		if i-1 < toRound {
			if roundSide == "" {
				roundSide = currSide
			}

			if round.Winner == currSide {
				score += 1
			}
		}

	}

	return score, roundSide
}

func GetDemoFileName(path string) string {
	return strings.Replace(path[strings.LastIndex(path, "/")+1:], ".dem", "", 1)
}
