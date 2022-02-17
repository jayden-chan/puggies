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
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Skeleton,
  Table,
  TableCellProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import shallow from "zustand/shallow";
import { DeleteMatchModal } from "../components/DeleteMatchModal";
import { UpdateMetaModal } from "../components/UpdateMetaModal";
import { formatDate, getDemoTypePretty } from "../data";
import { useLoginStore } from "../login";
import { MatchInfo } from "../types";

const RowLink = (props: TableCellProps & { to: string }) => (
  <Td {...props}>
    <Link to={props.to}>{props.children}</Link>
  </Td>
);

const TableRow = (props: {
  match: MatchInfo;
  isAdmin: boolean;
  openDelModal: () => void;
  openUpdModal: () => void;
  setDelMatch: (id: string) => void;
  setUpdMatch: (id: string) => void;
}) => {
  const { match } = props;
  const date = formatDate(match.dateTimestamp);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const url = `/match/${match.id}`;
  const toast = useToast();

  return (
    <Tr _hover={{ backgroundColor: "#202736" }}>
      <RowLink to={url}>
        <Flex alignItems="center">
          <Skeleton isLoaded={mapLoaded} mr={3}>
            <Image
              src={`/assets/maps/${match.map}.jpg`}
              onLoad={() => setMapLoaded(true)}
              w="5.333rem"
              minW="5.333rem"
            />
          </Skeleton>
          {match.map}
        </Flex>
      </RowLink>
      <RowLink to={url} textAlign="left" whiteSpace="nowrap">
        {date}
      </RowLink>
      <RowLink to={url} textAlign="right">
        {match.teamATitle}
      </RowLink>
      <RowLink to={url} textAlign="center">
        {match.teamAScore}:{match.teamBScore}
      </RowLink>
      <RowLink to={url}>{match.teamBTitle}</RowLink>
      <Td>
        <Tooltip label={getDemoTypePretty(match.demoType)}>
          <Skeleton isLoaded={logoLoaded}>
            <Image
              src={`/assets/logos/${match.demoType}.png`}
              onLoad={() => setLogoLoaded(true)}
              h="3rem"
              minH="3rem"
            />
          </Skeleton>
        </Tooltip>
      </Td>
      <Td>
        <Menu isLazy placement="bottom-end">
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FontAwesomeIcon icon={faBars} color="gray" />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem onClick={() => window.open(`/app${url}`)}>
              Open in new tab
            </MenuItem>
            <MenuItem
              onClick={() => {
                const final = (window.location.href + url).replaceAll(
                  "//",
                  "/"
                );
                navigator.clipboard?.writeText(final);
                toast({
                  title: "Copied URL to clipboard",
                  status: "info",
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Share
            </MenuItem>
            <MenuDivider />
            <MenuGroup title="Admin options">
              <MenuItem
                isDisabled={!props.isAdmin}
                onClick={() => {
                  props.setDelMatch(match.id);
                  props.openDelModal();
                }}
              >
                Delete
              </MenuItem>
              <MenuItem
                isDisabled={!props.isAdmin}
                onClick={() => {
                  props.setUpdMatch(match.id);
                  props.openUpdModal();
                }}
              >
                Edit metadata
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export const Home = (props: { matches: MatchInfo[] }) => {
  const [user] = useLoginStore((state) => [state.user], shallow);
  const [deleteMatchId, setDeleteMatchId] = useState("");
  const [updateMatchId, setUpdateMatchId] = useState("");
  const {
    isOpen: deleteModalOpen,
    onOpen: openDeleteModal,
    onClose: closeDeleteModal,
  } = useDisclosure();

  const {
    isOpen: updateModalOpen,
    onOpen: openUpdateModal,
    onClose: closeUpdateModal,
  } = useDisclosure();

  const isAdmin = user?.roles.includes("admin") ?? false;

  return (
    <Container maxW="container.xl" pt={8} minH="calc(100vh - 5.5rem)">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading lineHeight="unset" mb={0}>
          Matches
        </Heading>
      </Flex>
      <Divider my={5} />
      <Box my={5} overflowX="auto">
        <Table variant="simple" colorScheme="gray" size="sm">
          <Thead>
            <Tr>
              <Th>Map</Th>
              <Th>Date</Th>
              <Th textAlign="right">Home</Th>
              <Th textAlign="center">Score</Th>
              <Th>Away</Th>
              <Th>Source</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {props.matches.map((match) => (
              <TableRow
                key={match.id}
                match={match}
                isAdmin={isAdmin}
                openDelModal={openDeleteModal}
                openUpdModal={openUpdateModal}
                setDelMatch={setDeleteMatchId}
                setUpdMatch={setUpdateMatchId}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
      <DeleteMatchModal
        matchId={deleteMatchId}
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
      />
      <UpdateMetaModal
        matchId={updateMatchId}
        isOpen={updateModalOpen}
        onClose={closeUpdateModal}
      />
    </Container>
  );
};
