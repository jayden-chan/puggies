package main

type StringIntMap map[string]int
type StringF64Map map[string]float64
type PlayerIntMap map[uint64]int
type PlayerF64Map map[uint64]float64
type KillFeed []map[uint64]map[uint64]Kill
type TeamsMap map[uint64]string
type NamesMap map[uint64]string

type MetaData struct {
	Map         string   `json:"map"`
	Id          string   `json:"id"`
	PlayerNames NamesMap `json:"playerNames"`
	TeamAScore  int      `json:"teamAScore"`
	TeamBScore  int      `json:"teamBScore"`
	TeamATitle  string   `json:"teamATitle"`
	TeamBTitle  string   `json:"teamBTitle"`
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

type Output struct {
	TotalRounds  int           `json:"totalRounds"`
	Teams        TeamsMap      `json:"teams"`
	StartTeams   TeamsMap      `json:"startTeams"`
	Rounds       []Round       `json:"rounds"`
	OpeningKills []OpeningKill `json:"openingKills"`

	Meta  MetaData `json:"meta"`
	Stats Stats    `json:"stats"`

	HeadToHead   map[uint64]PlayerIntMap `json:"headToHead"`
	KillFeed     KillFeed                `json:"killFeed"`
	RoundByRound []RoundOverview         `json:"roundByRound"`
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
