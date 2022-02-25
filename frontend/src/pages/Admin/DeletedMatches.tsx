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
  useToast,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, DataAPI } from "../../api";
import { DeleteUserModal } from "../../components/DeleteUserModal";
import { formatDate } from "../../data";
import { MatchInfo } from "../../types";

export const DeletedMatches = () => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deleteUserDisplay, setDeleteUserDisplay] = useState("");

  const navigate = useNavigate();
  const toast = useToast();

  const {
    isOpen: deleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  const fetchMatches = () => {
    const api = new DataAPI();
    api
      .deletedMatches()
      .then((matches) => setMatches(matches))
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      });
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <Box my={5} overflowX="auto">
      <Table variant="simple" size="sm" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Map</Th>
            <Th>Date</Th>
            <Th textAlign="right">Home</Th>
            <Th textAlign="center">Score</Th>
            <Th>Away</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {matches.map((match) => (
            <Tr key={match.id}>
              <Td>{match.id}</Td>
              <Td>{match.map}</Td>
              <Td>{formatDate(match.dateTimestamp)}</Td>
              <Td textAlign="right">{match.teamATitle}</Td>
              <Td textAlign="center">
                {match.teamAScore}:{match.teamBScore}
              </Td>

              <Td>{match.teamBTitle}</Td>
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
                          const api = new DataAPI();
                          api
                            .fullDeleteMatch(match.id)
                            .then(() => {
                              api.triggerRescan().then(() => {
                                toast({
                                  title:
                                    "Match restored. Demo parsing in progress - check back soon",
                                  status: "success",
                                  duration: 3000,
                                  isClosable: true,
                                });
                                fetchMatches();
                              });
                            })
                            .catch((err) => {
                              if (err instanceof APIError) {
                                toast({
                                  title: `Failed to restore match: ${err.message}`,
                                  status: "error",
                                  isClosable: true,
                                });
                              }
                            });
                        }}
                      >
                        Restore
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
        displayName={deleteUserDisplay}
        username={deleteUsername}
        isOpen={deleteModalOpen}
        onClose={() => {
          closeDeleteModal();
          fetchMatches();
        }}
      />
    </Box>
  );
};
