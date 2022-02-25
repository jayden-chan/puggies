import {
  Box,
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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, DataAPI, User } from "../../api";
import { DeleteUserModal } from "../../components/DeleteUserModal";

export const Users = () => {
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

      <DeleteUserModal
        displayName={deleteUserDisplay}
        username={deleteUsername}
        isOpen={deleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          fetchUsers();
        }}
      />
    </Box>
  );
};
