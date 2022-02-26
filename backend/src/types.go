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

import "github.com/golang/geo/r2"

type User struct {
	Username    string   `json:"username"`
	DisplayName string   `json:"displayName"`
	Email       string   `json:"email"`
	Roles       []string `json:"roles"`
	SteamId     string   `json:"steamId"`
}

type UserWithPassword struct {
	User
	Password string `json:"password"`
}

type StringIntMap map[string]int
type StringF64Map map[string]float64
type PlayerIntMap map[uint64]int
type PlayerF64Map map[uint64]float64
type KillFeed []map[uint64]map[uint64]Kill
type TeamsMap map[uint64]string
type NamesMap map[uint64]string

type UserMeta struct {
	DemoLink string `json:"demoLink"`
}

type MetaData struct {
	Map           string   `json:"map"`
	Id            string   `json:"id"`
	DateTimestamp int64    `json:"dateTimestamp"`
	DemoType      string   `json:"demoType"`
	PlayerNames   NamesMap `json:"playerNames"`
	TeamAScore    int      `json:"teamAScore"`
	TeamBScore    int      `json:"teamBScore"`
	TeamATitle    string   `json:"teamATitle"`
	TeamBTitle    string   `json:"teamBTitle"`
}

type Match struct {
	Meta      MetaData              `json:"meta"`
	MatchData MatchData             `json:"matchData"`
	HeatMaps  map[string][]r2.Point `json:"heatmaps"`
}

type MatchData struct {
	TotalRounds  int                     `json:"totalRounds"`
	Teams        TeamsMap                `json:"teams"`
	StartTeams   TeamsMap                `json:"startTeams"`
	Rounds       []Round                 `json:"rounds"`
	HalfLength   int                     `json:"halfLength"`
	OpeningKills []OpeningKill           `json:"openingKills"`
	HeadToHead   map[uint64]PlayerIntMap `json:"headToHead"`
	KillFeed     KillFeed                `json:"killFeed"`
	RoundByRound []RoundOverview         `json:"roundByRound"`
	Stats        Stats                   `json:"stats"`
}

type Stats struct {
	Adr                PlayerF64Map `json:"adr"`
	Assists            PlayerIntMap `json:"assists"`
	Deaths             PlayerIntMap `json:"deaths"`
	EFPerFlash         PlayerF64Map `json:"efPerFlash"`
	EnemiesFlashed     PlayerIntMap `json:"enemiesFlashed"`
	FlashAssists       PlayerIntMap `json:"flashAssists"`
	FlashesThrown      PlayerIntMap `json:"flashesThrown"`
	HEsThrown          PlayerIntMap `json:"HEsThrown"`
	HeadshotPct        PlayerF64Map `json:"headshotPct"`
	Hltv               PlayerF64Map `json:"hltv"`
	Impact             PlayerF64Map `json:"impact"`
	Kast               PlayerF64Map `json:"kast"`
	Kd                 PlayerF64Map `json:"kd"`
	Kdiff              PlayerIntMap `json:"kdiff"`
	Kills              PlayerIntMap `json:"kills"`
	Kpr                PlayerF64Map `json:"kpr"`
	MolliesThrown      PlayerIntMap `json:"molliesThrown"`
	OpeningAttempts    PlayerIntMap `json:"openingAttempts"`
	OpeningAttemptsPct PlayerF64Map `json:"openingAttemptsPct"`
	OpeningDeaths      PlayerIntMap `json:"openingDeaths"`
	OpeningKills       PlayerIntMap `json:"openingKills"`
	OpeningSuccess     PlayerF64Map `json:"openingSuccess"`
	Rws                PlayerF64Map `json:"rws"`
	SmokesThrown       PlayerIntMap `json:"smokesThrown"`
	TeammatesFlashed   PlayerIntMap `json:"teammatesFlashed"`
	DeathsTraded       PlayerIntMap `json:"deathsTraded"`
	TradeKills         PlayerIntMap `json:"tradeKills"`
	UtilDamage         PlayerIntMap `json:"utilDamage"`

	// Can't name these 2k, 3k etc because identifiers can't start with
	// numbers in Go
	// "lul" - Tom
	K2 PlayerIntMap `json:"2k"`
	K3 PlayerIntMap `json:"3k"`
	K4 PlayerIntMap `json:"4k"`
	K5 PlayerIntMap `json:"5k"`
}

type Round struct {
	Winner          string `json:"winner"`
	Reason          int    `json:"winReason"`
	Planter         uint64 `json:"planter,string"`
	Defuser         uint64 `json:"defuser,string"`
	PlanterTime     int64  `json:"planterTime"`
	DefuserTime     int64  `json:"defuserTime"`
	BombExplodeTime int64  `json:"bombExplodeTime"`
}

type Kill struct {
	Weapon            string `json:"weapon"`
	Assister          uint64 `json:"assister,string"`
	Time              int64  `json:"timeMs"`
	IsHeadshot        bool   `json:"isHeadshot"`
	AttackerBlind     bool   `json:"attackerBlind"`
	AssistedFlash     bool   `json:"assistedFlash"`
	NoScope           bool   `json:"noScope"`
	ThroughSmoke      bool   `json:"throughSmoke"`
	PenetratedObjects int    `json:"penetratedObjects"`
	AttackerLocation  string `json:"attackerLocation"`
	VictimLocation    string `json:"victimLocation"`
}

type Death struct {
	KilledBy    uint64  `json:"killedBy,string"`
	TimeOfDeath float64 `json:"timeOfDeath"`
}

type RoundEvent struct {
	Kind string `json:"kind"`
	Time int64  `json:"time"`

	// kind == kill
	Killer uint64 `json:"killer,omitempty,string"`
	Victim uint64 `json:"victim,omitempty,string"`
	Kill   *Kill  `json:"kill,omitempty"`

	// kind == plant
	Planter uint64 `json:"planter,omitempty,string"`

	// kind == defuse
	Defuser uint64 `json:"defuser,omitempty,string"`
}

type RoundOverview struct {
	TeamAScore int          `json:"teamAScore"`
	TeamBScore int          `json:"teamBScore"`
	TeamASide  string       `json:"teamASide"`
	TeamBSide  string       `json:"teamBSide"`
	Events     []RoundEvent `json:"events"`
}
