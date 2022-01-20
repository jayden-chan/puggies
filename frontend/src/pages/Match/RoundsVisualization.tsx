import { Divider, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { faBomb, faCut, faSkull } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Match, Round, Team } from "../../types";
import { GridIcon } from "./PlayerInfo";

export const T_YELLOW = "#ead18a";
export const CT_BLUE = "#b5d4ee";

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
    <>
      <GridIcon
        bg={props.topTeam === "T" ? T_YELLOW : CT_BLUE}
        visibility={props.round.winner === props.topTeam ? "initial" : "hidden"}
        icon={icon}
      />
      <GridIcon
        bg={props.topTeam !== "T" ? T_YELLOW : CT_BLUE}
        visibility={props.round.winner !== props.topTeam ? "initial" : "hidden"}
        icon={icon}
      />
    </>
  );
};

const RoundResultGridHalf = (props: {
  rounds: Round[];
  range: number[];
  topTeam: Team;
}) => (
  <Grid
    templateRows="repeat(2, 30px)"
    templateColumns="repeat(15, 30px)"
    gridAutoFlow="column"
    gap={1}
  >
    {props.rounds.slice(...props.range).map((r, i) => (
      <RoundResultIcon
        key={`round${i + props.range[0] + 1}`}
        round={r}
        topTeam={props.topTeam}
        roundNum={i + props.range[0] + 1}
      />
    ))}
  </Grid>
);

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
    <Flex my={5} h="110px" alignItems="center" justifyContent="flex-start">
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

      <RoundResultGridHalf rounds={data.rounds} range={[0, 15]} topTeam="T" />
      <Divider orientation="vertical" mx={5} />
      <RoundResultGridHalf rounds={data.rounds} range={[15]} topTeam="CT" />
    </Flex>
  );
};
