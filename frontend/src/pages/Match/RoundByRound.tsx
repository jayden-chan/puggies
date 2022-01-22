import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CT_BLUE,
  CT_KILLFEED,
  Kill,
  RED_KILLFEED,
  Round,
  RoundByRound,
  TeamsMap,
  T_KILLFEED,
  T_YELLOW,
} from "../../types";

type KillFeedThing = {
  killer: string;
  victim: string;
  kill: Kill;
};

const playerColor = (player: string, teams: TeamsMap, round: number) => {
  if (teams[player] === undefined) return "white";

  if (round <= 15) {
    return teams[player] === "T" ? CT_KILLFEED : T_KILLFEED;
  } else {
    return teams[player] === "CT" ? CT_KILLFEED : T_KILLFEED;
  }
};

const KillFeedIcon = (props: { src: string; mx?: number }) => (
  <Image
    src={`${props.src}`}
    h="20px"
    mr={props.mx === undefined ? 2 : undefined}
    mx={props.mx}
  />
);

const KillFeedPlayer = (props: {
  player: string;
  color: string;
  mx?: number;
}) => (
  <Text
    as="span"
    mt="2px"
    mx={props.mx ?? undefined}
    fontWeight="bold"
    color={props.color}
  >
    {props.player}
  </Text>
);

const EventBox = (props: {
  borderColor: string;
  children: React.ReactNode;
}) => (
  <Flex
    bg="black"
    borderColor={props.borderColor}
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

const KillFeedItem = (
  props: KillFeedThing & { round: number; teams: TeamsMap }
) => {
  return (
    <EventBox borderColor={RED_KILLFEED}>
      {props.kill.attackerBlind && <KillFeedIcon src="/killfeed/blind.png" />}
      <KillFeedPlayer
        player={props.killer}
        color={playerColor(props.killer, props.teams, props.round)}
      />

      {props.kill.assistedFlash === true && (
        <>
          <KillFeedPlayer mx={2} player={"+"} color="white" />
          <KillFeedIcon src="/killfeed/flashassist.png" />
          <KillFeedPlayer
            player={props.kill.assister}
            color={playerColor(props.kill.assister, props.teams, props.round)}
          />
        </>
      )}

      <KillFeedIcon src={`/weapons/${props.kill.weapon}.png`} mx={2} />
      {props.kill.noScope && <KillFeedIcon src="/killfeed/noscope.png" />}
      {props.kill.throughSmoke && <KillFeedIcon src="/killfeed/smoke.png" />}
      {props.kill.penetratedObjects > 0 && (
        <KillFeedIcon src="/killfeed/wallbang.png" />
      )}
      {props.kill.isHeadshot && <KillFeedIcon src="/killfeed/headshot.png" />}
      <KillFeedPlayer
        player={props.victim}
        color={playerColor(props.victim, props.teams, props.round)}
      />
    </EventBox>
  );
};

const RoundResultIcon = (props: { round: Round; visibility: boolean }) => {
  if (props.visibility === false) {
    return <Box w="1.9rem" h="1.9rem" visibility="hidden" />;
  }

  let icon;
  switch (props.round.winReason) {
    case 1:
      icon = faBomb;
      break;
    case 7:
      icon = faCut;
      break;
    default:
      icon = faSkull;
      break;
  }

  return (
    <Box
      bg={props.round.winner === "CT" ? CT_BLUE : T_YELLOW}
      borderRadius={5}
      w="1.9rem"
      h="1.9rem"
    >
      <Flex alignItems="center" justifyContent="center" h="100%">
        <FontAwesomeIcon icon={icon} color="black" />
      </Flex>
    </Box>
  );
};

export const RoundByRoundList = (props: {
  roundByRound: RoundByRound;
  teams: TeamsMap;
  rounds: Round[];
}) => {
  return (
    <Accordion allowMultiple>
      {props.roundByRound.map((r, i) => {
        const { teamAScore, teamBScore, events } = r;

        return (
          <AccordionItem key={i}>
            <AccordionButton>
              <Flex w="100%" alignItems="center">
                <Heading
                  as="h3"
                  flex={1}
                  fontSize="1.25rem"
                  textAlign="left"
                  lineHeight="1.25rem"
                  height="1.25rem"
                >
                  Round {i + 1}
                </Heading>

                <Flex flex={1} justifyContent="center" alignItems="center">
                  <RoundResultIcon
                    round={props.rounds[i]}
                    visibility={
                      i < 15
                        ? props.rounds[i].winner === "T"
                        : props.rounds[i].winner === "CT"
                    }
                  />
                  <Heading
                    as="h3"
                    fontSize="xl"
                    ml={3}
                    textColor={i < 15 ? T_YELLOW : CT_BLUE}
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
                    textColor={i < 15 ? CT_BLUE : T_YELLOW}
                  >
                    {teamBScore}
                  </Heading>
                  <RoundResultIcon
                    round={props.rounds[i]}
                    visibility={
                      i < 15
                        ? props.rounds[i].winner === "CT"
                        : props.rounds[i].winner === "T"
                    }
                  />
                </Flex>
                <Flex flex={1} justifyContent="center">
                  <AccordionIcon ml="auto" />
                </Flex>
              </Flex>
            </AccordionButton>

            <AccordionPanel>
              <Flex flexDirection="column" alignItems="start" mt={2}>
                {events.map((event, j) => {
                  const ms = event.time;
                  const seconds = Math.round(ms / 1000) % 60;
                  const minutes = Math.floor(Math.round(ms / 1000) / 60);

                  return (
                    <Flex>
                      <Flex
                        h="2.4rem"
                        px={2}
                        py={1}
                        mt={1}
                        mr={1}
                        alignItems="center"
                      >
                        {`${minutes}`.padStart(2, "0")}:
                        {`${seconds}`.padStart(2, "0")}
                      </Flex>
                      {event.kind === "kill" && (
                        <KillFeedItem
                          key={j}
                          {...event}
                          teams={props.teams}
                          round={i + 1}
                        />
                      )}

                      {event.kind === "plant" && (
                        <EventBox borderColor="gray">
                          {event.planter} planted the bomb
                        </EventBox>
                      )}

                      {event.kind === "defuse" && (
                        <EventBox borderColor="gray">
                          {event.defuser} defused the bomb
                        </EventBox>
                      )}

                      {event.kind === "bomb_explode" && (
                        <EventBox borderColor="gray">Bomb exploded</EventBox>
                      )}
                    </Flex>
                  );
                })}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
