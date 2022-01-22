import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Tooltip,
} from "@chakra-ui/react";
import { faSkull } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { CT_BLUE, KillFeed, Match, Team, T_YELLOW } from "../../types";

export const GridIcon = (props: {
  bg: string;
  visibility: "visible" | "hidden" | "initial";
  icon: FontAwesomeIconProps["icon"];
  label?: string;
}) => (
  <GridItem bg={props.bg} borderRadius={5} visibility={props.visibility}>
    <Tooltip label={props.label}>
      <Flex alignItems="center" justifyContent="center" h="100%">
        <FontAwesomeIcon icon={props.icon} color="black" />
      </Flex>
    </Tooltip>
  </GridItem>
);

const KillGridHalf = (props: {
  killFeed: KillFeed;
  player: string;
  endSide: string;
  rounds: number[];
}) => {
  return (
    <Grid
      templateRows="repeat(6, 1.9rem)"
      templateColumns="repeat(15, 1.9rem)"
      gridAutoFlow="column"
      gap={1}
    >
      {props.killFeed
        .slice(...props.rounds)
        .map((round, roundNum) => {
          const numKills = Object.keys(round[props.player] ?? {}).length;
          return [
            ...[5, 4, 3, 2, 1].map((i) => (
              <GridIcon
                bg={props.endSide === "CT" ? T_YELLOW : CT_BLUE}
                visibility={numKills >= i ? "visible" : "hidden"}
                icon={faSkull}
              />
            )),

            <GridItem bg="transparent" borderRadius={5}>
              <Flex alignItems="center" justifyContent="center" h="100%">
                {roundNum + 1 + props.rounds[0]}
              </Flex>
            </GridItem>,
          ];
        })
        .flat()}
    </Grid>
  );
};

const KillsVisualization = (props: {
  killFeed: KillFeed;
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

export const PlayerInfo = (props: {
  match: Match;
  teams: [
    { title: string; players: string[] },
    { title: string; players: string[] }
  ];
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>();
  return (
    <Box>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
          {selectedPlayer !== undefined ? selectedPlayer : "Select player"}
        </MenuButton>
        <MenuList>
          <MenuGroup title={props.teams[0].title}>
            {props.teams[0].players.map((player) => (
              <MenuItem
                key={player}
                value={player}
                onClick={() => setSelectedPlayer(player)}
              >
                {player}
              </MenuItem>
            ))}
          </MenuGroup>

          <MenuGroup title={props.teams[1].title}>
            {props.teams[1].players.map((player) => (
              <MenuItem
                key={player}
                value={player}
                onClick={() => setSelectedPlayer(player)}
              >
                {player}
              </MenuItem>
            ))}
          </MenuGroup>
        </MenuList>
      </Menu>

      {selectedPlayer && (
        <>
          <Heading as="h2" fontSize="3xl" mt={5}>
            Kills
          </Heading>
          <KillsVisualization
            killFeed={props.match.killFeed}
            player={selectedPlayer}
            endSide={props.match.teams[selectedPlayer]}
          />
        </>
      )}
    </Box>
  );
};
