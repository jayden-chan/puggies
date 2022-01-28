package main

type OpeningKill struct {
	Kill     Kill   `json:"kill"`
	Attacker string `json:"attacker"`
	Victim   string `json:"victim"`
}

type PerRoundData struct {
	kills            []StringIntMap
	deaths           []StringIntMap
	assists          []StringIntMap
	timesTraded      []StringIntMap
	headshots        []StringIntMap
	damage           []StringIntMap
	flashAssists     []StringIntMap
	enemiesFlashed   []StringIntMap
	teammatesFlashed []StringIntMap
	utilDamage       []StringIntMap
	openings         []*OpeningKill

	flashesThrown []StringIntMap
	HEsThrown     []StringIntMap
	molliesThrown []StringIntMap
	smokesThrown  []StringIntMap

	headToHead []map[string]map[string]Kill
}

type Totals struct {
	kills            StringIntMap
	deaths           StringIntMap
	assists          StringIntMap
	timesTraded      StringIntMap
	headshots        StringIntMap
	damage           StringIntMap
	flashAssists     StringIntMap
	enemiesFlashed   StringIntMap
	teammatesFlashed StringIntMap
	utilDamage       StringIntMap
	flashesThrown    StringIntMap
	hEsThrown        StringIntMap
	molliesThrown    StringIntMap
	smokesThrown     StringIntMap
	openingKills     []OpeningKill
}

func InitPerRoundData() PerRoundData {
	return PerRoundData{
		kills:            nil,
		deaths:           nil,
		assists:          nil,
		timesTraded:      nil,
		headshots:        nil,
		damage:           nil,
		flashAssists:     nil,
		enemiesFlashed:   nil,
		teammatesFlashed: nil,
		utilDamage:       nil,
		openings:         nil,
		flashesThrown:    nil,
		HEsThrown:        nil,
		molliesThrown:    nil,
		smokesThrown:     nil,
		headToHead:       nil,
	}
}

func (prd *PerRoundData) NewRound() {
	prd.kills = append(prd.kills, make(StringIntMap))
	prd.deaths = append(prd.deaths, make(StringIntMap))
	prd.assists = append(prd.assists, make(StringIntMap))
	prd.timesTraded = append(prd.timesTraded, make(StringIntMap))
	prd.headshots = append(prd.headshots, make(StringIntMap))
	prd.damage = append(prd.damage, make(StringIntMap))
	prd.flashAssists = append(prd.flashAssists, make(StringIntMap))
	prd.enemiesFlashed = append(prd.enemiesFlashed, make(StringIntMap))
	prd.teammatesFlashed = append(prd.teammatesFlashed, make(StringIntMap))
	prd.utilDamage = append(prd.utilDamage, make(StringIntMap))
	prd.openings = append(prd.openings, nil)

	prd.flashesThrown = append(prd.flashesThrown, make(StringIntMap))
	prd.HEsThrown = append(prd.HEsThrown, make(StringIntMap))
	prd.molliesThrown = append(prd.molliesThrown, make(StringIntMap))
	prd.smokesThrown = append(prd.smokesThrown, make(StringIntMap))

	prd.headToHead = append(prd.headToHead, make(map[string]map[string]Kill))
}

func (prd *PerRoundData) CropToRealRounds(startRound int) {
	prd.kills = prd.kills[startRound+1:]

	prd.deaths = prd.deaths[startRound+1:]
	prd.assists = prd.assists[startRound+1:]
	prd.timesTraded = prd.timesTraded[startRound+1:]
	prd.headshots = prd.headshots[startRound+1:]
	prd.damage = prd.damage[startRound+1:]
	prd.flashAssists = prd.flashAssists[startRound+1:]
	prd.enemiesFlashed = prd.enemiesFlashed[startRound+1:]
	prd.teammatesFlashed = prd.teammatesFlashed[startRound+1:]
	prd.utilDamage = prd.utilDamage[startRound+1:]
	prd.openings = prd.openings[startRound+1:]

	prd.flashesThrown = prd.flashesThrown[startRound+1:]
	prd.HEsThrown = prd.HEsThrown[startRound+1:]
	prd.molliesThrown = prd.molliesThrown[startRound+1:]
	prd.smokesThrown = prd.smokesThrown[startRound+1:]

	prd.headToHead = prd.headToHead[startRound+1:]
}

func (prd *PerRoundData) ComputeTotals() Totals {
	return Totals{
		kills:            ArrayMapTotal(&prd.kills),
		deaths:           ArrayMapTotal(&prd.deaths),
		assists:          ArrayMapTotal(&prd.assists),
		timesTraded:      ArrayMapTotal(&prd.timesTraded),
		headshots:        ArrayMapTotal(&prd.headshots),
		damage:           ArrayMapTotal(&prd.damage),
		flashAssists:     ArrayMapTotal(&prd.flashAssists),
		enemiesFlashed:   ArrayMapTotal(&prd.enemiesFlashed),
		teammatesFlashed: ArrayMapTotal(&prd.teammatesFlashed),
		utilDamage:       ArrayMapTotal(&prd.utilDamage),
		flashesThrown:    ArrayMapTotal(&prd.flashesThrown),
		hEsThrown:        ArrayMapTotal(&prd.HEsThrown),
		molliesThrown:    ArrayMapTotal(&prd.molliesThrown),
		smokesThrown:     ArrayMapTotal(&prd.smokesThrown),
		openingKills:     derefOpeningKillArray(prd.openings),
	}
}

func derefOpeningKillArray(openings []*OpeningKill) []OpeningKill {
	ret := make([]OpeningKill, len(openings))
	for i, k := range openings {
		// in case there was somehow no kills in the round
		if k == nil {
			ret[i] = OpeningKill{}
		} else {
			ret[i] = *k
		}
	}
	return ret
}
