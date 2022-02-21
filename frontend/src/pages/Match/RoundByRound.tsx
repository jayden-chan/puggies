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
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FlexProps,
  Heading,
  Image,
  ImageProps,
  Text,
  TextProps,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRoundIcon } from ".";
import { msToRoundTime } from "../../data";
import {
  GRAY_KILLFEED,
  INVERT_TEAM,
  Kill,
  KILLFEED_COLORS_MAP,
  PlayerNames,
  RED_KILLFEED,
  Round,
  RoundByRound,
  RoundEvent,
  Team,
  TeamsMap,
  TEAM_COLORS_MAP,
} from "../../types";

type KillFeedThing = {
  killer: string;
  victim: string;
  kill: Kill;
};

const playerColor = (
  startTeam: Team | undefined,
  round: number,
  halfLength: number
) => {
  if (startTeam === undefined) return "white";

  if (round <= halfLength) {
    return KILLFEED_COLORS_MAP[startTeam];
  } else if (round <= halfLength * 2) {
    return KILLFEED_COLORS_MAP[INVERT_TEAM[startTeam]];
  } else {
    const ot = Math.ceil((round - halfLength * 2) / 6);
    const otRound = ((round - 1) % 6) + 1;
    let side;
    if (ot % 2 === 0) {
      side = otRound <= 3 ? startTeam : INVERT_TEAM[startTeam];
    } else {
      side = otRound <= 3 ? INVERT_TEAM[startTeam] : startTeam;
    }
    return KILLFEED_COLORS_MAP[side];
  }
};

const KillFeedIcon = (props: ImageProps) => (
  <Image
    {...props}
    src={`/assets${props.src}`}
    h="20px"
    mr={props.mx === undefined ? 2 : undefined}
  />
);

const KillFeedPlayer = (
  props: TextProps & {
    player: string;
  }
) => (
  <Text {...props} as="span" mt="2px" fontWeight="bold">
    {props.player}
  </Text>
);

const EventBox = (props: FlexProps) => (
  <Flex
    {...props}
    bg="black"
    alignItems="center"
    borderRadius={8}
    borderWidth={3}
    h="2.4rem"
    px={2}
    py={1}
    mt={1}
  >
    {props.children}
  </Flex>
);

const KillLocation = (props: TextProps) => (
  <Text {...props} ml={2} color={GRAY_KILLFEED}>
    @{props.children}
  </Text>
);

const KillFeedItem = (
  props: KillFeedThing & {
    round: number;
    startTeams: TeamsMap;
    playerNames: PlayerNames;
    halfLength: number;
  }
) => {
  const { kill, round, startTeams, playerNames } = props;
  return (
    <EventBox borderColor={RED_KILLFEED}>
      {kill.attackerBlind && <KillFeedIcon src="/killfeed/blind.png" />}
      <KillFeedPlayer
        player={playerNames[props.killer.toString()]}
        color={playerColor(
          startTeams[props.killer.toString()],
          round,
          props.halfLength
        )}
      />

      <KillLocation>{props.kill.attackerLocation}</KillLocation>

      {kill.assistedFlash === true && (
        <>
          <KillFeedPlayer mx={2} player={"+"} color="white" />
          <KillFeedIcon src="/killfeed/flashassist.png" />
          <KillFeedPlayer
            player={playerNames[kill.assister.toString()]}
            color={playerColor(
              startTeams[kill.assister.toString()],
              round,
              props.halfLength
            )}
          />
        </>
      )}

      <KillFeedIcon src={`/weapons/${kill.weapon}.png`} mx={2} />
      {kill.noScope && <KillFeedIcon src="/killfeed/noscope.png" />}
      {kill.throughSmoke && <KillFeedIcon src="/killfeed/smoke.png" />}
      {kill.penetratedObjects > 0 && (
        <KillFeedIcon src="/killfeed/wallbang.png" />
      )}
      {kill.isHeadshot && <KillFeedIcon src="/killfeed/headshot.png" />}
      <KillFeedPlayer
        player={playerNames[props.victim.toString()]}
        color={playerColor(
          startTeams[props.victim.toString()],
          round,
          props.halfLength
        )}
      />
      <KillLocation>{props.kill.victimLocation}</KillLocation>
    </EventBox>
  );
};

const RoundResultIcon = (props: { round: Round; visibility: boolean }) => {
  if (props.visibility === false) {
    return <Box w="1.9rem" h="1.9rem" visibility="hidden" />;
  }

  return (
    <Box
      bg={TEAM_COLORS_MAP[props.round.winner]}
      borderRadius={5}
      w="1.9rem"
      h="1.9rem"
    >
      <Flex alignItems="center" justifyContent="center" h="100%">
        <FontAwesomeIcon icon={getRoundIcon(props.round)} color="black" />
      </Flex>
    </Box>
  );
};

const EventsFeed = (props: {
  events: RoundEvent[];
  startTeams: TeamsMap;
  playerNames: PlayerNames;
  round: number;
  halfLength: number;
}) => (
  <Flex flexDirection="column" alignItems="start" mt={2} overflowX="auto">
    {props.events.map((event, j) => {
      const timeString = msToRoundTime(event.time);
      return (
        <Flex key={j}>
          <Flex h="2.4rem" px={2} py={1} mt={1} mr={1} alignItems="center">
            {timeString}
          </Flex>
          {event.kind === "kill" && (
            <KillFeedItem
              key={j}
              {...event}
              startTeams={props.startTeams}
              playerNames={props.playerNames}
              round={props.round}
              halfLength={props.halfLength}
            />
          )}

          {event.kind === "plant" && (
            <EventBox borderColor="gray">
              {props.playerNames[event.planter]} planted the bomb
            </EventBox>
          )}

          {event.kind === "defuse" && (
            <EventBox borderColor="gray">
              {props.playerNames[event.defuser]} defused the bomb
            </EventBox>
          )}

          {event.kind === "bomb_explode" && (
            <EventBox borderColor="gray">Bomb exploded</EventBox>
          )}
        </Flex>
      );
    })}
  </Flex>
);

export const RoundByRoundList = (props: {
  roundByRound: RoundByRound;
  startTeams: TeamsMap;
  playerNames: PlayerNames;
  rounds: Round[];
  halfLength: number;
}) => {
  return (
    <Accordion allowMultiple>
      {props.roundByRound.map((r, i) => {
        const { teamAScore, teamBScore, teamASide, teamBSide, events } = r;

        return (
          <AccordionItem key={i}>
            <AccordionButton>
              <Flex w="100%" alignItems="center">
                <Heading
                  as="h3"
                  flex={1}
                  fontSize="1.1rem"
                  textAlign="left"
                  lineHeight="1.1rem"
                  height="1.1rem"
                >
                  Round {i + 1}
                </Heading>

                <Flex flex={1} justifyContent="center" alignItems="center">
                  <RoundResultIcon
                    round={props.rounds[i]}
                    visibility={props.rounds[i].winner === teamASide}
                  />
                  <Heading
                    as="h3"
                    fontSize="xl"
                    ml={3}
                    textColor={TEAM_COLORS_MAP[teamASide]}
                  >
                    {teamAScore}
                  </Heading>
                  <Heading as="h3" fontSize="xl" mx={2}>
                    :
                  </Heading>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    mr={3}
                    textColor={TEAM_COLORS_MAP[teamBSide]}
                  >
                    {teamBScore}
                  </Heading>
                  <RoundResultIcon
                    round={props.rounds[i]}
                    visibility={props.rounds[i].winner === teamBSide}
                  />
                </Flex>
                <Flex flex={1} justifyContent="center">
                  <AccordionIcon ml="auto" />
                </Flex>
              </Flex>
            </AccordionButton>

            <AccordionPanel>
              <EventsFeed
                events={events}
                startTeams={props.startTeams}
                playerNames={props.playerNames}
                round={i + 1}
                halfLength={props.halfLength}
              />
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
