import {
  Box,
  Flex,
  Heading,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { format, parse } from "date-fns";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Data, Team } from "../../types";
import { HeadToHeadTable } from "./HeadToHeadTable";
import { RoundsVisualization } from "./RoundsVisualization";
import { scoreTableSchema, StatTable, utilTableSchema } from "./Tables";

const getPlayers = (
  data: Data,
  side: Team,
  sortCol: keyof Data,
  reverse: boolean
) =>
  Object.keys(data.teams)
    .filter((player) => data.teams[player] === side)
    .sort((a, b) => {
      // @ts-ignore
      const aa = data[sortCol][reverse ? a : b] ?? 0;
      // @ts-ignore
      const bb = data[sortCol][reverse ? b : a] ?? 0;
      return aa - bb;
    });

export const Match = (props: { data: Data }) => {
  const { data } = props;
  const { id = "" } = useParams();

  const [sortCol, setSortCol] = useState<keyof Data>("hltv");
  const [reversed, setReversed] = useState(false);

  const [match, map, date] = id.match(/^pug_(.*?)_(\d\d\d\d-\d\d-\d\d)/) ?? [];
  if (!match) {
    return <></>;
  }

  const dateString = format(
    parse(date, "yyyy-MM-dd", new Date()),
    "EEE MMM dd yyyy"
  );

  const teamARounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "T").length +
    data.rounds.slice(15).filter((r) => r.winner === "CT").length;
  const teamBRounds =
    data.rounds.slice(0, 15).filter((r) => r.winner === "CT").length +
    data.rounds.slice(15).filter((r) => r.winner === "T").length;

  const teamAPlayers = getPlayers(data, "CT", sortCol, reversed);
  const teamBPlayers = getPlayers(data, "T", sortCol, reversed);

  const teamATitle = `team_${getPlayers(data, "CT", "hltv", false)[0]}`;
  const teamBTitle = `team_${getPlayers(data, "T", "hltv", false)[0]}`;

  const colHeaderClicked = (key: string) => {
    if (key === sortCol) {
      setReversed((prev) => !prev);
    } else {
      setSortCol(key as keyof Data);
      setReversed(false);
    }
  };

  return (
    <Flex w="100%" h="100vh" pt={30} alignItems="center" flexDirection="column">
      <Box w="80%" mb={3}>
        <Heading>pug on {map} </Heading>
        <Heading fontSize="lg" as="h2">
          {dateString}{" "}
          <Link href="https://drive.google.com/file/d/1nwOuFzF42yhw4FXLNxpa2V3_hNFsZvrP/view">
            {/* FIXME */}
            (demo link)
          </Link>
        </Heading>
      </Box>

      <Flex w="80%" alignItems="center" justifyContent="center">
        <Text mx={5} as="h2" fontSize="xl">
          {teamATitle}
        </Text>
        <Heading mx={2}>{teamARounds}</Heading>
        <Heading mx={1}>:</Heading>
        <Heading mx={2}>{teamBRounds}</Heading>
        <Text mx={5} as="h2" fontSize="xl">
          {teamBTitle}
        </Text>
      </Flex>

      <Tabs w="80%">
        <TabList>
          <Tab>Scoreboard</Tab>
          <Tab>Utility</Tab>
          <Tab>Head to Head</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <StatTable
              schema={scoreTableSchema}
              data={data}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamAPlayers}
            />
            <RoundsVisualization data={data} />
            <StatTable
              schema={scoreTableSchema}
              data={data}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamBPlayers}
            />
          </TabPanel>
          <TabPanel>
            <StatTable
              schema={utilTableSchema}
              data={data}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamAPlayers}
            />
            <Box my={5} />
            <StatTable
              schema={utilTableSchema}
              data={data}
              sort={{ key: sortCol, reversed }}
              colClicked={colHeaderClicked}
              players={teamBPlayers}
            />
          </TabPanel>
          <TabPanel>
            <Flex alignItems="center" justifyContent="center">
              <HeadToHeadTable
                teams={[teamAPlayers, teamBPlayers]}
                headToHead={data.headToHead}
              />
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
