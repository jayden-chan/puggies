package main

import (
	"path/filepath"
	"sort"
	"strings"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
)

func join(elem ...string) string {
	return filepath.Join(elem...)
}

func normalizeFolderPath(path string) string {
	if strings.HasSuffix(path, "/") {
		return path[:len(path)-1]
	}
	return path
}

func mapValTotal(m *PlayerIntMap) int {
	sum := 0
	for _, val := range *m {
		sum += val
	}
	return sum
}

func arrayMapTotal(a *[]PlayerIntMap) PlayerIntMap {
	ret := make(PlayerIntMap)
	for _, m := range *a {
		for k, v := range m {
			ret[k] += v
		}
	}
	return ret
}

func headToHeadTotal(h *[]map[uint64]map[uint64]Kill) map[uint64]PlayerIntMap {
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

func processWeaponName(w common.Equipment) string {
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

	originalString := w.OriginalString
	if originalString == "" {
		return getWeaponFileName(w.Type)
	}

	for _, s := range toReplace {
		originalString = strings.Replace(originalString, s[0], s[1], 1)
	}
	return originalString
}

func getPlayers(teams TeamsMap, playerNames NamesMap, hltv PlayerF64Map, side string) []string {
	ids := make([]uint64, 0)
	ret := make([]string, 0)
	for player, team := range teams {
		if team == side {
			ids = append(ids, player)
		}
	}

	sort.SliceStable(ids, func(i, j int) bool {
		return hltv[ids[j]] < hltv[ids[i]]
	})

	for _, id := range ids {
		ret = append(ret, playerNames[id])
	}

	return ret
}

func getScore(rounds []Round, endSide string, toRound int) (int, string) {
	score := 0
	currSide := endSide
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

func getDemoFileName(path string) string {
	return strings.Replace(path[strings.LastIndex(path, "/")+1:], ".dem", "", 1)
}

func getDemoType(demoFileName string) string {
	if strings.HasPrefix(demoFileName, "esea") {
		return "esea"
	} else if strings.HasPrefix(demoFileName, "pug_") {
		return "pugsetup"
	} else if strings.HasPrefix(demoFileName, "1-") {
		return "faceit"
	} else {
		return "steam"
	}
}

func getTeamName(
	clanTag string,
	teams TeamsMap,
	playerNames NamesMap,
	hltv PlayerF64Map,
	side string,
) string {
	if clanTag != "" {
		return clanTag
	}
	return "team_" + getPlayers(teams, playerNames, hltv, side)[0]
}

// better hope that everyone doesn't have the same first letter of their name!
func stripPlayerPrefixes(teams TeamsMap, playerNames *NamesMap, side string) {
Outer:
	for {
		var char byte = 0
		for player, team := range teams {
			if team != side {
				continue
			}

			first := (*playerNames)[player][0]
			if char == 0 {
				char = first
				continue
			}

			if first != char {
				break Outer
			}
		}

		for player, team := range teams {
			if team == side {
				(*playerNames)[player] = (*playerNames)[player][1:]
			}
		}
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

func getWeaponFileName(weapon common.EquipmentType) string {
	switch weapon {
	case common.EqP2000:
		return "pist_hkp2000"
	case common.EqGlock:
		return "pist_glock18"
	case common.EqP250:
		return "pist_p250"
	case common.EqDeagle:
		return "pist_deagle"
	case common.EqFiveSeven:
		return "pist_fiveseven"
	case common.EqDualBerettas:
		return "pist_elite"
	case common.EqTec9:
		return "pist_tec9"
	case common.EqCZ:
		return "pist_cz75a"
	case common.EqUSP:
		return "pist_223"
	case common.EqRevolver:
		return "pist_revolver"
	case common.EqMP7:
		return "smg_mp7"
	case common.EqMP9:
		return "smg_mp9"
	case common.EqBizon:
		return "smg_bizon"
	case common.EqMac10:
		return "smg_mac10"
	case common.EqUMP:
		return "smg_ump45"
	case common.EqP90:
		return "smg_p90"
	case common.EqMP5:
		return "smg_mp5sd"
	case common.EqSawedOff:
		return "shot_sawedoff"
	case common.EqNova:
		return "shot_nova"
	case common.EqMag7:
		return "shot_mag7"
	case common.EqXM1014:
		return "shot_xm1014"
	case common.EqM249:
		return "mach_m249"
	case common.EqNegev:
		return "mach_negev"
	case common.EqGalil:
		return "rif_galilar"
	case common.EqFamas:
		return "rif_famas"
	case common.EqAK47:
		return "rif_ak47"
	case common.EqM4A4:
		return "rif_m4a1"
	case common.EqM4A1:
		return "rif_m4a1_s"
	case common.EqSSG08:
		return "snip_ssg08"
	case common.EqSG553:
		return "rif_sg556"
	case common.EqAUG:
		return "rif_aug"
	case common.EqAWP:
		return "snip_awp"
	case common.EqScar20:
		return "snip_scar20"
	case common.EqG3SG1:
		return "snip_g3sg1"
	case common.EqZeus:
		return "eq_taser"
	case common.EqMolotov:
		return "eq_molotov"
	case common.EqIncendiary:
		return "eq_molotov"
	case common.EqHE:
		return "eq_fraggrenade"
	}

	return "UNKNOWN"
}
