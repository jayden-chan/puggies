import {
  Flex,
  Image,
  ImageProps,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { msToRoundTime } from "../../data";
import { OpeningKill } from "../../types";

const WeaponImg = (props: { name: string } & ImageProps) => (
  <Image src={`/img/weapons/${props.name}.png`} h={7} />
);

export const OpeningDuels = (props: { data: OpeningKill[] }) => {
  return (
    <Flex flexDir="column">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Round</Th>
            <Th>Attacker</Th>
            <Th>Weapon</Th>
            <Th>Victim</Th>
            <Th>Time</Th>
          </Tr>
        </Thead>

        <Tbody>
          {props.data.map((k, i) => (
            <Tr key={i}>
              <Td>{i + 1}</Td>
              <Td>{k.attacker}</Td>
              <Td>
                <WeaponImg name={k.kill.weapon} />
              </Td>
              <Td>{k.victim}</Td>
              <Td>{msToRoundTime(k.kill.timeMs)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
