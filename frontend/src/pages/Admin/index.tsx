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
  Container,
  Divider,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React from "react";
import { AuditLog } from "./AuditLog";
import { DeletedMatches } from "./DeletedMatches";
import { Users } from "./Users";

export const Admin = () => {
  return (
    <Container maxW="container.xl" pt={8} minH="calc(100vh - 5.5rem)">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading lineHeight="unset" mb={0}>
          Administration
        </Heading>
      </Flex>
      <Divider my={5} />
      <Tabs>
        <TabList>
          <Tab whiteSpace="nowrap">Users</Tab>
          <Tab whiteSpace="nowrap">Deleted Matches</Tab>
          <Tab whiteSpace="nowrap">Audit Log</Tab>
        </TabList>
        <TabPanels overflowX="auto">
          <TabPanel>
            <Users />
          </TabPanel>
          <TabPanel>
            <DeletedMatches />
          </TabPanel>
          <TabPanel>
            <AuditLog />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
