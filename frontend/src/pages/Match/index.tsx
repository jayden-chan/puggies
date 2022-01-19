import {
  Box,
  Flex,
  Heading,
  Link,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
} from "@chakra-ui/react";
import { format, parse } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";
import { Data } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { RoundsVisualization } from "./RoundsVisualization";

type TableSchema = {
  key: keyof Data;
  title: string;
  label?: string;
  minW?: string;
  pct?: boolean;
}[];

const utilTableSchema: TableSchema = [
  { key: "name", title: "Player", minW: "150px" },
  { key: "smokesThrown", title: "Smokes", label: "# of smokes thrown" },
  { key: "molliesThrown", title: "Molotovs", label: "# of molotovs thrown" },
  { key: "HEsThrown", title: "HE", label: "# of HE grenades thrown" },
  { key: "flashesThrown", title: "Flashes", label: "# of flashes thrown" },
  { key: "flashAssists", title: "FA", label: "Flash Assists" },
  { key: "utilDamage", title: "UD", label: "Utility Damage" },
  { key: "enemiesFlashed", title: "Enemies Blinded" },
  { key: "teammatesFlashed", title: "Teammates Blinded" },
  { key: "efPerFlash", title: "Enemies Blind per Flash" },
];

const scoreTableSchema: TableSchema = [
  { key: "name", title: "Player", minW: "150px" },
  { key: "kills", title: "K", label: "Kills" },
  { key: "assists", title: "A", label: "Assists" },
  { key: "deaths", title: "D", label: "Deaths" },
  { key: "timesTraded", title: "T", label: "# of times traded" },
  { key: "kd", title: "K/D", label: "Kill/death ratio" },
  { key: "kdiff", title: "K-D", label: "Kill-death difference" },
  { key: "kpr", title: "K/R", label: "Kills per round" },
  { key: "adr", title: "ADR", label: "Average damage per round" },
  {
    key: "headshotPct",
    title: "HS %",
    label: "Headshot kill percentage",
    pct: true,
  },
  { key: "2k", title: "2K" },
  { key: "3k", title: "3K" },
  { key: "4k", title: "4K" },
  { key: "5k", title: "5K" },
  { key: "hltv", title: "HLTV 2.0", label: "Approximate HLTV 2.0 rating" },
  { key: "impact", title: "Impact", label: "Approximate HLTV Impact rating" },
  {
    key: "kast",
    title: "KAST",
    pct: true,
    label: "% of rounds with kill/assist/survived/traded",
  },
];

const StatTable = (props: {
  data: Data;
  players: string[];
  schema: TableSchema;
}) => {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          {props.schema.map((r) => (
            <Th key={r.title}>
              {r.label ? <Tooltip label={r.label}>{r.title}</Tooltip> : r.title}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {props.players.map((player) => (
          <Tr key={player}>
            {props.schema.map((col) => {
              return (
                <Td minW={col.minW ?? "unset"}>
                  {/* @ts-ignore */}
                  {props.data[col.key][player] ?? 0}
                  {col.pct === true ? "%" : ""}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export const Match = (props: { data: Data }) => {
  const { data } = props;
  const { id = "" } = useParams();

  const [match, map, date] = id.match(/^pug_(.*?)_(\d\d\d\d-\d\d-\d\d)/) ?? [];
  if (!match) {
    return <></>;
  }

  const dateString = format(
    parse(date, "yyyy-MM-dd", new Date()),
    "EEE MMM dd yyyy"
  );

  const teamARounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "T").length +
    data.rounds.slice(15).filter((r) => r.winner === "CT").length;
  const teamBRounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "CT").length +
    data.rounds.slice(15).filter((r) => r.winner === "T").length;

  const teamAPlayers = Object.keys(data.teams)
    .filter((player) => data.teams[player] === "CT")
    .sort((a, b) => data.hltv[b] - data.hltv[a]);

  const teamBPlayers = Object.keys(data.teams)
    .filter((player) => data.teams[player] === "T")
    .sort((a, b) => data.hltv[b] - data.hltv[a]);

  const teamATitle = `team_${teamAPlayers[0]}`;
  const teamBTitle = `team_${teamBPlayers[0]}`;

  return (
    <Flex w="100%" h="100vh" pt={30} alignItems="center" flexDirection="column">
      <Box w="80%" mb={3}>
        <Heading>pug on {map} </Heading>
        <Heading fontSize="lg" as="h2">
          {dateString}{" "}
          <Link href="https://drive.google.com/file/d/1nwOuFzF42yhw4FXLNxpa2V3_hNFsZvrP/view">
            {/* FIXME */}
            (demo link)
          </Link>
        </Heading>
      </Box>

      <Flex w="80%" alignItems="center" justifyContent="center">
        <Text mx={5} as="h2" fontSize="xl">
          {teamATitle}
        </Text>
        <Heading mx={2}>{teamARounds}</Heading>
        <Heading mx={1}>:</Heading>
        <Heading mx={2}>{teamBRounds}</Heading>
        <Text mx={5} as="h2" fontSize="xl">
          {teamBTitle}
        </Text>
      </Flex>

      <Tabs w="80%">
        <TabList>
          <Tab>Scoreboard</Tab>
          <Tab>Utility</Tab>
          <Tab>Head to Head</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <StatTable
              schema={scoreTableSchema}
              data={data}
              players={teamAPlayers}
            />
            <RoundsVisualization data={data} />
            <StatTable
              schema={scoreTableSchema}
              data={data}
              players={teamBPlayers}
            />
          </TabPanel>
          <TabPanel>
            <StatTable
              schema={utilTableSchema}
              data={data}
              players={teamAPlayers}
            />
            <Box my={5} />
            <StatTable
              schema={utilTableSchema}
              data={data}
              players={teamBPlayers}
            />
          </TabPanel>
          <TabPanel>
            <Flex alignItems="center" justifyContent="center">
              <HeadToHeadTable
                teams={[teamAPlayers, teamBPlayers]}
                headToHead={data.headToHead}
              />
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
