import {
  Divider,
  Flex,
  FlexProps,
  Grid,
  Heading,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { getRoundIcon } from ".";
import {
  CT_BLUE,
  Match,
  Round,
  Team,
  TEAM_COLORS_MAP,
  T_YELLOW,
} from "../../types";
import { GridIcon } from "./PlayerInfo";

const RoundResultIcon = (props: {
  round: Round;
  topTeam: Team;
  roundNum: number;
}) => {
  const icon = getRoundIcon(props.round);
  return (
    <>
      <GridIcon
        bg={TEAM_COLORS_MAP[props.topTeam]}
        visibility={props.round.winner === props.topTeam ? "initial" : "hidden"}
        label={`Round ${props.roundNum}`}
        icon={icon}
      />
      <GridIcon
        bg={props.topTeam === "CT" ? T_YELLOW : CT_BLUE}
        visibility={props.round.winner !== props.topTeam ? "initial" : "hidden"}
        label={`Round ${props.roundNum}`}
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
    templateRows="repeat(2, 1.9rem)"
    templateColumns="repeat(15, 1.9rem)"
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

const FlexCol = (props: FlexProps) => (
  <Flex
    {...props}
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
  >
    {props.children}
  </Flex>
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

  const teamAStartSide = data.roundByRound[0].teamASide;
  const teamBStartSide = data.roundByRound[0].teamBSide;

  return (
    <Flex my={5} h="110px" alignItems="center" justifyContent="flex-start">
      <Flex mr={10}>
        <FlexCol mr={5}>
          <ScoreNumber side={teamAStartSide} rounds={[0, 15]} />
          <Text>1st</Text>
          <ScoreNumber side={teamBStartSide} rounds={[0, 15]} />
        </FlexCol>

        <FlexCol>
          <ScoreNumber side={teamBStartSide} rounds={[15, 30]} />
          <Text>2nd</Text>
          <ScoreNumber side={teamAStartSide} rounds={[15, 30]} />
        </FlexCol>

        {data.rounds.length > 30 &&
          Array.from(
            Array(Math.ceil((data.rounds.length - 30) / 6)).keys()
          ).map((overtime) => {
            const i = 30 + overtime * 6;
            const sideA = overtime % 2 === 0 ? teamBStartSide : teamAStartSide;
            const sideB = overtime % 2 === 0 ? teamAStartSide : teamBStartSide;
            return (
              <FlexCol ml={5}>
                <Flex>
                  <ScoreNumber side={sideA} rounds={[i, i + 3]} />
                  <Heading fontSize="3xl" mx={0.5}>
                    :
                  </Heading>
                  <ScoreNumber side={sideB} rounds={[i + 3, i + 6]} />
                </Flex>
                <Text>OT {overtime + 1}</Text>
                <Flex>
                  <ScoreNumber side={sideB} rounds={[i, i + 3]} />
                  <Heading fontSize="3xl" mx={0.5}>
                    :
                  </Heading>
                  <ScoreNumber side={sideA} rounds={[i + 3, i + 6]} />
                </Flex>
              </FlexCol>
            );
          })}
      </Flex>

      <RoundResultGridHalf
        rounds={data.rounds}
        range={[0, 15]}
        topTeam={teamAStartSide}
      />
      <Divider orientation="vertical" mx={5} />
      <RoundResultGridHalf
        rounds={data.rounds}
        range={[15, 30]}
        topTeam={teamBStartSide}
      />
    </Flex>
  );
};
