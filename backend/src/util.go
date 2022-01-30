package main

import (
	"sort"
	"strings"
)

func MapValTotal(m *StringIntMap) int {
	sum := 0
	for _, val := range *m {
		sum += val
	}
	return sum
}

func ArrayMapTotal(a *[]StringIntMap) StringIntMap {
	ret := make(StringIntMap)
	for _, m := range *a {
		for k, v := range m {
			ret[k] += v
		}
	}
	return ret
}

func HeadToHeadTotal(h *[]map[string]map[string]Kill) map[string]StringIntMap {
	ret := make(map[string]StringIntMap)
	for _, m := range *h {
		for killer, victims := range m {
			if ret[killer] == nil {
				ret[killer] = make(StringIntMap)
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

func GetPlayers(teams map[string]string, hltv StringF64Map, side string) []string {
	ret := make([]string, 0)
	for player, team := range teams {
		if team == side {
			ret = append(ret, player)
		}
	}

	sort.Slice(ret, func(i, j int) bool {
		return hltv[ret[j]] < hltv[ret[i]]
	})

	return ret
}

func GetScore(rounds []Round, side string) int {
	score := 0
	currSide := side

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

		if round.Winner == currSide {
			score += 1
		}
	}

	return score
}

func GetDemoFileName(path string) string {
	return strings.Replace(path[strings.LastIndex(path, "/")+1:], ".dem", "", 1)
}
