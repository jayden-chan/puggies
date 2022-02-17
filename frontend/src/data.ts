/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

import { DemoType, MatchData, Stats, Team } from "./types";
import { format } from "date-fns";

export const getPlayers = (
  data: MatchData,
  side: Team,
  sortCol: keyof Stats,
  reverse: boolean
): string[] =>
  Object.keys(data.teams)
    .filter((player) => data.teams[player] === side)
    .sort((a, b) => {
      const aa = data.stats[sortCol][reverse ? a : b] ?? 0;
      const bb = data.stats[sortCol][reverse ? b : a] ?? 0;
      return aa - bb;
    });

export const msToRoundTime = (ms: number): string => {
  const seconds = Math.round(ms / 1000) % 60;
  const minutes = Math.floor(Math.round(ms / 1000) / 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const getDemoTypePretty = (demoType: DemoType): string => {
  switch (demoType) {
    case "esea":
      return "ESEA";
    case "pugsetup":
      return "PugSetup";
    case "faceit":
      return "FACEIT";
    case "steam":
      return "Valve MM";
  }
};

export const formatDate = (ts: number): string => {
  return format(ts, "EEE LLL d yyyy");
};

export const getESEAId = (matchId: string): string | undefined => {
  const [, id] = matchId.match(/esea_match_(\d+)/) ?? [];
  return id;
};
