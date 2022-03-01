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
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	"github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
)

func join(elem ...string) string {
	return filepath.Join(elem...)
}

// if the path ends in one of these extensions it's probably a file.
// this is just used for the 404 route so we don't serve up the React
// frontend in the case of a 404 when fetching a file (we only want to
// serve the frontend when there's a 404 on a plain route like /match/my_match_id
func isLikelyFile(path string) bool {
	return strings.HasSuffix(path, ".png") ||
		strings.HasSuffix(path, ".webp") ||
		strings.HasSuffix(path, ".jpeg") ||
		strings.HasSuffix(path, ".jpg") ||
		strings.HasSuffix(path, ".gif") ||
		strings.HasSuffix(path, ".json") ||
		strings.HasSuffix(path, ".xml") ||
		strings.HasSuffix(path, ".mp3") ||
		strings.HasSuffix(path, ".mp4") ||
		strings.HasSuffix(path, ".tar.gz") ||
		strings.HasSuffix(path, ".zip") ||
		strings.HasSuffix(path, ".txt")
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
		{"cz75a", "cz75"},
		{"cz_75", "cz75"},
		{"m249para", "m249"},
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

func getScore(rounds []Round, endSide string, toRound, halfLength int) (int, string) {
	score := 0
	currSide := endSide
	roundSide := ""

	// We will iterate the array backwards since the `side`
	// parameter is for which side the team finished on
	for i := len(rounds); i > 0; i-- {
		round := rounds[i-1]

		// Switch sides at half time and during overtime
		//
		// We will assume that overtime for short matches is 3 rounds per half,
		// I've never actually seen a short match with overtime so who knows if this
		// condition will ever even be triggered
		if i == halfLength || (i > halfLength*2 && (i-3)%6 == 0) {
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

var (
	DateRegex1 = regexp.MustCompile(`(\d\d\d\d)-(\d\d)-(\d\d)`)
	DateRegex2 = regexp.MustCompile(`(\d\d\d\d)_(\d\d)_(\d\d)`)
	DateRegex3 = regexp.MustCompile(`(\d\d\d\d)/(\d\d)/(\d\d)`)
)

func getDemoTime(config Config, logger *Logger, demoFileName string) time.Time {
	matches := DateRegex1.FindStringSubmatch(demoFileName)
	if matches == nil {
		matches = DateRegex2.FindStringSubmatch(demoFileName)
	}

	if matches == nil {
		matches = DateRegex3.FindStringSubmatch(demoFileName)
	}

	defaultTime := time.Now()
	if matches != nil {
		// TODO: should probably come back to this and be a
		// little smarter about which matched field is the day
		// and which is the month
		loc, err := time.LoadLocation(config.timezone)
		if err != nil {
			logger.Errorf("failed to load timezone: %s", err.Error())
			return defaultTime
		}

		time, err := time.ParseInLocation("2006-01-02", matches[1]+"-"+matches[2]+"-"+matches[3], loc)
		if err != nil {
			logger.Errorf("failed to parse time: %s", err.Error())
			return defaultTime
		}

		return time
	}

	return defaultTime
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
	return "team_" + strings.ReplaceAll(getPlayers(teams, playerNames, hltv, side)[0], " ", "_")
}

func unBotify(steamId uint64) uint64 {
	// We will use an invalid steam id to represent bot accounts. This is a pretty
	// egregious hack but honestly I am just too lazy to implement a proper type-safe
	// fix for this
	if steamId == 0 {
		// https://developer.valvesoftware.com/wiki/SteamID
		// 0000000100000000000000000000000100000111111000100101111101000011
		return 72057598465171267
	}
	return steamId
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

func updateTeams(
	p *dem.Parser,
	teams *TeamsMap,
	ctClanTag, tClanTag *string,
	leavers map[uint64]uint64,
) {
	// If the teams have custom names we will use those
	tTag := (*p).GameState().TeamTerrorists().ClanName()
	ctTag := (*p).GameState().TeamCounterTerrorists().ClanName()

	if tTag != "" && ctTag != "" {
		*tClanTag = tTag
		*ctClanTag = ctTag
	}

	for _, player := range (*p).GameState().Participants().All() {
		if !player.IsConnected {
			continue
		}

		playerId := unBotify(player.SteamID64)

		switch player.Team {
		case common.TeamSpectators:
			delete(*teams, playerId)
		case common.TeamUnassigned:
			delete(*teams, playerId)
		case common.TeamCounterTerrorists:
			(*teams)[playerId] = "CT"
		case common.TeamTerrorists:
			(*teams)[playerId] = "T"
		}
	}

	for leaver, teammate := range leavers {
		(*teams)[unBotify(leaver)] = (*teams)[unBotify(teammate)]
	}
}

func updatePlayerNames(p *dem.Parser, playerNames *NamesMap) {
	for _, player := range (*p).GameState().Participants().Playing() {
		if player.IsBot {
			(*playerNames)[unBotify(player.SteamID64)] = "BOT " + player.Name
		} else {
			(*playerNames)[unBotify(player.SteamID64)] = player.Name
		}
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
