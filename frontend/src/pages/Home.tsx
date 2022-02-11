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
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MatchInfo, UserMeta } from "../types";

const MatchCard = (props: { match: MatchInfo }) => {
  const {
    id,
    map,
    date,
    demoType,
    teamAScore,
    teamBScore,
    teamATitle,
    teamBTitle,
  } = props.match;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const showImages = useBreakpointValue([false, false, true]);

  return (
    <LinkBox>
      <Flex
        p={5}
        my={5}
        borderRadius={10}
        flexDir={["column", null, "row"]}
        style={{ boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.40)" }}
        alignItems="start"
      >
        {showImages && (
          <Skeleton isLoaded={mapLoaded} mr={5} mb={[3, null, 0]}>
            <Image
              src={`/assets/maps/${map}.jpg`}
              onLoad={() => setMapLoaded(true)}
              h="6.5rem"
              minH="6.5rem"
            />
          </Skeleton>
        )}
        <VStack align="start">
          <Heading as="h3" fontSize="2xl">
            <LinkOverlay as={Link} to={`/match/${id}`}>
              {date}
            </LinkOverlay>
          </Heading>
          <Heading as="h4" fontSize="xl">
            {map}
          </Heading>
          <Heading as="h5" fontSize="xl" fontWeight="normal" mr={2}>
            {teamATitle}{" "}
            <Text as="span" fontWeight="bold">
              {teamAScore}:{teamBScore}
            </Text>{" "}
            {teamBTitle}
          </Heading>
        </VStack>
        {demoType !== "pugsetup" && showImages && (
          <Skeleton isLoaded={logoLoaded} ml="auto" mb={[3, null, 0]}>
            <Image
              src={`/assets/logos/${demoType}.png`}
              onLoad={() => setLogoLoaded(true)}
              h="6.5rem"
              minH="6.5rem"
            />
          </Skeleton>
        )}
      </Flex>
    </LinkBox>
  );
};

export const Home = (props: {
  matches: MatchInfo[];
  userMeta: UserMeta | undefined;
}) => {
  return (
    <Container maxW="container.xl" mt={8}>
      <Flex alignItems="center" justifyContent="space-between">
        <Heading lineHeight="unset" mb={0}>
          Home
        </Heading>
      </Flex>
      <Divider my={5} />
      <Heading as="h2" fontSize="3xl">
        Matches
      </Heading>
      {props.matches.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </Container>
  );
};
