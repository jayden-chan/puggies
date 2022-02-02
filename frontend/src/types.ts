import { MatchInfo } from "./api";

export const T_YELLOW = "#ead18a";
export const CT_BLUE = "#b5d4ee";
export const TEAM_COLORS_MAP = {
  T: T_YELLOW,
  CT: CT_BLUE,
};

export const T_KILLFEED = "#C7A247";
export const CT_KILLFEED = "#4F9EDE";
export const RED_KILLFEED = "#800000";
export const KILLFEED_COLORS_MAP = {
  T: T_KILLFEED,
  CT: CT_KILLFEED,
};

export type Team = "T" | "CT";

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

export type RoundByRound = {
  teamAScore: number;
  teamBScore: number;
  teamASide: Team;
  teamBSide: Team;
  events: (KillEvent | PlantEvent | DefuseEvent | BombExplodeEvent)[];
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
};

export type Match = {
  totalRounds: number;
  teams: TeamsMap;
  rounds: Round[];
  openingKills: OpeningKill[];

  meta: MatchInfo;

  stats: Stats;

  headToHead: HeadToHead;
  killFeed: KillFeed;
  roundByRound: RoundByRound;
};

export type Stats = {
  adr: NumericMap;
  assists: NumericMap;
  deaths: NumericMap;
  enemiesFlashed: NumericMap;
  flashAssists: NumericMap;
  flashesThrown: NumericMap;
  HEsThrown: NumericMap;
  headshotPct: NumericMap;
  hltv: NumericMap;
  impact: NumericMap;
  kast: NumericMap;
  kd: NumericMap;
  kdiff: NumericMap;
  kills: NumericMap;
  kpr: NumericMap;
  molliesThrown: NumericMap;
  rws: NumericMap;
  smokesThrown: NumericMap;
  teammatesFlashed: NumericMap;
  timesTraded: NumericMap;
  utilDamage: NumericMap;
  efPerFlash: NumericMap;

  "2k": NumericMap;
  "3k": NumericMap;
  "4k": NumericMap;
  "5k": NumericMap;
};
