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
  Tooltip,
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
  WeaponType,
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

const KillFeedIcon = (props: { src: string }) => (
  <Image src={`/killfeed${props.src}`} h="20px" mr={2} />
);

const KillFeedPlayer = (props: {
  player: string;
  round: number;
  teams: TeamsMap;
  mx?: number;
}) => (
  <Text
    as="span"
    mt="2px"
    mx={props.mx ?? undefined}
    fontWeight="bold"
    color={playerColor(props.player, props.teams, props.round)}
  >
    {props.player}
  </Text>
);

const KillFeedItem = (
  props: KillFeedThing & { round: number; teams: TeamsMap }
) => {
  return (
    <Flex
      bg="black"
      borderColor={RED_KILLFEED}
      alignItems="center"
      borderRadius={8}
      borderWidth={3}
      px={2}
      py={1}
      mt={1}
    >
      {props.kill.attackerBlind && <KillFeedIcon src="/blind.png" />}
      <KillFeedPlayer
        player={props.killer}
        teams={props.teams}
        round={props.round}
      />

      {props.kill.assistedFlash === true && (
        <>
          <KillFeedPlayer
            mx={2}
            player={"+"}
            teams={props.teams}
            round={props.round}
          />
          <KillFeedIcon src="/flashassist.png" />
          <KillFeedPlayer
            player={props.kill.assister}
            teams={props.teams}
            round={props.round}
          />
        </>
      )}

      <KillFeedPlayer
        mx={2}
        player={WeaponType[props.kill.weapon]}
        teams={props.teams}
        round={props.round}
      />

      {props.kill.noScope && <KillFeedIcon src="/noscope.png" />}
      {props.kill.throughSmoke && <KillFeedIcon src="/smoke.png" />}
      {props.kill.penetratedObjects > 0 && <KillFeedIcon src="/wallbang.png" />}
      {props.kill.isHeadshot && <KillFeedIcon src="/headshot.png" />}
      <KillFeedPlayer
        player={props.victim}
        teams={props.teams}
        round={props.round}
      />
    </Flex>
  );
};

const RoundResultIcon = (props: { round: Round; visibility: boolean }) => {
  if (props.visibility === false) {
    return <Box w="1.9rem" h="1.9rem" visibility="hidden" />;
  }

  let icon;
  let label;
  switch (props.round.winReason) {
    case 1:
      icon = faBomb;
      label = "Ts win by bomb explosion";
      break;
    case 7:
      icon = faCut;
      label = "CTs win by defusing bomb";
      break;
    default:
      icon = faSkull;
      label = `${props.round.winner}s win by killing opponents`;
      break;
  }

  return (
    <Box
      bg={props.round.winner === "CT" ? CT_BLUE : T_YELLOW}
      borderRadius={5}
      w="1.9rem"
      h="1.9rem"
    >
      <Tooltip label={label}>
        <Flex alignItems="center" justifyContent="center" h="100%">
          <FontAwesomeIcon icon={icon} color="black" />
        </Flex>
      </Tooltip>
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
        const { teamAScore, teamBScore, kills } = r;

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
                {kills.map((k, i) => (
                  <KillFeedItem
                    key={i}
                    {...k}
                    teams={props.teams}
                    round={i + 1}
                  />
                ))}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
