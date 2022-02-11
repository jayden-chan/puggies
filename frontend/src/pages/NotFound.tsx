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

import { Flex, Link, Text } from "@chakra-ui/react";
import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";
export const NotFound = () => {
  return (
    <Flex
      w="100%"
      minH="calc(100vh - 5.5rem)"
      pt={30}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text
        fontSize="50vh"
        lineHeight="50vh"
        fontWeight="bold"
        color="#212938"
        letterSpacing="widest"
        m={0}
      >
        404
      </Text>
      <Link as={ReactRouterLink} to="/">
        Home
      </Link>
    </Flex>
  );
};
