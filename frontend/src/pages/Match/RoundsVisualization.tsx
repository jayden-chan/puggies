import { Divider, Flex, Heading, Text, Tooltip } from "@chakra-ui/react";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Match, Round, Team } from "../../types";

const T_YELLOW = "#ead18a";
const CT_BLUE = "#b5d4ee";

const RoundResultIcon = (props: {
  round: Round;
  topTeam: Team;
  roundNum: number;
}) => {
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
    <Flex flexDirection="column" h="67%" mx="2px">
      <Tooltip label={`Round ${props.roundNum}`}>
        <Flex
          visibility={
            props.round.winner === props.topTeam ? "initial" : "hidden"
          }
          h="50%"
          w="min"
          alignItems="center"
          justifyContent="center"
          backgroundColor={props.topTeam === "T" ? T_YELLOW : CT_BLUE}
          borderRadius={5}
          px={2}
        >
          <FontAwesomeIcon icon={icon} color="black" />
        </Flex>
      </Tooltip>
      <Tooltip label={`Round ${props.roundNum}`}>
        <Flex
          visibility={
            props.round.winner !== props.topTeam ? "initial" : "hidden"
          }
          h="50%"
          w="min"
          alignItems="center"
          justifyContent="center"
          backgroundColor={props.topTeam !== "T" ? T_YELLOW : CT_BLUE}
          borderRadius={5}
          px={2}
        >
          <FontAwesomeIcon icon={icon} color="black" />
        </Flex>
      </Tooltip>
    </Flex>
  );
};

export const RoundsVisualization = (props: { data: Match }) => {
  const { data } = props;
  const ScoreNumber = (props: { rounds: number[]; side: Team }) => (
    <Heading textColor={props.side === "T" ? T_YELLOW : CT_BLUE} fontSize="3xl">
      {
        data.rounds
          .slice(...props.rounds)
          .filter((r) => r.winner === props.side).length
      }
    </Heading>
  );

  return (
    <Flex my={5}>
      <Flex mr={10}>
        <Flex
          flexDirection="column"
          mr={5}
          alignItems="center"
          justifyContent="center"
        >
          <ScoreNumber side="T" rounds={[0, 15]} />
          <Text>1st</Text>
          <ScoreNumber side="CT" rounds={[0, 15]} />
        </Flex>

        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <ScoreNumber side="CT" rounds={[15]} />
          <Text>2nd</Text>
          <ScoreNumber side="T" rounds={[15]} />
        </Flex>
      </Flex>

      <Flex alignItems="center">
        {data.rounds.slice(0, 15).map((r, i) => (
          <RoundResultIcon
            key={`round${i + 1}`}
            round={r}
            topTeam="T"
            roundNum={i + 1}
          />
        ))}

        <Divider orientation="vertical" mx={5} />

        {data.rounds.slice(15).map((r, i) => (
          <RoundResultIcon
            key={`round${i + 16}`}
            round={r}
            topTeam="CT"
            roundNum={i + 16}
          />
        ))}
      </Flex>
    </Flex>
  );
};
