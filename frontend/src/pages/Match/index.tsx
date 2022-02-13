/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

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
import { useNavigate, useParams } from "react-router-dom";
import { DataAPI } from "../../api";
import { Loading } from "../../components/Loading";
import {
  formatDate,
  getDemoTypePretty,
  getESEAId,
  getPlayers,
} from "../../data";
import { Match, MatchInfo, Round, Stats, UserMeta } from "../../types";
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

export const MatchPage = (props: {
  matches: MatchInfo[];
  userMeta: UserMeta | undefined;
}) => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [match, setMatch] = useState<Match | undefined>();
  const [sortCol, setSortCol] = useState<keyof Stats>("hltv");
  const [reversed, setReversed] = useState(false);

  useEffect(() => {
    const api = new DataAPI();
    const thisMatch = props.matches.find((f) => f.id === id);
    if (thisMatch === undefined) {
      navigate("/404");
      return;
    }

    api
      .fetchMatch(thisMatch.id)
      .then((m) => setMatch(m))
      .catch((err) => console.error(err));
  }, [id, props.matches, navigate]);

  if (match === undefined) {
    return <Loading minH="calc(100vh - 5.5rem)">Loading match...</Loading>;
  }

  const {
    map,
    dateTimestamp,
    demoType,
    teamAScore,
    teamBScore,
    teamATitle,
    teamBTitle,
  } = match.meta;

  const demoLink =
    props.userMeta !== undefined ? props.userMeta[id]?.demoLink : undefined;

  const eseaId = demoType === "esea" ? getESEAId(id) : undefined;
  const date = formatDate(dateTimestamp);

  const teamAPlayers = getPlayers(match.matchData, "CT", sortCol, reversed);
  const teamBPlayers = getPlayers(match.matchData, "T", sortCol, reversed);

  const colHeaderClicked = (key: string) => {
    if (key === sortCol) {
      setReversed((prev) => !prev);
    } else {
      setSortCol(key as keyof Stats);
      setReversed(false);
    }
  };

  return (
    <Flex
      w="100%"
      minH="calc(100vh - 5.5rem)"
      pt={30}
      alignItems="center"
      flexDirection="column"
    >
      <Box w={["95%", null, null, "80%"]} mb={3}>
        <Heading>
          {getDemoTypePretty(demoType)} on {map}
        </Heading>
        <Heading fontSize="lg" as="h2">
          {date}{" "}
          {demoLink && (
            <Link isExternal href={demoLink}>
              (demo link)
            </Link>
          )}
          {eseaId && (
            <Link isExternal href={`https://play.esea.net/match/${eseaId}`}>
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
                headToHead={match.matchData.headToHead}
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
              data={match.matchData.openingKills}
              playerNames={match.meta.playerNames}
            />
          </TabPanel>

          {/* Rounds page */}
          <TabPanel>
            <RoundByRoundList
              roundByRound={match.matchData.roundByRound}
              startTeams={match.matchData.startTeams}
              playerNames={match.meta.playerNames}
              rounds={match.matchData.rounds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
