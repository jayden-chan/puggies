export type Team = "T" | "CT";

export type Round = {
  winner: Team;
  winReason: number;
};

export type HeadToHead = { [key: string]: { [key: string]: number } };
export type KillFeed = { [key: string]: { [key: string]: Kill } }[];

export type Kill = {
  weapon: WeaponType;
  isHeadshot: boolean;
  attackerBlind: boolean;
  assistedFlash: boolean;
  noScope: boolean;
  throughSmoke: boolean;
  penetratedObjects: number;
};

export type RawData = {
  totalRounds: number;
  teams: { [key: string]: Team };
  kills: { [key: string]: number };
  assists: { [key: string]: number };
  deaths: { [key: string]: number };
  timesTraded: { [key: string]: number };
  headshotPct: { [key: string]: number };
  kd: { [key: string]: number };
  kdiff: { [key: string]: number };
  kpr: { [key: string]: number };
  adr: { [key: string]: number };
  kast: { [key: string]: number };
  impact: { [key: string]: number };
  hltv: { [key: string]: number };
  rws: { [key: string]: number};
  flashAssists: { [key: string]: number };
  enemiesFlashed: { [key: string]: number };
  teammatesFlashed: { [key: string]: number };
  rounds: Round[];

  flashesThrown: { [key: string]: number };
  HEsThrown: { [key: string]: number };
  molliesThrown: { [key: string]: number };
  smokesThrown: { [key: string]: number };
  utilDamage: { [key: string]: number };

  headToHead: HeadToHead;
  killFeed: KillFeed;

  "2k": { [key: string]: number };
  "3k": { [key: string]: number };
  "4k": { [key: string]: number };
  "5k": { [key: string]: number };
};

export type Match = RawData & {
  efPerFlash: { [key: string]: number };
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

enum WeaponType {
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
