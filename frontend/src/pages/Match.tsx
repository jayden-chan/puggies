import {
  Box,
  Link,
  Flex,
  Heading,
  Text,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";

export type Team = "T" | "CT";

export type Round = {
  winner: Team;
  winReason: number;
};

export type Data = {
  totalRounds: number;
  teams: { [key: string]: Team };
  kills: { [key: string]: number };
  assists: { [key: string]: number };
  deaths: { [key: string]: number };
  headshotPct: { [key: string]: number };
  kd: { [key: string]: number };
  kdiff: { [key: string]: number };
  kpr: { [key: string]: number };
  adr: { [key: string]: number };
  kast: { [key: string]: number };
  impact: { [key: string]: number };
  hltv: { [key: string]: number };
  flashAssists: { [key: string]: number };
  enemiesFlashed: { [key: string]: number };
  teammatesFlashed: { [key: string]: number };
  rounds: Round[];

  flashesThrown: { [key: string]: number };
  HEsThrown: { [key: string]: number };
  molliesThrown: { [key: string]: number };
  smokesThrown: { [key: string]: number };
  utilDamage: { [key: string]: number };

  "2k": { [key: string]: number };
  "3k": { [key: string]: number };
  "4k": { [key: string]: number };
  "5k": { [key: string]: number };
};

const UtilTable = (props: { data: Data; players: string[]; title: string }) => (
  <Table variant="simple">
    <Thead>
      <Tr>
        <Th>{props.title}</Th>
        <Th>Smokes Thrown</Th>
        <Th>Molotovs Thrown</Th>
        <Th>HE Grenades</Th>
        <Th>Flashes Thrown</Th>
        <Th>Enemies Blinded</Th>
        <Th>Teammates Blinded</Th>
        <Th>Enemies Blind per Flash</Th>
        <Th>Flash Assists</Th>
        <Th>Utility Damage</Th>
      </Tr>
    </Thead>
    <Tbody>
      {props.players.map((player) => {
        const ef = props.data.enemiesFlashed[player] ?? 0;
        const tf = props.data.teammatesFlashed[player] ?? 0;
        const numFlashes = props.data.flashesThrown[player] ?? 0;

        return (
          <Tr>
            <Td>{player}</Td>
            <Td>{props.data.smokesThrown[player] ?? 0}</Td>
            <Td>{props.data.molliesThrown[player] ?? 0}</Td>
            <Td>{props.data.HEsThrown[player] ?? 0}</Td>
            <Td>{numFlashes}</Td>
            <Td>{ef}</Td>
            <Td>{tf}</Td>
            <Td>
              {numFlashes === 0 ? 0 : Math.round((ef / numFlashes) * 100) / 100}
            </Td>
            <Td>{props.data.flashAssists[player] ?? 0}</Td>
            <Td>{props.data.utilDamage[player] ?? 0}</Td>
          </Tr>
        );
      })}
    </Tbody>
  </Table>
);

const ScoreTable = (props: {
  data: Data;
  players: string[];
  title: string;
}) => (
  <Table variant="simple">
    <Thead>
      <Tr>
        <Th>{props.title}</Th>
        <Th>K</Th>
        <Th>A</Th>
        <Th>D</Th>
        <Th>K/D</Th>
        <Th>K-D</Th>
        <Th>K/R</Th>
        <Th>ADR</Th>
        <Th>HS %</Th>
        <Th>2K</Th>
        <Th>3K</Th>
        <Th>4K</Th>
        <Th>5K</Th>
        <Th>HLTV 2.0</Th>
        <Th>Impact</Th>
        <Th>KAST</Th>
      </Tr>
    </Thead>
    <Tbody>
      {props.players.map((player) => (
        <Tr>
          <Td>{player}</Td>
          <Td>{props.data.kills[player] ?? 0}</Td>
          <Td>{props.data.assists[player] ?? 0}</Td>
          <Td>{props.data.deaths[player] ?? 0}</Td>
          <Td>{props.data.kd[player] ?? 0}</Td>
          <Td>{props.data.kdiff[player] ?? 0}</Td>
          <Td>{props.data.kpr[player] ?? 0}</Td>
          <Td>{props.data.adr[player] ?? 0}</Td>
          <Td>{props.data.headshotPct[player] ?? 0}%</Td>
          <Td>{props.data["2k"][player] ?? 0}</Td>
          <Td>{props.data["3k"][player] ?? 0}</Td>
          <Td>{props.data["4k"][player] ?? 0}</Td>
          <Td>{props.data["5k"][player] ?? 0}</Td>
          <Td>{props.data.hltv[player] ?? 0}</Td>
          <Td>{props.data.impact[player] ?? 0}</Td>
          <Td>{props.data.kast[player] ?? 0}%</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);

export const Match = (props: { data: Data }) => {
  const { data } = props;

  const teamARounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "T").length +
    data.rounds.slice(15).filter((r) => r.winner === "CT").length;
  const teamBRounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "CT").length +
    data.rounds.slice(15).filter((r) => r.winner === "T").length;

  const teamA = Object.keys(data.teams)
    .filter((player) => data.teams[player] === "CT")
    .sort((a, b) => data.hltv[b] - data.hltv[a]);

  const teamB = Object.keys(data.teams)
    .filter((player) => data.teams[player] === "T")
    .sort((a, b) => data.hltv[b] - data.hltv[a]);

  const teamATitle = `team_${teamA[0]}`;
  const teamBTitle = `team_${teamB[0]}`;

  return (
    <Flex
      w="100%"
      h="100vh"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box w="80%" mb={3}>
        <Heading>pug on de_nuke </Heading>
        <Heading fontSize="lg" as="h2">
          Sat Jan 15 2021{" "}
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
        <Heading mx={2}>:</Heading>
        <Heading mx={2}>{teamBRounds}</Heading>
        <Text mx={5} as="h2" fontSize="xl">
          {teamBTitle}
        </Text>
      </Flex>

      <Tabs w="80%">
        <TabList>
          <Tab>Scoreboard</Tab>
          <Tab>Utility</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ScoreTable title={teamATitle} data={data} players={teamA} />
            <Box my={5} />
            <ScoreTable title={teamBTitle} data={data} players={teamB} />
          </TabPanel>
          <TabPanel>
            <UtilTable title={teamATitle} data={data} players={teamA} />
            <Box my={5} />
            <UtilTable title={teamBTitle} data={data} players={teamB} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
