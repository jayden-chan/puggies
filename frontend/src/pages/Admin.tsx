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
  Container,
  Divider,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, DataAPI, User } from "../api";
import { DeleteUserModal } from "../components/DeleteUserModal";

export const Admin = (props: {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deleteUserDisplay, setDeleteUserDisplay] = useState("");

  const navigate = useNavigate();

  const {
    isOpen: deleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  const fetchUsers = () => {
    const api = new DataAPI();
    api
      .users()
      .then((users) => setUsers(users))
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
          <TabPanel>
            <Box my={5} overflowX="auto">
              <Table variant="simple" size="sm" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Username</Th>
                    <Th>Email</Th>
                    <Th>Roles</Th>
                    <Th>SteamID</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.username}>
                      <Td>{user.displayName}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>[{user.roles.join(", ")}]</Td>
                      <Td>
                        {user.steamId !== "" ? user.steamId : "not linked"}
                      </Td>
                      <Td mx={0} px={0}>
                        <Menu isLazy placement="bottom-end">
                          <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={
                              <FontAwesomeIcon icon={faBars} color="gray" />
                            }
                            variant="ghost"
                          />
                          <MenuList>
                            <MenuGroup title="Admin options">
                              <MenuItem
                                onClick={() => {
                                  setDeleteUserDisplay(user.displayName);
                                  setDeleteUsername(user.username);
                                  openDeleteModal();
                                }}
                              >
                                Delete
                              </MenuItem>
                              <MenuItem>Edit</MenuItem>
                            </MenuGroup>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
          <TabPanel>Hello there testing from the audit log tab</TabPanel>
        </TabPanels>
      </Tabs>
      <DeleteUserModal
        displayName={deleteUserDisplay}
        username={deleteUsername}
        isOpen={deleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          fetchUsers();
        }}
      />
    </Container>
  );
};
