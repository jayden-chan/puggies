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
  Flex,
  Heading,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import React from "react";

export const Admin = (props: {}) => {
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
          <Tab whiteSpace="nowrap">Audit Log</Tab>
        </TabList>
        <TabPanels overflowX="auto">
          <TabPanel>Hello there testing from the users tab</TabPanel>
          <TabPanel>Hello there testing from the audit log tab</TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
