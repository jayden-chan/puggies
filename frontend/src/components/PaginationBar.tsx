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
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";

export const PaginationBar = (props: {
  page: number;
  totalPages: number;
  isRefreshing: boolean;
  setPage: (page: number) => void;
  onRefresh: () => void;
}) => {
  const { page, totalPages, isRefreshing, setPage, onRefresh } = props;
  const displayControls = page > 1 || page < totalPages ? undefined : "none";
  return (
    <Flex p={1} alignItems="center" justifyContent="space-between">
      <Flex alignItems="center">
        <IconButton
          aria-label="first page"
          mr={1}
          disabled={!(page > 1)}
          icon={<ArrowLeftIcon />}
          onClick={() => setPage(1)}
          display={displayControls}
        />
        <IconButton
          aria-label="previous page"
          disabled={!(page > 1)}
          icon={<ArrowBackIcon />}
          onClick={() => setPage(page - 1)}
          display={displayControls}
        />
        <Text mx={2}>
          Page {page} of {totalPages}
        </Text>
        <IconButton
          aria-label="next page"
          mr={1}
          disabled={!(page < totalPages)}
          icon={<ArrowForwardIcon />}
          onClick={() => setPage(page + 1)}
          display={displayControls}
        />
        <IconButton
          aria-label="last page"
          disabled={!(page < totalPages)}
          icon={<ArrowRightIcon />}
          onClick={() => setPage(totalPages)}
          display={displayControls}
        />
      </Flex>
      <IconButton
        aria-label="refresh"
        isLoading={isRefreshing}
        icon={<RepeatIcon />}
        onClick={() => onRefresh()}
      />
    </Flex>
  );
};
