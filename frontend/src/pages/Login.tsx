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
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import shallow from "zustand/shallow";
import { useLoginStore } from "../login";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const [loggedIn, login] = useLoginStore(
    (state) => [state.loggedIn, state.login],
    shallow
  );

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    login(username, password)
      .then(() => navigate("/"))
      .catch((err) => {
        setError(err.toString());
        setLoading(false);
      });

    e.preventDefault();
  };

  return (
    <Flex
      w="100%"
      minH="calc(100vh - 5.5rem)"
      pt={30}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Heading mb={6}>Sign in to Puggies</Heading>
      <Flex
        bg="#212938"
        p={10}
        borderRadius={10}
        flexDir="column"
        mb={32}
        style={{ boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.40)" }}
      >
        <form onSubmit={onSubmit}>
          <FormControl isRequired>
            <FormLabel htmlFor="username">Username</FormLabel>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              mb={5}
            />
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              mb={5}
            />
            <Button
              isLoading={loading}
              type="submit"
              colorScheme="green"
              variant="solid"
              w="100%"
            >
              Sign in
            </Button>
          </FormControl>
          {error !== undefined && <FormErrorMessage>{error}</FormErrorMessage>}
        </form>
      </Flex>
    </Flex>
  );
};
