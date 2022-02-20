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

export const T_YELLOW = "#ead18a";
export const CT_BLUE = "#b5d4ee";
export const TEAM_COLORS_MAP = {
  T: T_YELLOW,
  CT: CT_BLUE,
};

export const T_KILLFEED = "#C7A247";
export const CT_KILLFEED = "#4F9EDE";
export const RED_KILLFEED = "#800000";
export const GRAY_KILLFEED = "#999999";
export const KILLFEED_COLORS_MAP = {
  T: T_KILLFEED,
  CT: CT_KILLFEED,
};

export type Team = "T" | "CT";
export const INVERT_TEAM = {
  T: "CT" as Team,
  CT: "T" as Team,
};

export type Round = {
  winner: Team;
  winReason: number;
  planter: string;
  defuser: string;
  planterTime: number;
  defuserTime: number;
  bombExplodeTime: number;
};

export type HeadToHead = { [key: string]: { [key: string]: number } };
export type KillFeed = { [key: string]: { [key: string]: Kill } }[];
export type TeamsMap = { [key: string]: Team };
export type PlayerNames = { [key: string]: string };
export type NumericMap = { [key: string]: number };

export type OpeningKill = {
  kill: Kill;
  attacker: string;
  victim: string;
};

export type KillEvent = {
  kind: "kill";
  killer: string;
  victim: string;
  kill: Kill;
  time: number;
};

export type PlantEvent = {
  kind: "plant";
  planter: string;
  time: number;
};

export type DefuseEvent = {
  kind: "defuse";
  defuser: string;
  time: number;
};

export type BombExplodeEvent = {
  kind: "bomb_explode";
  time: number;
};

export type RoundEvent =
  | KillEvent
  | PlantEvent
  | DefuseEvent
  | BombExplodeEvent;

export type RoundByRound = {
  teamAScore: number;
  teamBScore: number;
  teamASide: Team;
  teamBSide: Team;
  events: RoundEvent[];
}[];

export type Kill = {
  weapon: string;
  assister: string;
  timeMs: number;
  isHeadshot: boolean;
  attackerBlind: boolean;
  assistedFlash: boolean;
  noScope: boolean;
  throughSmoke: boolean;
  penetratedObjects: number;
  attackerLocation: string;
  victimLocation: string;
};

export type DemoType = "esea" | "pugsetup" | "faceit" | "steam";

export type UserMeta = {
  demoLink?: string;
};

export type MatchInfo = {
  id: string;
  map: string;
  dateTimestamp: number;
  demoType: DemoType;
  playerNames: { [key: string]: string };
  teamAScore: number;
  teamBScore: number;
  teamATitle: string;
  teamBTitle: string;
};

export type MatchData = {
  totalRounds: number;
  teams: TeamsMap;
  startTeams: TeamsMap;
  rounds: Round[];
  halfLength: number;
  openingKills: OpeningKill[];

  stats: Stats;

  headToHead: HeadToHead;
  killFeed: KillFeed;
  roundByRound: RoundByRound;
};

export type Match = {
  meta: MatchInfo;
  matchData: MatchData;
};

export type Stats = {
  HEsThrown: NumericMap;
  adr: NumericMap;
  assists: NumericMap;
  deaths: NumericMap;
  deathsTraded: NumericMap;
  efPerFlash: NumericMap;
  enemiesFlashed: NumericMap;
  flashAssists: NumericMap;
  flashesThrown: NumericMap;
  headshotPct: NumericMap;
  hltv: NumericMap;
  impact: NumericMap;
  kast: NumericMap;
  kd: NumericMap;
  kdiff: NumericMap;
  kills: NumericMap;
  kpr: NumericMap;
  molliesThrown: NumericMap;
  openingAttempts: NumericMap;
  openingAttemptsPct: NumericMap;
  openingDeaths: NumericMap;
  openingKills: NumericMap;
  openingSuccess: NumericMap;
  rws: NumericMap;
  smokesThrown: NumericMap;
  teammatesFlashed: NumericMap;
  tradeKills: NumericMap;
  utilDamage: NumericMap;

  "2k": NumericMap;
  "3k": NumericMap;
  "4k": NumericMap;
  "5k": NumericMap;
};
