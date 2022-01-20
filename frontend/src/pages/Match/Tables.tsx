import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Table, Tbody, Td, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import React from "react";
import { Data } from "../../types";

export type TableSchema = {
  key: keyof Data;
  title: string;
  label?: string;
  minW?: string;
  pct?: boolean;
  clickable?: boolean;
}[];

export const utilTableSchema: TableSchema = [
  { key: "name", title: "Player", minW: "150px", clickable: false },
  { key: "smokesThrown", title: "Smokes", label: "# of smokes thrown" },
  { key: "molliesThrown", title: "Molotovs", label: "# of molotovs thrown" },
  { key: "HEsThrown", title: "HE", label: "# of HE grenades thrown" },
  { key: "flashesThrown", title: "Flashes", label: "# of flashes thrown" },
  { key: "flashAssists", title: "FA", label: "Flash Assists" },
  { key: "utilDamage", title: "UD", label: "Utility Damage" },
  { key: "enemiesFlashed", title: "Enemies Blinded" },
  { key: "teammatesFlashed", title: "Teammates Blinded" },
  { key: "efPerFlash", title: "Enemies Blind per Flash" },
];

export const scoreTableSchema: TableSchema = [
  { key: "name", title: "Player", minW: "150px", clickable: false },
  { key: "kills", title: "K", label: "Kills" },
  { key: "assists", title: "A", label: "Assists" },
  { key: "deaths", title: "D", label: "Deaths" },
  { key: "timesTraded", title: "T", label: "# of times traded" },
  { key: "kd", title: "K/D", label: "Kill/death ratio" },
  { key: "kdiff", title: "K-D", label: "Kill-death difference" },
  { key: "kpr", title: "K/R", label: "Kills per round" },
  { key: "adr", title: "ADR", label: "Average damage per round" },
  {
    key: "headshotPct",
    title: "HS %",
    label: "Headshot kill percentage",
    pct: true,
  },
  { key: "2k", title: "2K" },
  { key: "3k", title: "3K" },
  { key: "4k", title: "4K" },
  { key: "5k", title: "5K" },
  { key: "hltv", title: "HLTV 2.0", label: "Approximate HLTV 2.0 rating" },
  { key: "impact", title: "Impact", label: "Approximate HLTV Impact rating" },
  {
    key: "kast",
    title: "KAST",
    pct: true,
    label: "% of rounds with kill/assist/survived/traded",
  },
];

export const StatTable = (props: {
  data: Data;
  players: string[];
  schema: TableSchema;
  sort: { key: keyof Data; reversed: boolean };
  colClicked?: (key: string) => void;
}) => {
  return (
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          {props.schema.map((col) => (
            <Th
              key={col.title}
              lineHeight="unset"
              style={{ cursor: col.clickable ?? true ? "pointer" : "unset" }}
              onClick={
                props.colClicked !== undefined && (col.clickable ?? true)
                  ? () => props.colClicked!(col.key)
                  : undefined
              }
            >
              {col.label !== undefined ? (
                <Tooltip label={col.label}>{col.title}</Tooltip>
              ) : (
                col.title
              )}
              {col.key === props.sort.key &&
                (props.sort.reversed ? (
                  <ChevronUpIcon w={4} h={4} />
                ) : (
                  <ChevronDownIcon w={4} h={4} />
                ))}
            </Th>
          ))}
        </Tr>
      </Thead>

      <Tbody>
        {props.players.map((player) => (
          <Tr key={player}>
            {props.schema.map((col) => {
              return (
                <Td minW={col.minW ?? "unset"} key={`${player}${col.key}`}>
                  {/* @ts-ignore */}
                  {props.data[col.key][player] ?? 0}
                  {col.pct === true ? "%" : ""}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
