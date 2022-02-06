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
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { getDateInfo } from "../data";
import { MatchInfo } from "../types";

const MatchCard = (props: { match: MatchInfo }) => {
  const { id, map, demoType, teamAScore, teamBScore, teamATitle, teamBTitle } =
    props.match;
  const [dateString] = getDateInfo(id);
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
              src={`${process.env.PUBLIC_URL}/img/maps/${map}.jpg`}
              onLoad={() => setMapLoaded(true)}
              h="6.5rem"
            />
          </Skeleton>
        )}
        <VStack align="start">
          <Heading as="h3" fontSize="2xl">
            <LinkOverlay as={Link} to={`/match/${id}`}>
              {dateString}
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
              src={`${process.env.PUBLIC_URL}/img/${demoType}.png`}
              onLoad={() => setLogoLoaded(true)}
              h="6.5rem"
            />
          </Skeleton>
        )}
      </Flex>
    </LinkBox>
  );
};

export const Home = (props: { matches: MatchInfo[] }) => (
  <Container maxW="container.xl" mt={16}>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading lineHeight="unset" mb={0}>
        Puggies
      </Heading>
      <ColorModeSwitcher mx={2} justifySelf="flex-end" />
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
