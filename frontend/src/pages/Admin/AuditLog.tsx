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
import { api, APIError, AuditEntry } from "../../api";
import { PaginationBar } from "../../components/PaginationBar";
import { formatAuditDate } from "../../data";

const LIMIT = 30;

export const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [auditSize, setAuditSize] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const offset = (page - 1) * LIMIT;
  const pages = Math.ceil(auditSize / LIMIT);

  const navigate = useNavigate();

  const fetchEntries = useCallback(() => {
    setIsRefreshing(true);
    Promise.all([
      api()
        .auditLog(LIMIT, offset)
        .then((entries) => setEntries(entries)),
      api()
        .auditLogSize()
        .then((size) => setAuditSize(size)),
    ])
      .catch((err) => {
        if (err instanceof APIError && err.code === 401) {
          navigate("/");
        }
      })
      .finally(() => setIsRefreshing(false));
  }, [navigate, offset]);

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
            totalPages={pages}
            isRefreshing={isRefreshing}
            setPage={(p) => setPage(p)}
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
                  <Td>{formatAuditDate(entry.timestamp)}</Td>
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
            totalPages={pages}
            isRefreshing={isRefreshing}
            setPage={(p) => setPage(p)}
            onRefresh={() => fetchEntries()}
          />
        </>
      )}
    </Box>
  );
};
