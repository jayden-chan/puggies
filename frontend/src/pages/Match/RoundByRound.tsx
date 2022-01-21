import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import {
  CT_KILLFEED,
  Kill,
  KillFeed,
  RED_KILLFEED,
  TeamsMap,
  T_KILLFEED,
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

export const RoundByRound = (props: {
  killFeed: KillFeed;
  teams: TeamsMap;
}) => {
  return (
    <Accordion allowMultiple>
      {props.killFeed.map((k, i) => {
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
              <Heading flex="1" as="h3" fontSize="xl" textAlign="left">
                Round {i + 1}
              </Heading>
              <AccordionIcon />
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
