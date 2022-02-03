import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import {
  faBomb,
  faCut,
  faSkull,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataAPI, MatchInfo } from "../../api";
import { Loading } from "../../components/Loading";
import { demoLinks, getDateInfo, getPlayers } from "../../data";
import { Match, Round, Stats } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { OpeningDuels } from "./OpeningDuels";
import { PlayerInfo } from "./PlayerInfo";
import { RoundByRoundList } from "./RoundByRound";
import { RoundsVisualization } from "./RoundsVisualization";
import { scoreTableSchema, StatTable, utilTableSchema } from "./Tables";

export const getRoundIcon = (round: Round) => {
  switch (round.winReason) {
    case 1:
      return faBomb;
    case 7:
      return faCut;
    case 12:
      return faStopwatch;
    default:
      return faSkull;
  }
};

export const MatchPage = (props: { matches: MatchInfo[] }) => {
  const { id = "" } = useParams();

  const [match, setMatch] = useState<Match | undefined>();
  const [sortCol, setSortCol] = useState<keyof Stats>("hltv");
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    const api = new DataAPI("");
    api
      .fetchMatch(props.matches.find((f) => f.id === id)!)
      .then((m) => setMatch(m));
  }, [id, props.matches]);

  if (match === undefined) {
    return <Loading text="Loading match..." />;
  }

  const { map, teamAScore, teamBScore, teamATitle, teamBTitle } = match.meta;

  const [dateString] = getDateInfo(match.meta.id);

  const teamAPlayers = getPlayers(match, "CT", sortCol, reversed);
  const teamBPlayers = getPlayers(match, "T", sortCol, reversed);

  const colHeaderClicked = (key: string) => {
    if (key === sortCol) {
      setReversed((prev) => !prev);
    } else {
      setSortCol(key as keyof Stats);
      setReversed(false);
    }
  };

  return (
    <Flex w="100%" h="100vh" pt={30} alignItems="center" flexDirection="column">
      <Box w="80%" mb={3}>
        <Heading>pug on {map} </Heading>
        <Heading fontSize="lg" as="h2">
          {dateString}{" "}
          <Link isExternal href={demoLinks[match.meta.id] ?? "BUH"}>
            (demo link)
          </Link>
        </Heading>
      </Box>

      <Flex w="80%" alignItems="center" justifyContent="center">
        <Text mx={5} as="h2" fontSize="xl">
          {teamATitle}
        </Text>
        <Heading mx={2}>{teamAScore}</Heading>
        <Heading mx={1}>:</Heading>
        <Heading mx={2}>{teamBScore}</Heading>
        <Text mx={5} as="h2" fontSize="xl">
          {teamBTitle}
        </Text>
      </Flex>

      <Tabs w="80%">
        <TabList>
          <Tab>Scoreboard</Tab>
          <Tab>Utility</Tab>
          <Tab>Head to Head</Tab>
          <Tab>Performances</Tab>
          <Tab>Opening Duels</Tab>
          <Tab>Rounds</Tab>
        </TabList>

        <TabPanels>
          {/* Stats page */}
          <TabPanel>
            <StatTable
              schema={scoreTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamAPlayers}
            />
            <RoundsVisualization data={match} />
            <StatTable
              schema={scoreTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamBPlayers}
            />
          </TabPanel>

          {/* Utility page */}
          <TabPanel>
            <StatTable
              schema={utilTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamAPlayers}
            />
            <Box my={5} />
            <StatTable
              schema={utilTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamBPlayers}
            />
          </TabPanel>

          {/* Head to Head page */}
          <TabPanel>
            <Flex
              alignItems="center"
              justifyContent="flex-start"
              flexDirection="column"
            >
              <Alert status="info" mb={5}>
                <AlertIcon />
                Reading this chart: the number in the lower left is the amount
                of times the user on the left killed the user on the top, and
                vice-versa.
              </Alert>
              <HeadToHeadTable
                teams={[teamAPlayers, teamBPlayers]}
                headToHead={match.headToHead}
              />
            </Flex>
          </TabPanel>

          {/* Performances page */}
          <TabPanel>
            <PlayerInfo
              match={match}
              teams={[
                { title: teamATitle, players: teamAPlayers },
                { title: teamBTitle, players: teamBPlayers },
              ]}
            />
          </TabPanel>

          {/* Opening duels page */}
          <TabPanel>
            <OpeningDuels data={match.openingKills} />
          </TabPanel>

          {/* Rounds page */}
          <TabPanel>
            <RoundByRoundList
              roundByRound={match.roundByRound}
              startTeams={match.startTeams}
              rounds={match.rounds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
