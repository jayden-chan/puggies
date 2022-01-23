package main

import (
	"strings"
)

func MapValTotal(m *map[string]int) int {
	sum := 0
	for _, val := range *m {
		sum += val
	}
	return sum
}

func ArrayMapTotal(a *[]map[string]int) map[string]int {
	ret := make(map[string]int)
	for _, m := range *a {
		for k, v := range m {
			ret[k] += v
		}
	}
	return ret
}

func HeadToHeadTotal(h *[]map[string]map[string]Kill) map[string]map[string]int {
	ret := make(map[string]map[string]int)
	for _, m := range *h {
		for killer, victims := range m {
			if ret[killer] == nil {
				ret[killer] = make(map[string]int)
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
		[]string{"models/weapons/", ""},
		[]string{"v_", ""},
		[]string{"w_", ""},
		[]string{"_dropped", ""},
		[]string{".mdl", ""},
		[]string{"eq_incendiarygrenade", "fire"},
		[]string{"eq_molotov", "fire"},
		[]string{"eq_molotovgrenade", "fire"},
	}

	ret := name
	for _, s := range toReplace {
		ret = strings.Replace(ret, s[0], s[1], 1)
	}
	return ret
}
