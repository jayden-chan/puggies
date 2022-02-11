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
