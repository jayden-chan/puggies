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

const UtilTable = (props: { data: Data; players: string[]; title: string }) => (
  <Table variant="simple" size="sm">
    <Thead>
      {/* prettier-ignore */}
      <Tr>
        <Th>{props.title}</Th>
        <Th><Tooltip label="# of smokes thrown">S</Tooltip></Th>
        <Th><Tooltip label="# of molotovs thrown">M</Tooltip></Th>
        <Th><Tooltip label="# of HE grenades thrown">HE</Tooltip></Th>
        <Th><Tooltip label="# of flashes thrown">F</Tooltip></Th>
        <Th><Tooltip label="Flash Assists">FA</Tooltip></Th>
        <Th><Tooltip label="Utility Damage">UD</Tooltip></Th>
        <Th>Enemies Blinded</Th>
        <Th>Teammates Blinded</Th>
        <Th>Enemies Blind per Flash</Th>
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
            <Td>{props.data.flashAssists[player] ?? 0}</Td>
            <Td>{props.data.utilDamage[player] ?? 0}</Td>
            <Td>{ef}</Td>
            <Td>{tf}</Td>
            <Td>
              {numFlashes === 0 ? 0 : Math.round((ef / numFlashes) * 100) / 100}
            </Td>
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
  <Table variant="simple" size="sm">
    <Thead>
      {/* prettier-ignore */}
      <Tr>
        <Th>{props.title}</Th>
        <Th><Tooltip label="Kills">K</Tooltip></Th>
        <Th><Tooltip label="Assists">A</Tooltip></Th>
        <Th><Tooltip label="Deaths">D</Tooltip></Th>
        <Th><Tooltip label="# of times traded">T</Tooltip></Th>
        <Th><Tooltip label="Kill/Death ratio">K/D</Tooltip></Th>
        <Th><Tooltip label="Kill-Death difference">K-D</Tooltip></Th>
        <Th><Tooltip label="Kills per round">K/R</Tooltip></Th>
        <Th><Tooltip label="Average damage per round">ADR</Tooltip></Th>
        <Th><Tooltip label="Headshot kill percentage">HS %</Tooltip></Th>
        <Th>2K</Th>
        <Th>3K</Th>
        <Th>4K</Th>
        <Th>5K</Th>
        <Th><Tooltip label="Approximate HLTV 2.0 rating">HLTV 2.0</Tooltip></Th>
        <Th><Tooltip label="Approximate HLTV Impact rating">Impact</Tooltip></Th>
        <Th><Tooltip label="% of rounds with kill/assist/survived/traded">KAST</Tooltip></Th>
      </Tr>
    </Thead>
    <Tbody>
      {props.players.map((player) => (
        <Tr>
          <Td>{player}</Td>
          <Td>{props.data.kills[player] ?? 0}</Td>
          <Td>{props.data.assists[player] ?? 0}</Td>
          <Td>{props.data.deaths[player] ?? 0}</Td>
          <Td>{props.data.trades[player] ?? 0}</Td>
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
            <ScoreTable title={teamATitle} data={data} players={teamAPlayers} />
            <RoundsVisualization data={data} />
            <ScoreTable title={teamBTitle} data={data} players={teamBPlayers} />
          </TabPanel>
          <TabPanel>
            <UtilTable title={teamATitle} data={data} players={teamAPlayers} />
            <Box my={5} />
            <UtilTable title={teamBTitle} data={data} players={teamBPlayers} />
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
