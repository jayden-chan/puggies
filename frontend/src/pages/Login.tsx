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
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import shallow from "zustand/shallow";
import { DataAPI } from "../api";
import { useLoginStore } from "../stores/login";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selfSignup, setSelfSignup] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  const [loggedIn, login] = useLoginStore(
    (state) => [state.loggedIn, state.login],
    shallow
  );

  useEffect(() => {
    const api = new DataAPI();
    api
      .selfSignupEnabled()
      .then((s) => setSelfSignup(s))
      .catch(() => {});
  }, []);

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
      <Container mb={32}>
        <Heading mb={6}>Sign in to Puggies</Heading>
        <Flex
          bg="#212938"
          p={10}
          borderRadius={10}
          flexDir="column"
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
            <FormControl isInvalid={error !== undefined}>
              {error !== undefined && (
                <FormErrorMessage mt={5}>{error}</FormErrorMessage>
              )}
            </FormControl>
          </form>
        </Flex>
        {selfSignup && (
          <Flex
            p={5}
            borderRadius={10}
            borderWidth={1}
            borderColor="gray"
            alignItems="center"
            justifyContent="center"
            mt={8}
          >
            <Text mr="0.5em">New to Puggies?</Text>
            <Link as={ReactRouterLink} to="/register" color="lightblue">
              Register for an account.
            </Link>
          </Flex>
        )}
      </Container>
    </Flex>
  );
};
