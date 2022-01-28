import { RawData, Round, Team } from "./types";

export const getPlayers = (
  data: RawData,
  side: Team,
  sortCol: keyof RawData,
  reverse: boolean
): string[] =>
  Object.keys(data.teams)
    .filter((player) => data.teams[player] === side)
    .sort((a, b) => {
      // @ts-ignore
      const aa = data[sortCol][reverse ? a : b] ?? 0;
      // @ts-ignore
      const bb = data[sortCol][reverse ? b : a] ?? 0;
      return aa - bb;
    });

export const getScore = (
  rounds: Round[],
  team: Team,
  toRound: number
): number => {
  return (
    rounds
      .slice(0, toRound > 15 ? 15 : toRound)
      .filter((r) => r.winner !== team).length +
    rounds
      .slice(15, toRound <= 15 ? 15 : toRound)
      .filter((r) => r.winner === team).length
  );
};

export const msToRoundTime = (ms: number): string => {
  const seconds = Math.round(ms / 1000) % 60;
  const minutes = Math.floor(Math.round(ms / 1000) / 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const demoLinks: { [key: string]: string } = {
  "pug_de_overpass_2022-01-25_05":
    "https://drive.google.com/file/d/1cu06v4aGRCNfuiizK2b_G2ywUm4eHKSD/view?usp=sharing",
  "pug_de_nuke_2022-01-25_04":
    "https://drive.google.com/file/d/1AWmtqa4eCBBMrb4f2eaAoyy_rGMLT94z/view?usp=sharing",
  "pug_de_mirage_2022-01-15_06":
    "https://drive.google.com/file/d/12pxs1BvM5z20XPdznlTbG54EAqMhYfNo/view?usp=sharing",
  "pug_de_nuke_2022-01-15_05":
    "https://drive.google.com/file/d/1nwOuFzF42yhw4FXLNxpa2V3_hNFsZvrP/view?usp=sharing",
};
