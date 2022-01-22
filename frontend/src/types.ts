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
  weapon: WeaponType;
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
  name: { [key: string]: string };
  meta: {
    demoLink: string;
    id: string;
    dateString: string;
    map: string;
    teamARounds: number;
    teamBRounds: number;
    teamATitle: string;
    teamBTitle: string;
  };
};

export enum WeaponType {
  Unknown = 0,
  P2000 = 1,
  Glock = 2,
  P250 = 3,
  Deagle = 4,
  FiveSeven = 5,
  DualBerettas = 6,
  Tec9 = 7,
  CZ = 8,
  USP = 9,
  Revolver = 10,
  MP7 = 101,
  MP9 = 102,
  Bizon = 103,
  Mac10 = 104,
  UMP = 105,
  P90 = 106,
  MP5 = 107,
  SawedOff = 201,
  Nova = 202,
  Mag7 = 203,
  Swag7 = 203,
  XM1014 = 204,
  M249 = 205,
  Negev = 206,
  Galil = 301,
  Famas = 302,
  AK47 = 303,
  M4A4 = 304,
  M4A1 = 305,
  Scout = 306,
  SSG08 = 306,
  SG556 = 307,
  SG553 = 307,
  AUG = 308,
  AWP = 309,
  Scar20 = 310,
  G3SG1 = 311,
  Zeus = 401,
  Kevlar = 402,
  Helmet = 403,
  Bomb = 404,
  Knife = 405,
  DefuseKit = 406,
  World = 407,
  Decoy = 501,
  Molotov = 502,
  Incendiary = 503,
  Flash = 504,
  Smoke = 505,
  HE = 506,
}
