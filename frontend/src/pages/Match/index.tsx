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
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayers } from "../../data";
import { Match, RawData } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { RoundsVisualization } from "./RoundsVisualization";
import { PlayerInfo } from "./PlayerInfo";
import { scoreTableSchema, StatTable, utilTableSchema } from "./Tables";
import { RoundByRound } from "./RoundByRound";

export const MatchPage = (props: { data: Match[] }) => {
  const { id = "" } = useParams();
  const match = props.data.find((m) => m.meta.id === id);

  const [sortCol, setSortCol] = useState<keyof RawData>("hltv");
  const [reversed, setReversed] = useState(false);

  if (match === undefined) {
    return <></>;
  }

  const {
    demoLink,
    map,
    dateString,
    teamARounds,
    teamBRounds,
    teamATitle,
    teamBTitle,
  } = match.meta;

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
          <Link isExternal href={demoLink}>
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

      <Tabs w="80%" isLazy>
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
            <RoundByRound
              killFeed={match.killFeed}
              teams={match.teams}
              rounds={match.rounds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
