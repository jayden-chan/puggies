package main

type StringIntMap map[string]int
type StringF64Map map[string]float64

type Output struct {
	TotalRounds      int               `json:"totalRounds"`
	Teams            map[string]string `json:"teams"`
	Kills            StringIntMap      `json:"kills"`
	Assists          StringIntMap      `json:"assists"`
	Deaths           StringIntMap      `json:"deaths"`
	Trades           StringIntMap      `json:"timesTraded"`
	HeadshotPct      StringF64Map      `json:"headshotPct"`
	Kd               StringF64Map      `json:"kd"`
	Kdiff            StringIntMap      `json:"kdiff"`
	Kpr              StringF64Map      `json:"kpr"`
	Adr              StringF64Map      `json:"adr"`
	Kast             StringF64Map      `json:"kast"`
	Impact           StringF64Map      `json:"impact"`
	Hltv             StringF64Map      `json:"hltv"`
	Rws              StringF64Map      `json:"rws"`
	UtilDamage       StringIntMap      `json:"utilDamage"`
	FlashAssists     StringIntMap      `json:"flashAssists"`
	EnemiesFlashed   StringIntMap      `json:"enemiesFlashed"`
	TeammatesFlashed StringIntMap      `json:"teammatesFlashed"`
	Rounds           []Round           `json:"rounds"`

	HeadToHead map[string]StringIntMap      `json:"headToHead"`
	KillFeed   []map[string]map[string]Kill `json:"killFeed"`

	FlashesThrown StringIntMap `json:"flashesThrown"`
	SmokesThrown  StringIntMap `json:"smokesThrown"`
	MolliesThrown StringIntMap `json:"molliesThrown"`
	HEsThrown     StringIntMap `json:"HEsThrown"`

	// Can't name these 2k, 3k etc because identifiers can't start with
	// numbers in Go
	// "lul" - Tom
	K2 StringIntMap `json:"2k"`
	K3 StringIntMap `json:"3k"`
	K4 StringIntMap `json:"4k"`
	K5 StringIntMap `json:"5k"`
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
