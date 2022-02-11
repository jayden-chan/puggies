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
import { OpeningKill, PlayerNames } from "../../types";

const WeaponImg = (props: { name: string } & ImageProps) => (
  <Image src={`/assets/weapons/${props.name}.png`} h={7} />
);

export const OpeningDuels = (props: {
  data: OpeningKill[];
  playerNames: PlayerNames;
}) => {
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
              <Td>{props.playerNames[k.attacker]}</Td>
              <Td>
                <WeaponImg name={k.kill.weapon} />
              </Td>
              <Td>{props.playerNames[k.victim]}</Td>
              <Td>{msToRoundTime(k.kill.timeMs)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
