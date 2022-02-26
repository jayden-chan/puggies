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
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, DataAPI } from "../../api";
import { formatDate } from "../../data";
import { MatchInfo } from "../../types";

export const DeletedMatches = () => {
  const [matches, setMatches] = useState<MatchInfo[]>([]);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchMatches = useCallback(() => {
    const api = new DataAPI();
    api
      .deletedMatches()
      .then((matches) => setMatches(matches))
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      });
  }, [navigate]);

  useEffect(() => fetchMatches(), [fetchMatches]);

  return (
    <Box my={5} overflowX="auto">
      {matches.length === 0 && (
        <Flex
          alignItems="center"
          minH="50vh"
          justifyContent="center"
          flexDirection="column"
        >
          <Text
            fontSize="5rem"
            lineHeight="5rem"
            fontWeight="bold"
            color="#262f40"
            mb={7}
          >
            No deleted matches
          </Text>
        </Flex>
      )}
      {matches.length > 0 && (
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
                          onClick={async () => {
                            const api = new DataAPI();
                            try {
                              await api.fullDeleteMatch(match.id);
                              await api.triggerRescan();
                              toast({
                                title:
                                  "Match restored. Demo parsing in progress - check back soon",
                                status: "success",
                                duration: 3000,
                                isClosable: true,
                              });
                              fetchMatches();
                            } catch (e) {
                              if (e instanceof Error) {
                                toast({
                                  title: `Failed to restore match: ${e.message}`,
                                  status: "error",
                                  isClosable: true,
                                });
                              }
                            }
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
      )}
    </Box>
  );
};
