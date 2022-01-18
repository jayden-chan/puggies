import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { parse, format } from "date-fns";
import React from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";

const T_YELLOW = "#ead18a";
const CT_BLUE = "#b5d4ee";

export type Team = "T" | "CT";

export type Round = {
  winner: Team;
  winReason: number;
};

export type HeadToHead = { [key: string]: { [key: string]: number } };

export type Data = {
  totalRounds: number;
  teams: { [key: string]: Team };
  kills: { [key: string]: number };
  assists: { [key: string]: number };
  deaths: { [key: string]: number };
  trades: { [key: string]: number };
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

  headToHead: HeadToHead;

  "2k": { [key: string]: number };
  "3k": { [key: string]: number };
  "4k": { [key: string]: number };
  "5k": { [key: string]: number };
};

const headToHeadColor = (diff: number): string => {
  if (diff === 0) {
    return "#8aa660";
  }

  if (diff > 0) {
    if (diff < 3) {
      return "#8cb34d";
    } else if (diff < 5) {
      return "#75b34d";
    } else {
      return "#5eb34d";
    }
  } else {
    if (diff > -3) {
      return "#b3644d";
    } else if (diff > -5) {
      return "#b3564d";
    } else {
      return "#b34d4d";
    }
  }
};

const HeadToHead = (props: {
  headToHead: HeadToHead;
  teams: [string[], string[]];
}) => {
  return (
    <Grid
      templateRows="repeat(6, auto)"
      templateColumns="repeat(6, min-content)"
      gap={1}
    >
      <GridItem colSpan={1}> </GridItem>
      {props.teams[0].map((p) => (
        <Flex alignItems="center" justifyContent="center" id={p} mb={3}>
          {p}
        </Flex>
      ))}

      {props.teams[1]
        .map((rowPlayer) => {
          return [
            <Flex alignItems="center" justifyContent="flex-end" h="100%" mr={3}>
              {rowPlayer}
            </Flex>,
            props.teams[0].map((columnPlayer) => {
              const colKills = props.headToHead[columnPlayer][rowPlayer] ?? 0;
              const rowKills = props.headToHead[rowPlayer][columnPlayer] ?? 0;
              const diff = colKills - rowKills;
              return (
                <Flex
                  h="90px"
                  w="150px"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="#1f2736"
                >
                  <Box w="100px" h="90px" position="relative">
                    <Flex
                      position="absolute"
                      justifyContent="center"
                      alignItems="center"
                      bottom="15px"
                      left="18px"
                      borderRadius="30px"
                      w="40px"
                      h="40px"
                      backgroundColor={headToHeadColor(-diff)}
                    >
                      {rowKills}
                    </Flex>
                    <Flex
                      position="absolute"
                      justifyContent="center"
                      alignItems="center"
                      top="15px"
                      right="18px"
                      borderRadius="30px"
                      w="40px"
                      h="40px"
                      backgroundColor={headToHeadColor(diff)}
                    >
                      {colKills}
                    </Flex>
                  </Box>
                </Flex>
              );
            }),
          ];
        })
        .flat()}
    </Grid>
  );
};

const RoundIcon = (props: { round: Round; topTeam: Team }) => {
  let icon;
  switch (props.round.winReason) {
    case 1:
      icon = faBomb;
      break;
    case 7:
      icon = faCut;
      break;
    default:
      icon = faSkull;
      break;
  }

  return (
    <Flex flexDirection="column" h="70%" mx={0.5}>
      <Flex
        visibility={props.round.winner === props.topTeam ? "initial" : "hidden"}
        h="50%"
        alignItems="center"
        justifyContent="center"
        backgroundColor={props.topTeam === "T" ? T_YELLOW : CT_BLUE}
        borderRadius={5}
        px={2}
      >
        <FontAwesomeIcon icon={icon} color="black" />
      </Flex>
      <Flex
        visibility={props.round.winner !== props.topTeam ? "initial" : "hidden"}
        h="50%"
        alignItems="center"
        justifyContent="center"
        backgroundColor={props.topTeam !== "T" ? T_YELLOW : CT_BLUE}
        borderRadius={5}
        px={2}
      >
        <FontAwesomeIcon icon={icon} color="black" />
      </Flex>
    </Flex>
  );
};

const UtilTable = (props: { data: Data; players: string[]; title: string }) => (
  <Table variant="simple" size="sm">
    <Thead>
      <Tr>
        <Th>{props.title}</Th>
        <Th>Smokes</Th>
        <Th>Molotovs</Th>
        <Th>HE</Th>
        <Th>Flashes</Th>
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
  <Table variant="simple" size="sm">
    <Thead>
      <Tr>
        <Th>{props.title}</Th>
        <Th>K</Th>
        <Th>A</Th>
        <Th>D</Th>
        <Th>T</Th>
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

const RoundsVisualization = (props: { data: Data }) => {
  const { data } = props;
  const ScoreNumber = (props: { rounds: number[]; side: Team }) => (
    <Heading textColor={props.side === "T" ? T_YELLOW : CT_BLUE} fontSize="3xl">
      {
        data.rounds
          .slice(...props.rounds)
          .filter((r) => r.winner === props.side).length
      }
    </Heading>
  );

  return (
    <Flex my={5}>
      <Flex mr={10}>
        <Flex
          flexDirection="column"
          mr={5}
          alignItems="center"
          justifyContent="center"
        >
          <ScoreNumber side="T" rounds={[0, 15]} />
          <Text>1st</Text>
          <ScoreNumber side="CT" rounds={[0, 15]} />
        </Flex>

        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Heading textColor={CT_BLUE} fontSize="3xl">
            {data.rounds.slice(15).filter((r) => r.winner === "CT").length}
          </Heading>
          <Text>2nd</Text>
          <Heading textColor={T_YELLOW} fontSize="3xl">
            {data.rounds.slice(15).filter((r) => r.winner === "T").length}
          </Heading>
        </Flex>
      </Flex>

      <Flex alignItems="center">
        {data.rounds.slice(0, 15).map((r) => (
          <RoundIcon round={r} topTeam="T" />
        ))}

        <Divider orientation="vertical" mx={5} />

        {data.rounds.slice(15).map((r) => (
          <RoundIcon round={r} topTeam="CT" />
        ))}
      </Flex>
    </Flex>
  );
};

export const Match = (props: { data: Data }) => {
  const { data } = props;
  const { id } = useParams();

  if (id === undefined) {
    return <></>;
  }

  const [, map, date] = id.match(/^pug_(.*?)_(\d\d\d\d-\d\d-\d\d)/) ?? [];
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
              <HeadToHead
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
