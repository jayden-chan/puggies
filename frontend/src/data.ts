import { format, parse } from "date-fns";
import { Match, Stats, Team } from "./types";

export const getPlayers = (
  data: Match,
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

export const getDateInfo = (id: string): [string, number] => {
  const [regex, date] = id.match(/(\d\d\d\d-\d\d-\d\d)/) ?? [];
  if (!regex) {
    throw new Error("Failed to extract map/date from match id");
  }

  const dateParsed = parse(date, "yyyy-MM-dd", new Date());
  const dateString = format(dateParsed, "EEE MMM dd yyyy");
  return [dateString, dateParsed.valueOf()];
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
