import { format, parse } from "date-fns";
import { Match, RawData, Team } from "./types";
import pug_de_mirage_2022_01_15 from "./matchData/pug_de_mirage_2022-01-15_06.json";
import pug_de_nuke_2022_01_15 from "./matchData/pug_de_nuke_2022-01-15_05.json";

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

const processData = (
  info: { demoLink: string; id: string },
  rawData: RawData
): Match => {
  const [regex, map, date] =
    info.id.match(/^pug_(.*?)_(\d\d\d\d-\d\d-\d\d)/) ?? [];
  if (!regex) {
    throw new Error("Failed to map data");
  }

  const dateString = format(
    parse(date, "yyyy-MM-dd", new Date()),
    "EEE MMM dd yyyy"
  );

  const teamARounds =
    rawData.rounds.slice(0, 15).filter((r) => r.winner === "T").length +
    rawData.rounds.slice(15).filter((r) => r.winner === "CT").length;
  const teamBRounds =
    rawData.rounds.slice(0, 15).filter((r) => r.winner === "CT").length +
    rawData.rounds.slice(15).filter((r) => r.winner === "T").length;

  const teamATitle = `team_${getPlayers(rawData, "CT", "hltv", false)[0]}`;
  const teamBTitle = `team_${getPlayers(rawData, "T", "hltv", false)[0]}`;

  return {
    ...rawData,
    meta: {
      ...info,
      dateString,
      map,
      teamARounds,
      teamBRounds,
      teamATitle,
      teamBTitle,
    },
    name: Object.fromEntries(Object.keys(rawData.teams).map((p) => [p, p])),
    efPerFlash: Object.fromEntries(
      Object.entries(rawData.flashesThrown).map(([player, flashes]) => {
        return [
          player,
          Math.round(((rawData.enemiesFlashed[player] ?? 0) / flashes) * 100) /
            100,
        ];
      })
    ),
  };
};

export const data = [
  {
    info: {
      demoLink:
        "https://drive.google.com/file/d/12pxs1BvM5z20XPdznlTbG54EAqMhYfNo/view?usp=sharing",
      id: "pug_de_mirage_2022-01-15_05",
    },
    // @ts-ignore
    rawData: pug_de_mirage_2022_01_15 as RawData,
  },
  {
    info: {
      demoLink:
        "https://drive.google.com/file/d/1nwOuFzF42yhw4FXLNxpa2V3_hNFsZvrP/view?usp=sharing",
      id: "pug_de_nuke_2022-01-15_05",
    },
    // @ts-ignore
    rawData: pug_de_nuke_2022_01_15 as RawData,
  },
].map((m) => processData(m.info, m.rawData));
