package main

// Go doesn't have generics LMAO this is cringe

func filterByLiveRoundsInt(data []PlayerIntMap, isLive []bool) []PlayerIntMap {
	var ret []PlayerIntMap
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i])
		}
	}
	return ret
}

func filterByLiveRoundsOpeningKill(data []*OpeningKill, isLive []bool) []*OpeningKill {
	var ret []*OpeningKill
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i])
		}
	}
	return ret
}

func filterByLiveRoundsH2H(data []map[uint64]map[uint64]Kill, isLive []bool) []map[uint64]map[uint64]Kill {
	var ret []map[uint64]map[uint64]Kill
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i])
		}
	}
	return ret
}

func filterByLiveRoundsRounds(data []Round, isLive []bool) []Round {
	var ret []Round
	for i, live := range isLive {
		if live {
			ret = append(ret, data[i])
		}
	}
	return ret
}

func filterByLiveRoundsWinners(data [][]uint64, isLive []bool) [][]uint64 {
	var ret [][]uint64
	for i, live := range isLive {
		if live {
			if data[i] == nil {
				panic("FATAL: Found live round with winners = nil. " +
					"This is a bug. Please report it at " +
					GitHubLink + "/issues/new",
				)
			}

			retI := make([]uint64, len(data[i]))
			copy(retI, data[i])
			ret = append(ret, retI)
		}
	}
	return ret
}
