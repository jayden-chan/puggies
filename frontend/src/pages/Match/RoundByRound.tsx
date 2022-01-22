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
import { getScore } from "../../data";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CT_BLUE,
  CT_KILLFEED,
  Kill,
  KillFeed,
  RED_KILLFEED,
  Round,
  Team,
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

const KillFeedIcon = (props: { show: boolean; src: string }) => (
  <Image
    src={`/killfeed${props.src}`}
    h="20px"
    mr={2}
    display={props.show ? "unset" : "none"}
  />
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
      <KillFeedIcon src="/blind.png" show={props.kill.attackerBlind} />
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
          <KillFeedIcon src="/flashassist.png" show />
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

      <KillFeedIcon src="/noscope.png" show={props.kill.noScope} />
      <KillFeedIcon src="/smoke.png" show={props.kill.throughSmoke} />
      <KillFeedIcon
        src="/wallbang.png"
        show={props.kill.penetratedObjects > 0}
      />
      <KillFeedIcon src="/headshot.png" show={props.kill.isHeadshot} />
      <KillFeedPlayer
        player={props.victim}
        teams={props.teams}
        round={props.round}
      />
    </Flex>
  );
};

const RoundResultIcon = (props: { round: Round }) => {
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
      mr="auto"
    >
      <Tooltip label={label}>
        <Flex alignItems="center" justifyContent="center" h="100%">
          <FontAwesomeIcon icon={icon} color="black" />
        </Flex>
      </Tooltip>
    </Box>
  );
};

export const RoundByRound = (props: {
  killFeed: KillFeed;
  teams: TeamsMap;
  rounds: Round[];
}) => {
  return (
    <Accordion allowMultiple>
      {props.killFeed.map((k, i) => {
        const teamAScore = getScore(props.rounds, "CT", i + 1);
        const teamBScore = getScore(props.rounds, "T", i + 1);
        const kills: KillFeedThing[] = Object.entries(k)
          .map(([killer, kills]) =>
            Object.entries(kills).map(([victim, kill]) => ({
              killer,
              victim,
              kill,
            }))
          )
          .flat()
          .sort((a, b) => a.kill.timeMs - b.kill.timeMs);

        return (
          <AccordionItem>
            <AccordionButton>
              <Flex w="100%" alignItems="center">
                <Flex flex={1} justifyContent="center" alignItems="center">
                  <Heading
                    as="h3"
                    fontSize="1.25rem"
                    textAlign="left"
                    mr={3}
                    lineHeight="1.25rem"
                    height="1.25rem"
                  >
                    Round {i + 1}
                  </Heading>
                  <RoundResultIcon round={props.rounds[i]} />
                </Flex>

                <Flex flex={1} justifyContent="center">
                  <Heading
                    as="h3"
                    fontSize="xl"
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
                    textColor={i < 15 ? CT_BLUE : T_YELLOW}
                  >
                    {teamBScore}
                  </Heading>
                </Flex>
                <Flex flex={1} justifyContent="center">
                  <AccordionIcon ml="auto" />
                </Flex>
              </Flex>
            </AccordionButton>

            <AccordionPanel>
              <Flex flexDirection="column" alignItems="start" mt={2}>
                {kills.map((k) => (
                  <KillFeedItem {...k} teams={props.teams} round={i + 1} />
                ))}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
