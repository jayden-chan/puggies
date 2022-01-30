const { format, parse } = require("date-fns");
const { readFileSync, writeFileSync } = require("fs");

const getPlayers = (data, side, sortCol, reverse) =>
  Object.keys(data.teams)
    .filter((player) => data.teams[player] === side)
    .sort((a, b) => {
      const aa = data[sortCol][reverse ? a : b] ?? 0;
      const bb = data[sortCol][reverse ? b : a] ?? 0;
      return aa - bb;
    });

const getScore = (rounds, team, toRound) => {
  return (
    rounds
      .slice(0, toRound > 15 ? 15 : toRound)
      .filter((r) => r.winner !== team).length +
    rounds
      .slice(15, toRound <= 15 ? 15 : toRound)
      .filter((r) => r.winner === team).length
  );
};

const processData = (info, rawData) => {
  const [regex, map, date] =
    info.id.match(/^pug_(.*?)_(\d\d\d\d-\d\d-\d\d)/) ?? [];
  if (!regex) {
    throw new Error("Failed to extract map/date from match id");
  }

  const dateParsed = parse(date, "yyyy-MM-dd", new Date());
  const dateString = format(dateParsed, "EEE MMM dd yyyy");

  const teamARounds = getScore(rawData.rounds, "CT", 30);
  const teamBRounds = getScore(rawData.rounds, "T", 30);

  const teamATitle = `team_${getPlayers(rawData, "CT", "hltv", false)[0]}`;
  const teamBTitle = `team_${getPlayers(rawData, "T", "hltv", false)[0]}`;

  return {
    ...rawData,
    meta: {
      ...info,
      dateString,
      dateTimestamp: dateParsed.valueOf(),
      map,
      teamARounds,
      teamBRounds,
      teamATitle,
      teamBTitle,
    },
    roundByRound: rawData.killFeed.map((k, i) => {
      const roundInfo = rawData.rounds[i];
      const teamAScore = getScore(rawData.rounds, "CT", i + 1);
      const teamBScore = getScore(rawData.rounds, "T", i + 1);
      const kills = Object.entries(k)
        .map(([killer, kills]) =>
          Object.entries(kills).map(([victim, kill]) => ({
            kind: "kill",
            killer,
            victim,
            time: kill.timeMs,
            kill,
          }))
        )
        .flat();

      const plant =
        roundInfo.planter === ""
          ? []
          : [
              {
                kind: "plant",
                planter: roundInfo.planter,
                time: roundInfo.planterTime,
              },
            ];

      const defuse =
        roundInfo.defuser === ""
          ? []
          : [
              {
                kind: "defuse",
                defuser: roundInfo.defuser,
                time: roundInfo.defuserTime,
              },
            ];

      const explode =
        roundInfo.bombExplodeTime === 0
          ? []
          : [
              {
                kind: "bomb_explode",
                time: roundInfo.bombExplodeTime,
              },
            ];

      return {
        teamAScore,
        teamBScore,
        events: [kills, plant, defuse, explode]
          .flat()
          .sort((a, b) => a.time - b.time),
      };
    }),
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

const id = process.argv[2];

const processed = processData(
  {
    id,
  },
  JSON.parse(readFileSync(process.argv[3], { encoding: "utf-8" }))
);

writeFileSync(`./${id}.json`, JSON.stringify(processed));
writeFileSync(
  `./${id}-meta.json`,
  JSON.stringify({
    id,
    ...processed.meta,
  })
);
