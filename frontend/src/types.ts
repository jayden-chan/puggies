export const T_YELLOW = "#ead18a";
export const CT_BLUE = "#b5d4ee";

export const T_KILLFEED = "#C7A247";
export const CT_KILLFEED = "#4F9EDE";
export const RED_KILLFEED = "#800000";

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
  time: number;
  kill: Kill;
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

export type RawData = {
  totalRounds: number;
  teams: TeamsMap;
  kills: NumericMap;
  assists: NumericMap;
  deaths: NumericMap;
  timesTraded: NumericMap;
  headshotPct: NumericMap;
  kd: NumericMap;
  kdiff: NumericMap;
  kpr: NumericMap;
  adr: NumericMap;
  kast: NumericMap;
  impact: NumericMap;
  hltv: NumericMap;
  rws: NumericMap;
  flashAssists: NumericMap;
  enemiesFlashed: NumericMap;
  teammatesFlashed: NumericMap;
  rounds: Round[];

  flashesThrown: NumericMap;
  HEsThrown: NumericMap;
  molliesThrown: NumericMap;
  smokesThrown: NumericMap;
  utilDamage: NumericMap;

  headToHead: HeadToHead;
  killFeed: KillFeed;

  "2k": NumericMap;
  "3k": NumericMap;
  "4k": NumericMap;
  "5k": NumericMap;
};

export type Match = RawData & {
  efPerFlash: NumericMap;
  roundByRound: RoundByRound;
  openingKills: OpeningKill[];
  meta: {
    id: string;
    dateString: string;
    map: string;
    teamARounds: number;
    teamBRounds: number;
    teamATitle: string;
    teamBTitle: string;
  };
};
