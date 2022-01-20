import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Select,
} from "@chakra-ui/react";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { HeadToHead, Match, Team } from "../../types";
import { CT_BLUE, T_YELLOW } from "./RoundsVisualization";

export const GridIcon = (props: {
  bg: string;
  visibility: "visible" | "hidden" | "initial";
  icon: FontAwesomeIconProps["icon"];
}) => (
  <GridItem bg={props.bg} borderRadius={5} visibility={props.visibility}>
    <Flex alignItems="center" justifyContent="center" h="100%">
      <FontAwesomeIcon icon={props.icon} color="black" />
    </Flex>
  </GridItem>
);

const KillGridHalf = (props: {
  headToHeadRaw: HeadToHead[];
  player: string;
  endSide: string;
  rounds: number[];
}) => {
  return (
    <Grid
      h="100%"
      templateRows="repeat(6, 30px)"
      templateColumns="repeat(15, 30px)"
      gridAutoFlow="column"
      gap={1}
    >
      {props.headToHeadRaw
        .slice(...props.rounds)
        .map((round, roundNum) => {
          const roundH2H = round[props.player] ?? {};
          const numKills = Object.values(roundH2H).reduce(
            (acc, curr) => acc + curr,
            0
          );
          return [5, 4, 3, 2, 1, 0].map((i) => {
            return i !== 0 ? (
              <GridIcon
                bg={props.endSide === "CT" ? T_YELLOW : CT_BLUE}
                visibility={numKills >= i ? "visible" : "hidden"}
                icon={faSkull}
              />
            ) : (
              <GridItem bg="transparent" borderRadius={5}>
                <Flex alignItems="center" justifyContent="center" h="100%">
                  {roundNum + 1}
                </Flex>
              </GridItem>
            );
          });
        })
        .flat()}
    </Grid>
  );
};

const KillsVisualization = (props: {
  headToHeadRaw: HeadToHead[];
  player: string;
  endSide: Team;
}) => {
  return (
    <Flex
      h="200px"
      p={0}
      alignItems="center"
      justifyContent="flex-start"
      pt={3}
    >
      {KillGridHalf({ ...props, rounds: [0, 15] })}
      <Divider orientation="vertical" mx={5} />
      {KillGridHalf({
        ...props,
        endSide: props.endSide === "CT" ? "T" : "CT",
        rounds: [15],
      })}
    </Flex>
  );
};

export const PlayerInfo = (props: { match: Match }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
  return (
    <Box>
      <Select
        placeholder="Select player"
        maxW="20%"
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        {Object.keys(props.match.teams).map((player) => (
          <option key={player} value={player}>
            {player}
          </option>
        ))}
      </Select>

      {selectedPlayer && (
        <>
          <Heading as="h2" fontSize="3xl" mt={5}>
            Kills
          </Heading>
          <KillsVisualization
            headToHeadRaw={props.match.headToHeadRaw}
            player={selectedPlayer}
            endSide={props.match.teams[selectedPlayer]}
          />
        </>
      )}
    </Box>
  );
};
