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
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataAPI, MatchInfo } from "../../api";
import { demoLinks, getPlayers } from "../../data";
import { Loading } from "../../Loading";
import { Match, RawData } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { PlayerInfo } from "./PlayerInfo";
import { RoundByRoundList } from "./RoundByRound";
import { RoundsVisualization } from "./RoundsVisualization";
import { scoreTableSchema, StatTable, utilTableSchema } from "./Tables";

export const MatchPage = (props: { matches: MatchInfo[] }) => {
  const { id = "" } = useParams();

  const [match, setMatch] = useState<Match | undefined>();
  const [sortCol, setSortCol] = useState<keyof RawData>("hltv");
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

  const { map, dateString, teamARounds, teamBRounds, teamATitle, teamBTitle } =
    match.meta;

  const teamAPlayers = getPlayers(match, "CT", sortCol, reversed);
  const teamBPlayers = getPlayers(match, "T", sortCol, reversed);

  const colHeaderClicked = (key: string) => {
    if (key === sortCol) {
      setReversed((prev) => !prev);
    } else {
      setSortCol(key as keyof RawData);
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
          <Tab>Performances</Tab>
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

          {/* Rounds page */}
          <TabPanel>
            <RoundByRoundList
              roundByRound={match.roundByRound}
              teams={match.teams}
              rounds={match.rounds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
