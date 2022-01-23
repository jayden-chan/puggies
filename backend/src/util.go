package main

import (
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
