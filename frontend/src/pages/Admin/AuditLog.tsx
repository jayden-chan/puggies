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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { APIError, AuditEntry, DataAPI } from "../../api";
import { PaginationBar } from "../../components/PaginationBar";
import { formatDate } from "../../data";

export const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = 25;
  const offset = (page - 1) * limit;

  const navigate = useNavigate();

  const fetchEntries = useCallback(() => {
    const api = new DataAPI();
    setIsRefreshing(true);
    api
      .auditLog(limit, offset)
      .then((entries) => setEntries(entries))
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      })
      .finally(() => setIsRefreshing(false));
  }, [navigate, limit, offset]);

  useEffect(() => fetchEntries(), [fetchEntries]);

  return (
    <Box overflowX="auto">
      {entries.length === 0 && (
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
            No audit log entries
          </Text>
        </Flex>
      )}
      {entries.length > 0 && (
        <>
          <PaginationBar
            page={page}
            hasPrev={page > 1}
            hasNext={entries.length === limit}
            isRefreshing={isRefreshing}
            onPrev={() => setPage((prev) => prev - 1)}
            onNext={() => setPage((prev) => prev + 1)}
            onRefresh={() => fetchEntries()}
          />
          <Table variant="simple" size="md" colorScheme="gray" my={3}>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {entries.map((entry) => (
                <Tr key={entry.timestamp}>
                  <Td>{formatDate(entry.timestamp)}</Td>
                  <Td>
                    {entry.username !== ""
                      ? entry.username
                      : entry.system
                      ? "System"
                      : "Deleted User"}
                  </Td>
                  <Td>{entry.action}</Td>
                  <Td>{entry.description}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <PaginationBar
            page={page}
            hasPrev={page > 1}
            hasNext={entries.length === limit}
            isRefreshing={isRefreshing}
            onPrev={() => setPage((prev) => prev - 1)}
            onNext={() => setPage((prev) => prev + 1)}
            onRefresh={() => fetchEntries()}
          />
        </>
      )}
    </Box>
  );
};
