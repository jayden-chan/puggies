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
import { DataAPI } from "../../api";
import { Loading } from "../../components/Loading";
import {
  demoLinks,
  getDateInfo,
  getDemoTypePretty,
  getPlayers,
} from "../../data";
import { Match, Round, Stats, MatchInfo } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { OpeningDuels } from "./OpeningDuels";
import { PlayerInfo } from "./PlayerInfo";
import { RoundByRoundList } from "./RoundByRound";
import { RoundsVisualization } from "./RoundsVisualization";
import {
  openingsTableSchema,
  scoreTableSchema,
  StatTable,
  utilTableSchema,
} from "./Tables";

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

  const { map, demoType, teamAScore, teamBScore, teamATitle, teamBTitle } =
    match.meta;

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
      <Box w={["95%", null, null, "80%"]} mb={3}>
        <Heading>
          {getDemoTypePretty(demoType)} on {map}
        </Heading>
        <Heading fontSize="lg" as="h2">
          {dateString}{" "}
          {demoLinks[match.meta.id] && (
            <Link isExternal href={demoLinks[match.meta.id]}>
              (demo link)
            </Link>
          )}
          {demoType === "esea" && (
            <Link
              isExternal
              href={`https://play.esea.net/match/${id.replace(
                "esea_match_",
                ""
              )}`}
            >
              (ESEA match page)
            </Link>
          )}
        </Heading>
      </Box>

      <Flex
        w={["95%", null, null, "80%"]}
        mb={3}
        mt={[3, null, null, 0]}
        alignItems="center"
        justifyContent="center"
      >
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

      <Tabs w={["95%", null, null, "80%"]}>
        <TabList
          overflowX={["auto", "auto", "unset"]}
          overflowY={["hidden", null, "unset"]}
        >
          <Tab>Scoreboard</Tab>
          <Tab>Utility</Tab>
          <Tab>Head to Head</Tab>
          <Tab>Performances</Tab>
          <Tab>Opening Duels</Tab>
          <Tab>Rounds</Tab>
        </TabList>

        <TabPanels overflowX="auto">
          {/* Stats page */}
          <TabPanel>
            <Box w="100%">
              <StatTable
                schema={scoreTableSchema}
                data={match}
                sort={{ key: sortCol, reversed }}
                colClicked={colHeaderClicked}
                playerIds={teamAPlayers}
                styles={{ overflowX: "auto" }}
              />
              <RoundsVisualization data={match} />
              <StatTable
                schema={scoreTableSchema}
                data={match}
                sort={{ key: sortCol, reversed }}
                colClicked={colHeaderClicked}
                playerIds={teamBPlayers}
                styles={{ overflowX: "auto" }}
              />
            </Box>
          </TabPanel>

          {/* Utility page */}
          <TabPanel>
            <StatTable
              schema={utilTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              playerIds={teamAPlayers}
            />
            <Box my={5} />
            <StatTable
              schema={utilTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              playerIds={teamBPlayers}
            />
          </TabPanel>

          {/* Head to Head page */}
          <TabPanel>
            <Alert status="info" mb={5}>
              <AlertIcon />
              Reading this chart: the number in the lower left is the amount of
              times the user on the left killed the user on the top, and
              vice-versa.
            </Alert>
            <Flex justifyContent="center">
              <HeadToHeadTable
                teams={[teamAPlayers, teamBPlayers]}
                playerNames={match.meta.playerNames}
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
            <StatTable
              schema={openingsTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              playerIds={teamAPlayers}
              styles={{ mb: 5 }}
            />
            <StatTable
              schema={openingsTableSchema}
              data={match}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              playerIds={teamBPlayers}
              styles={{ mb: 12 }}
            />
            <OpeningDuels
              data={match.openingKills}
              playerNames={match.meta.playerNames}
            />
          </TabPanel>

          {/* Rounds page */}
          <TabPanel>
            <RoundByRoundList
              roundByRound={match.roundByRound}
              startTeams={match.startTeams}
              playerNames={match.meta.playerNames}
              rounds={match.rounds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
