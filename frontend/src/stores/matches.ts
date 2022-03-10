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

import create from "zustand";
import { api } from "../api";
import { MatchInfo } from "../types";

type MatchesStore = {
  matches: MatchInfo[] | undefined;
  numMatches: number;
  clearMatches: () => void;
  fetchMatches: (limit: number, offset: number) => Promise<void>;
  fetchNumMatches: () => Promise<void>;
};

export const useMatchesStore = create<MatchesStore>((set) => ({
  matches: [],
  numMatches: 0,
  clearMatches: () => set({ matches: [] }),
  fetchMatches: async (limit: number, offset: number) => {
    const matches = await api().matches(limit, offset);
    set({ matches });
  },
  fetchNumMatches: async () => {
    const numMatches = await api().numMatches();
    set({ numMatches });
  },
}));
