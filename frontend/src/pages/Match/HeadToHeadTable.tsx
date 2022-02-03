import {
  Box,
  Flex,
  FlexProps,
  Grid,
  GridItem,
  useColorMode,
} from "@chakra-ui/react";
import React from "react";
import { HeadToHead } from "../../types";

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
  teams: [string[], string[]];
}) => {
  const { colorMode } = useColorMode();
  return (
    <Grid
      templateRows="repeat(6, auto)"
      templateColumns="repeat(6, min-content)"
      gap={1}
      overflowX="auto"
    >
      <GridItem colSpan={1} key="asd">
        {" "}
      </GridItem>
      {props.teams[0].map((p) => (
        <Flex alignItems="center" justifyContent="center" key={p} mb={3}>
          {p}
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
              {rowPlayer}
            </Flex>,
            props.teams[0].map((columnPlayer) => {
              const colKills = props.headToHead[columnPlayer][rowPlayer] ?? 0;
              const rowKills = props.headToHead[rowPlayer][columnPlayer] ?? 0;
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
