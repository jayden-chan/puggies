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
  Badge,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, DataAPI, User } from "../../api";
import { DeleteUserModal } from "../../components/DeleteUserModal";
import { EditUserModal } from "../../components/EditUserModal";
import { roleColor } from "../../data";

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currUser, setCurrUser] = useState<User>({
    username: "",
    displayName: "",
    email: "",
    roles: [],
    steamId: "",
  });

  const navigate = useNavigate();
  const {
    isOpen: deleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();
  const {
    isOpen: editModalOpen,
    onOpen: openEditModal,
    onClose: closeEditModal,
  } = useDisclosure();

  const fetchUsers = useCallback(() => {
    const api = new DataAPI();
    api
      .users()
      .then((users) => setUsers(users))
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      });
  }, [navigate]);

  useEffect(() => fetchUsers(), [fetchUsers]);

  return (
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
              <Td>
                {user.roles.length > 0 ? (
                  <Flex>
                    {user.roles.map((r) => (
                      <Badge
                        key={`${user.username}${r}`}
                        mr={1}
                        colorScheme={roleColor(r)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </Flex>
                ) : (
                  <Badge key={`${user.username}norole`}>None</Badge>
                )}
              </Td>
              <Td>{user.steamId !== "" ? user.steamId : "not linked"}</Td>
              <Td mx={0} px={0}>
                <Menu isLazy placement="bottom-end">
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<FontAwesomeIcon icon={faBars} color="gray" />}
                    variant="ghost"
                  />
                  <MenuList>
                    <MenuGroup title="Admin options">
                      <MenuItem
                        onClick={() => {
                          setCurrUser(user);
                          openDeleteModal();
                        }}
                      >
                        Delete
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setCurrUser(user);
                          openEditModal();
                        }}
                      >
                        Edit
                      </MenuItem>
                    </MenuGroup>
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <DeleteUserModal
        displayName={currUser.displayName}
        username={currUser.username}
        isOpen={deleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          fetchUsers();
        }}
      />

      <EditUserModal
        currUser={currUser}
        isOpen={editModalOpen}
        onClose={() => {
          closeEditModal();
          fetchUsers();
        }}
      />
    </Box>
  );
};
