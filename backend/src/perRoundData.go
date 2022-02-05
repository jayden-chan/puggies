package main

type OpeningKill struct {
	Kill     Kill   `json:"kill"`
	Attacker uint64 `json:"attacker,string"`
	Victim   uint64 `json:"victim,string"`
}

type PerRoundData struct {
	kills            []PlayerIntMap
	deaths           []PlayerIntMap
	assists          []PlayerIntMap
	deathsTraded     []PlayerIntMap
	tradeKills       []PlayerIntMap
	headshots        []PlayerIntMap
	damage           []PlayerIntMap
	flashAssists     []PlayerIntMap
	enemiesFlashed   []PlayerIntMap
	teammatesFlashed []PlayerIntMap
	utilDamage       []PlayerIntMap
	openings         []*OpeningKill

	flashesThrown []PlayerIntMap
	HEsThrown     []PlayerIntMap
	molliesThrown []PlayerIntMap
	smokesThrown  []PlayerIntMap

	headToHead []map[uint64]map[uint64]Kill

	isLive []bool
}

type Totals struct {
	kills            PlayerIntMap
	deaths           PlayerIntMap
	assists          PlayerIntMap
	deathsTraded     PlayerIntMap
	tradeKills       PlayerIntMap
	headshots        PlayerIntMap
	damage           PlayerIntMap
	flashAssists     PlayerIntMap
	enemiesFlashed   PlayerIntMap
	teammatesFlashed PlayerIntMap
	utilDamage       PlayerIntMap
	flashesThrown    PlayerIntMap
	hEsThrown        PlayerIntMap
	molliesThrown    PlayerIntMap
	smokesThrown     PlayerIntMap
	openingKills     []OpeningKill
}

func InitPerRoundData() PerRoundData {
	return PerRoundData{
		kills:            nil,
		deaths:           nil,
		assists:          nil,
		deathsTraded:     nil,
		tradeKills:       nil,
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
		isLive:           nil,
	}
}

func (prd *PerRoundData) NewRound(isLive bool) {
	prd.kills = append(prd.kills, make(PlayerIntMap))
	prd.deaths = append(prd.deaths, make(PlayerIntMap))
	prd.assists = append(prd.assists, make(PlayerIntMap))
	prd.deathsTraded = append(prd.deathsTraded, make(PlayerIntMap))
	prd.tradeKills = append(prd.tradeKills, make(PlayerIntMap))
	prd.headshots = append(prd.headshots, make(PlayerIntMap))
	prd.damage = append(prd.damage, make(PlayerIntMap))
	prd.flashAssists = append(prd.flashAssists, make(PlayerIntMap))
	prd.enemiesFlashed = append(prd.enemiesFlashed, make(PlayerIntMap))
	prd.teammatesFlashed = append(prd.teammatesFlashed, make(PlayerIntMap))
	prd.utilDamage = append(prd.utilDamage, make(PlayerIntMap))
	prd.openings = append(prd.openings, nil)

	prd.flashesThrown = append(prd.flashesThrown, make(PlayerIntMap))
	prd.HEsThrown = append(prd.HEsThrown, make(PlayerIntMap))
	prd.molliesThrown = append(prd.molliesThrown, make(PlayerIntMap))
	prd.smokesThrown = append(prd.smokesThrown, make(PlayerIntMap))

	prd.headToHead = append(prd.headToHead, make(map[uint64]map[uint64]Kill))

	prd.isLive = append(prd.isLive, isLive)
}

func filterByLiveRoundsInt(data []PlayerIntMap, isLive []bool) []PlayerIntMap {
	var ret []PlayerIntMap
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i-1])
		}
	}
	return ret
}

func filterByLiveRoundsOpeningKill(data []*OpeningKill, isLive []bool) []*OpeningKill {
	var ret []*OpeningKill
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i-1])
		}
	}
	return ret
}

func filterByLiveRoundsH2H(data []map[uint64]map[uint64]Kill, isLive []bool) []map[uint64]map[uint64]Kill {
	var ret []map[uint64]map[uint64]Kill
	for i, live := range isLive {
		if live {
			// FIXME: this is probably wrong
			ret = append(ret, data[i-1])
		}
	}
	return ret
}

func (prd *PerRoundData) CropToRealRounds(startRound int, useLiveMode bool) {
	if useLiveMode {
		prd.kills = filterByLiveRoundsInt(prd.kills, prd.isLive)

		prd.deaths = filterByLiveRoundsInt(prd.deaths, prd.isLive)
		prd.assists = filterByLiveRoundsInt(prd.assists, prd.isLive)
		prd.deathsTraded = filterByLiveRoundsInt(prd.deathsTraded, prd.isLive)
		prd.tradeKills = filterByLiveRoundsInt(prd.tradeKills, prd.isLive)
		prd.headshots = filterByLiveRoundsInt(prd.headshots, prd.isLive)
		prd.damage = filterByLiveRoundsInt(prd.damage, prd.isLive)
		prd.flashAssists = filterByLiveRoundsInt(prd.flashAssists, prd.isLive)
		prd.enemiesFlashed = filterByLiveRoundsInt(prd.enemiesFlashed, prd.isLive)
		prd.teammatesFlashed = filterByLiveRoundsInt(prd.teammatesFlashed, prd.isLive)
		prd.utilDamage = filterByLiveRoundsInt(prd.utilDamage, prd.isLive)
		prd.openings = filterByLiveRoundsOpeningKill(prd.openings, prd.isLive)

		prd.flashesThrown = filterByLiveRoundsInt(prd.flashesThrown, prd.isLive)
		prd.HEsThrown = filterByLiveRoundsInt(prd.HEsThrown, prd.isLive)
		prd.molliesThrown = filterByLiveRoundsInt(prd.molliesThrown, prd.isLive)
		prd.smokesThrown = filterByLiveRoundsInt(prd.smokesThrown, prd.isLive)

		prd.headToHead = filterByLiveRoundsH2H(prd.headToHead, prd.isLive)
	} else {
		prd.kills = prd.kills[startRound+1:]

		prd.deaths = prd.deaths[startRound+1:]
		prd.assists = prd.assists[startRound+1:]
		prd.deathsTraded = prd.deathsTraded[startRound+1:]
		prd.tradeKills = prd.tradeKills[startRound+1:]
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
}

func (prd *PerRoundData) ComputeTotals() Totals {
	return Totals{
		kills:            ArrayMapTotal(&prd.kills),
		deaths:           ArrayMapTotal(&prd.deaths),
		assists:          ArrayMapTotal(&prd.assists),
		deathsTraded:     ArrayMapTotal(&prd.deathsTraded),
		tradeKills:       ArrayMapTotal(&prd.tradeKills),
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
