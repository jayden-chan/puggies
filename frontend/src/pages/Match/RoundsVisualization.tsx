import { Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Data, Round, Team } from "../../types";

const T_YELLOW = "#ead18a";
const CT_BLUE = "#b5d4ee";

const RoundResultIcon = (props: { round: Round; topTeam: Team }) => {
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
      <Flex
        visibility={props.round.winner === props.topTeam ? "initial" : "hidden"}
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
      <Flex
        visibility={props.round.winner !== props.topTeam ? "initial" : "hidden"}
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
    </Flex>
  );
};

export const RoundsVisualization = (props: { data: Data }) => {
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
          <Heading textColor={CT_BLUE} fontSize="3xl">
            {data.rounds.slice(15).filter((r) => r.winner === "CT").length}
          </Heading>
          <Text>2nd</Text>
          <Heading textColor={T_YELLOW} fontSize="3xl">
            {data.rounds.slice(15).filter((r) => r.winner === "T").length}
          </Heading>
        </Flex>
      </Flex>

      <Flex alignItems="center">
        {data.rounds.slice(0, 15).map((r) => (
          <RoundResultIcon round={r} topTeam="T" />
        ))}

        <Divider orientation="vertical" mx={5} />

        {data.rounds.slice(15).map((r) => (
          <RoundResultIcon round={r} topTeam="CT" />
        ))}
      </Flex>
    </Flex>
  );
};
