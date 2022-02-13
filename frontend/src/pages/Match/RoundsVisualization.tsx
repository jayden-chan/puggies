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
  Divider,
  Flex,
  FlexProps,
  Grid,
  GridProps,
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

const RoundResultGrid = (props: {
  rounds: Round[];
  range: [number, number];
  topTeam: Team;
  styles?: GridProps;
}) => {
  const rounds = props.rounds.slice(...props.range);
  return (
    <Grid
      {...props.styles}
      templateRows="repeat(2, 1.9rem)"
      templateColumns={`repeat(${rounds.length}, 1.9rem)`}
      gridAutoFlow="column"
      gap={1}
    >
      {rounds.map((r, i) => (
        <RoundResultIcon
          key={`round${i + props.range[0] + 1}`}
          round={r}
          topTeam={props.topTeam}
          roundNum={i + props.range[0] + 1}
        />
      ))}
    </Grid>
  );
};

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
  const { matchData: data } = props.data;
  const ScoreNumber = (props: { rounds: number[]; side: Team }) => (
    <Heading textColor={TEAM_COLORS_MAP[props.side]} fontSize="3xl">
      {
        data.rounds
          .slice(...props.rounds)
          .filter((r) => r.winner === props.side).length
      }
    </Heading>
  );

  const teamAStartSide = data.roundByRound[0].teamASide;
  const teamBStartSide = data.roundByRound[0].teamBSide;

  const overtimes =
    data.rounds.length > 30
      ? Array.from(Array(Math.ceil((data.rounds.length - 30) / 6)).keys())
      : [];

  return (
    <Flex
      my={5}
      h="110px"
      w="100%"
      alignItems="center"
      justifyContent="flex-start"
      overflowX="auto"
    >
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

        {overtimes.map((ot) => {
          const i = 30 + ot * 6;
          const sideA = ot % 2 === 0 ? teamBStartSide : teamAStartSide;
          const sideB = ot % 2 === 0 ? teamAStartSide : teamBStartSide;
          return (
            <FlexCol ml={5} key={`otscore${ot}`}>
              <Flex>
                <ScoreNumber side={sideA} rounds={[i, i + 3]} />
                <Heading fontSize="3xl" mx={0.5}>
                  :
                </Heading>
                <ScoreNumber side={sideB} rounds={[i + 3, i + 6]} />
              </Flex>
              <Text>OT {ot + 1}</Text>
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

      <RoundResultGrid
        rounds={data.rounds}
        range={[0, 15]}
        topTeam={teamAStartSide}
      />
      <Divider orientation="vertical" mx={5} />
      <RoundResultGrid
        rounds={data.rounds}
        range={[15, 30]}
        topTeam={teamBStartSide}
      />
      {overtimes
        .map((ot) => {
          const i = 30 + ot * 6;
          const sideA = ot % 2 === 0 ? teamBStartSide : teamAStartSide;
          const sideB = ot % 2 === 0 ? teamAStartSide : teamBStartSide;
          return [
            <Divider orientation="vertical" mx={5} key={`otdiv${ot}`} />,
            <RoundResultGrid
              rounds={data.rounds}
              range={[i, i + 3]}
              styles={{ mr: 1 }}
              topTeam={sideA}
              key={`otviz1_${ot}`}
            />,
            <RoundResultGrid
              rounds={data.rounds}
              range={[i + 3, i + 6]}
              topTeam={sideB}
              key={`otviz2_${ot}`}
            />,
          ];
        })
        .flat()}
    </Flex>
  );
};
