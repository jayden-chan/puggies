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
  Button,
  Divider,
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
import shallow from "zustand/shallow";
import { api } from "../../api";
import { Loading } from "../../components/Loading";
import {
  formatDate,
  getDemoTypePretty,
  getESEAId,
  getPlayers,
} from "../../data";
import { useOptionsStore } from "../../stores/options";
import { Match, Round, Stats } from "../../types";
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

export const MatchPage = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [match, setMatch] = useState<Match | undefined>();
  const [sortCol, setSortCol] = useState<keyof Stats>("hltv");
  const [reversed, setReversed] = useState(false);

  const [allowDemoDownload] = useOptionsStore(
    (state) => [state.allowDemoDownload],
    shallow
  );

  useEffect(() => {
    api()
      .match(id)
      .then((m) => {
        if (m === undefined) {
          navigate("/404");
        } else {
          setMatch(m);
        }
      });
  }, [id, navigate]);

  if (match === undefined) {
    return <Loading minH="calc(100vh - 5.5rem)">Loading match...</Loading>;
  }

  const {
    map,
    dateTimestamp,
    demoType,
    demoLink,
    teamAScore,
    teamBScore,
    teamATitle,
    teamBTitle,
  } = match.meta;

  const demoExternal = demoLink ? !demoLink.startsWith("/api/v1/demos") : false;
  const showDemoLink = demoExternal || allowDemoDownload;
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
      pt={3}
      alignItems="center"
      flexDirection="column"
    >
      <Flex
        w={["95%", null, null, "80%"]}
        p={5}
        alignItems="flex-end"
        justifyContent="space-between"
      >
        <Box>
          <Heading fontSize="3xl" mb={1}>
            {getDemoTypePretty(demoType)} match on {map}
          </Heading>
          <Heading fontSize="lg" as="h2" mb={2}>
            {date}
          </Heading>
          {showDemoLink && (
            <Button
              as={Link}
              colorScheme="teal"
              href={demoLink}
              isExternal={demoExternal}
              mr="0.5rem"
              size="xs"
            >
              Download demo
            </Button>
          )}
          {eseaId && (
            <Button
              as={Link}
              colorScheme="green"
              href={`https://play.esea.net/match/${eseaId}`}
              isExternal
              size="xs"
            >
              ESEA match page
            </Button>
          )}
        </Box>

        <Flex
          mt={[3, null, null, 0]}
          alignItems="center"
          justifyContent="center"
        >
          <Text mr={2} as="h2" fontSize="xl">
            {teamATitle}
          </Text>
          <Heading ml={2}>{teamAScore}</Heading>
          <Heading mx={1}>:</Heading>
          <Heading mr={2}>{teamBScore}</Heading>
          <Text ml={2} as="h2" fontSize="xl">
            {teamBTitle}
          </Text>
        </Flex>
      </Flex>

      <Divider w={["95%", null, null, "80%"]} mb={2} />

      <Tabs w={["95%", null, null, "80%"]} isLazy>
        <TabList
          overflowX={["auto", "auto", "unset"]}
          overflowY={["hidden", null, "unset"]}
        >
          <Tab whiteSpace="nowrap">Scoreboard</Tab>
          <Tab whiteSpace="nowrap">Utility</Tab>
          <Tab whiteSpace="nowrap">Head to Head</Tab>
          <Tab whiteSpace="nowrap">Performances</Tab>
          <Tab whiteSpace="nowrap">Opening Duels</Tab>
          <Tab whiteSpace="nowrap">Rounds</Tab>
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
              halfLength={match.matchData.halfLength}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
