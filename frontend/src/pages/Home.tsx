import {
  Container,
  Divider,
  Flex,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  VStack,
} from "@chakra-ui/react";
import * as React from "react";
import { Link } from "react-router-dom";
import { MatchInfo } from "../api";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { getDateInfo } from "../data";

const MatchCard = (props: { match: MatchInfo }) => {
  const { id, map, teamAScore, teamBScore, teamATitle, teamBTitle } =
    props.match;
  const [dateString] = getDateInfo(id);

  return (
    <LinkBox>
      <Flex
        p={5}
        my={5}
        borderRadius={10}
        flexDir={["column", null, null, "row"]}
        style={{ boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.40)" }}
      >
        <Image
          src={`/img/maps/${map}.jpg`}
          maxW="150px"
          mr={5}
          mb={[3, null, null, 0]}
        />
        <VStack align="start">
          <Heading as="h3" fontSize="2xl">
            <LinkOverlay as={Link} to={`/match/${id}`}>
              {map} - {dateString}
            </LinkOverlay>
          </Heading>
          <Flex alignItems="center" justifyContent="center">
            <Heading as="h4" fontSize="xl" fontWeight="normal" mr={2}>
              {teamATitle}
            </Heading>
            <Heading as="h4" fontSize="xl" fontWeight="normal" mr={2}>
              -
            </Heading>
            <Heading as="h4" fontSize="2xl">
              {teamAScore}:{teamBScore}
            </Heading>
            <Heading as="h4" fontSize="xl" fontWeight="normal" ml={2}>
              -
            </Heading>
            <Heading as="h4" fontSize="xl" fontWeight="normal" ml={2}>
              {teamBTitle}
            </Heading>
          </Flex>
        </VStack>
      </Flex>
    </LinkBox>
  );
};

export const Home = (props: { matches: MatchInfo[] }) => (
  <Container maxW="container.xl" mt={16}>
    <Flex alignItems="center" justifyContent="space-between">
      <Heading lineHeight="unset" mb={0}>
        CSGO Pug Stats
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
