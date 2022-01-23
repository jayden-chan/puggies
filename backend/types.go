package main

type Output struct {
	TotalRounds      int                `json:"totalRounds"`
	Teams            map[string]string  `json:"teams"`
	Kills            map[string]int     `json:"kills"`
	Assists          map[string]int     `json:"assists"`
	Deaths           map[string]int     `json:"deaths"`
	Trades           map[string]int     `json:"timesTraded"`
	HeadshotPct      map[string]float64 `json:"headshotPct"`
	Kd               map[string]float64 `json:"kd"`
	Kdiff            map[string]int     `json:"kdiff"`
	Kpr              map[string]float64 `json:"kpr"`
	Adr              map[string]float64 `json:"adr"`
	Kast             map[string]float64 `json:"kast"`
	Impact           map[string]float64 `json:"impact"`
	Hltv             map[string]float64 `json:"hltv"`
	Rws              map[string]float64 `json:"rws"`
	UtilDamage       map[string]int     `json:"utilDamage"`
	FlashAssists     map[string]int     `json:"flashAssists"`
	EnemiesFlashed   map[string]int     `json:"enemiesFlashed"`
	TeammatesFlashed map[string]int     `json:"teammatesFlashed"`
	Rounds           []Round            `json:"rounds"`

	HeadToHead map[string]map[string]int    `json:"headToHead"`
	KillFeed   []map[string]map[string]Kill `json:"killFeed"`

	FlashesThrown map[string]int `json:"flashesThrown"`
	SmokesThrown  map[string]int `json:"smokesThrown"`
	MolliesThrown map[string]int `json:"molliesThrown"`
	HEsThrown     map[string]int `json:"HEsThrown"`

	// Can't name these 2k, 3k etc because identifiers can't start with
	// numbers in Go
	// "lul" - Tom
	K2 map[string]int `json:"2k"`
	K3 map[string]int `json:"3k"`
	K4 map[string]int `json:"4k"`
	K5 map[string]int `json:"5k"`
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
