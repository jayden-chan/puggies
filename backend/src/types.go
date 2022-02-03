package main

type StringIntMap map[string]int
type StringF64Map map[string]float64
type KillFeed []map[string]map[string]Kill

type MetaData struct {
	Map        string `json:"map"`
	Id         string `json:"id"`
	TeamAScore int    `json:"teamAScore"`
	TeamBScore int    `json:"teamBScore"`
	TeamATitle string `json:"teamATitle"`
	TeamBTitle string `json:"teamBTitle"`
}

type Stats struct {
	Adr              StringF64Map `json:"adr"`
	Assists          StringIntMap `json:"assists"`
	Deaths           StringIntMap `json:"deaths"`
	EnemiesFlashed   StringIntMap `json:"enemiesFlashed"`
	FlashAssists     StringIntMap `json:"flashAssists"`
	FlashesThrown    StringIntMap `json:"flashesThrown"`
	HEsThrown        StringIntMap `json:"HEsThrown"`
	HeadshotPct      StringF64Map `json:"headshotPct"`
	Hltv             StringF64Map `json:"hltv"`
	Impact           StringF64Map `json:"impact"`
	Kast             StringF64Map `json:"kast"`
	Kd               StringF64Map `json:"kd"`
	Kdiff            StringIntMap `json:"kdiff"`
	Kills            StringIntMap `json:"kills"`
	Kpr              StringF64Map `json:"kpr"`
	MolliesThrown    StringIntMap `json:"molliesThrown"`
	Rws              StringF64Map `json:"rws"`
	SmokesThrown     StringIntMap `json:"smokesThrown"`
	TeammatesFlashed StringIntMap `json:"teammatesFlashed"`
	Trades           StringIntMap `json:"timesTraded"`
	UtilDamage       StringIntMap `json:"utilDamage"`
	EFPerFlash       StringF64Map `json:"efPerFlash"`

	// Can't name these 2k, 3k etc because identifiers can't start with
	// numbers in Go
	// "lul" - Tom
	K2 StringIntMap `json:"2k"`
	K3 StringIntMap `json:"3k"`
	K4 StringIntMap `json:"4k"`
	K5 StringIntMap `json:"5k"`
}

type Output struct {
	TotalRounds  int               `json:"totalRounds"`
	Teams        map[string]string `json:"teams"`
	StartTeams   map[string]string `json:"startTeams"`
	Rounds       []Round           `json:"rounds"`
	OpeningKills []OpeningKill     `json:"openingKills"`

	Meta  MetaData `json:"meta"`
	Stats Stats    `json:"stats"`

	HeadToHead   map[string]StringIntMap `json:"headToHead"`
	KillFeed     KillFeed                `json:"killFeed"`
	RoundByRound []RoundOverview         `json:"roundByRound"`
}

type Round struct {
	Winner          string `json:"winner"`
	Reason          int    `json:"winReason"`
	Planter         string `json:"planter"`
	Defuser         string `json:"defuser"`
	PlanterTime     int64  `json:"planterTime"`
	DefuserTime     int64  `json:"defuserTime"`
	BombExplodeTime int64  `json:"bombExplodeTime"`
}

type Kill struct {
	Weapon            string `json:"weapon"`
	Assister          string `json:"assister"`
	Time              int64  `json:"timeMs"`
	IsHeadshot        bool   `json:"isHeadshot"`
	AttackerBlind     bool   `json:"attackerBlind"`
	AssistedFlash     bool   `json:"assistedFlash"`
	NoScope           bool   `json:"noScope"`
	ThroughSmoke      bool   `json:"throughSmoke"`
	PenetratedObjects int    `json:"penetratedObjects"`
}

type Death struct {
	KilledBy    string  `json:"killedBy"`
	TimeOfDeath float64 `json:"timeOfDeath"`
}

type RoundEvent struct {
	Kind string `json:"kind"`
	Time int64  `json:"time"`

	// kind == kill
	Killer string `json:"killer,omitempty"`
	Victim string `json:"victim,omitempty"`
	Kill   *Kill  `json:"kill,omitempty"`

	// kind == plant
	Planter string `json:"planter,omitempty"`

	// kind == defuse
	Defuser string `json:"defuser,omitempty"`
}

type RoundOverview struct {
	TeamAScore int          `json:"teamAScore"`
	TeamBScore int          `json:"teamBScore"`
	TeamASide  string       `json:"teamASide"`
	TeamBSide  string       `json:"teamBSide"`
	Events     []RoundEvent `json:"events"`
}
