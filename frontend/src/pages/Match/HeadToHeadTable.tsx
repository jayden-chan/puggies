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
  Box,
  Flex,
  FlexProps,
  Grid,
  GridItem,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { HeadToHead, PlayerNames } from "../../types";

const headToHeadColor = (diff: number): string => {
  if (diff === 0) {
    return "#8aa660";
  }

  if (diff > 0) {
    if (diff < 3) {
      return "#8cb34d";
    } else if (diff < 5) {
      return "#75b34d";
    } else {
      return "#5eb34d";
    }
  } else {
    if (diff > -3) {
      return "#b3644d";
    } else if (diff > -5) {
      return "#b3564d";
    } else {
      return "#b54545";
    }
  }
};

const KillCountCircle = (props: FlexProps) => (
  <Flex
    {...props}
    alignItems="center"
    style={{ boxShadow: "-5px 5px 5px rgba(0, 0, 0, 0.40)" }}
    borderRadius="30px"
    justifyContent="center"
    position="absolute"
    h="40px"
    w="40px"
  >
    {props.children}
  </Flex>
);

export const HeadToHeadTable = (props: {
  headToHead: HeadToHead;
  playerNames: PlayerNames;
  teams: [string[], string[]];
}) => {
  const { colorMode } = useColorMode();
  return (
    <Grid
      templateRows="repeat(6, auto)"
      templateColumns="repeat(6, 150px)"
      gap={1}
      overflowX="auto"
    >
      <GridItem colSpan={1} key="asd">
        {" "}
      </GridItem>
      {props.teams[0].map((p) => (
        <Flex alignItems="center" justifyContent="center" key={p} mb={3}>
          <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
            {props.playerNames[p]}
          </Text>
        </Flex>
      ))}

      {props.teams[1]
        .map((rowPlayer) => {
          return [
            <Flex
              alignItems="center"
              justifyContent="flex-end"
              h="100%"
              mr={3}
              key={rowPlayer}
            >
              <Text
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {props.playerNames[rowPlayer]}
              </Text>
            </Flex>,
            props.teams[0].map((columnPlayer) => {
              const colKills =
                (props.headToHead[columnPlayer] ?? { "": "" })[rowPlayer] ?? 0;
              const rowKills =
                (props.headToHead[rowPlayer] ?? { "": "" })[columnPlayer] ?? 0;
              const diff = colKills - rowKills;
              return (
                <Flex
                  h="90px"
                  w="150px"
                  key={`${rowPlayer}${columnPlayer}`}
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor={
                    colorMode === "dark" ? "#1f2736" : "lightgray"
                  }
                >
                  <Box w="100px" h="90px" position="relative">
                    <KillCountCircle
                      backgroundColor={headToHeadColor(-diff)}
                      bottom="12px"
                      left="16px"
                    >
                      {rowKills}
                    </KillCountCircle>
                    <KillCountCircle
                      backgroundColor={headToHeadColor(diff)}
                      top="12px"
                      right="16px"
                    >
                      {colKills}
                    </KillCountCircle>
                  </Box>
                </Flex>
              );
            }),
          ];
        })
        .flat()}
    </Grid>
  );
};
