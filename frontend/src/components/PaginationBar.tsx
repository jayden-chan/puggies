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

import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";

export const PaginationBar = (props: {
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
  isRefreshing: boolean;
  onNext: () => void;
  onPrev: () => void;
  onRefresh: () => void;
}) => {
  return (
    <Flex p={1} alignItems="center" justifyContent="space-between">
      <Flex alignItems="center">
        <IconButton
          aria-label="refresh"
          disabled={!props.hasPrev}
          icon={<ArrowBackIcon />}
          onClick={() => props.onPrev()}
        />
        <Text mx={2}>Page {props.page}</Text>
        <IconButton
          aria-label="refresh"
          disabled={!props.hasNext}
          icon={<ArrowForwardIcon />}
          onClick={() => props.onNext()}
        />
      </Flex>
      <IconButton
        aria-label="refresh"
        isLoading={props.isRefreshing}
        icon={<RepeatIcon />}
        onClick={() => props.onRefresh()}
      />
    </Flex>
  );
};
