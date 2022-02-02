import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  GridProps,
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
import {
  INVERT_TEAM,
  KillFeed,
  Match,
  Team,
  TEAM_COLORS_MAP,
} from "../../types";

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
  side: Team;
  rounds: [number, number];
  styles?: GridProps;
}) => {
  return (
    <Grid
      {...props.styles}
      templateRows="repeat(6, 1.9rem)"
      templateColumns={`repeat(${props.rounds[1] - props.rounds[0]}, 1.9rem)`}
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
                bg={TEAM_COLORS_MAP[props.side]}
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
  startSide: Team;
}) => {
  const overtimes =
    props.killFeed.length > 30
      ? Array.from(Array(Math.ceil((props.killFeed.length - 30) / 6)).keys())
      : [];

  return (
    <Flex
      p={0}
      h="230px"
      alignItems="center"
      justifyContent="flex-start"
      overflowX="scroll"
      pt={3}
    >
      <KillGridHalf
        killFeed={props.killFeed}
        player={props.player}
        side={props.startSide}
        rounds={[0, 15]}
      />
      <Divider orientation="vertical" mx={5} />
      <KillGridHalf
        killFeed={props.killFeed}
        player={props.player}
        side={INVERT_TEAM[props.startSide]}
        rounds={[15, 30]}
      />
      {overtimes
        .map((ot) => {
          const i = 30 + ot * 6;
          const side =
            ot % 2 === 0 ? INVERT_TEAM[props.startSide] : props.startSide;

          return [
            <Divider orientation="vertical" mx={5} key={`otkd${ot}`} />,
            <KillGridHalf
              key={`otkgh1${ot}`}
              killFeed={props.killFeed}
              player={props.player}
              side={side}
              rounds={[i, i + 3]}
              styles={{ mr: 1 }}
            />,
            <KillGridHalf
              key={`otkgh2${ot}`}
              killFeed={props.killFeed}
              player={props.player}
              side={INVERT_TEAM[side]}
              rounds={[i + 3, i + 6]}
            />,
          ];
        })
        .flat()}
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

  const selectedPlayerStartSide =
    selectedPlayer === undefined
      ? undefined
      : props.match.teams[selectedPlayer] === "CT"
      ? props.match.roundByRound[0].teamASide
      : props.match.roundByRound[0].teamBSide;

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
            startSide={selectedPlayerStartSide!}
          />
        </>
      )}
    </Box>
  );
};
