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
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import shallow from "zustand/shallow";
import { useLoginStore } from "../stores/login";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [steamId, setSteamId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined
  );

  const navigate = useNavigate();
  const toast = useToast();

  const [register] = useLoginStore((state) => [state.register], shallow);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (/\s+/.test(trimmedUsername)) {
      setUsernameError("Username cannot contain spaces.");
      return;
    }

    setLoading(true);
    register({
      username: trimmedUsername,
      password,
      email: email === "" ? undefined : email,
      displayName: displayName === "" ? undefined : displayName,
      steamId: steamId === "" ? undefined : steamId,
    })
      .then(() => {
        toast({
          title: "Successfully registered!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/");
      })
      .catch((err) => {
        setError(err.toString());
        setLoading(false);
      });
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
        <Heading mb={6}>Register for Puggies</Heading>
        <Flex
          bg="#212938"
          p={10}
          borderRadius={10}
          flexDir="column"
          style={{ boxShadow: "0px 0px 30px rgba(0, 0, 0, 0.40)" }}
        >
          <form onSubmit={onSubmit}>
            <FormControl>
              <FormLabel htmlFor="displayName">Name</FormLabel>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                mb={5}
              />
            </FormControl>
            <FormControl
              isRequired
              isInvalid={usernameError !== undefined}
              mb={5}
            >
              <FormLabel htmlFor="username">Username</FormLabel>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {usernameError !== undefined && (
                <FormErrorMessage>{usernameError}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                mb={5}
              />
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                mb={5}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="steamId">Steam ID (optional)</FormLabel>
              <Input
                id="steamId"
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                mb={5}
              />
              <Button
                isLoading={loading}
                type="submit"
                colorScheme="green"
                variant="solid"
                w="100%"
              >
                Register
              </Button>
            </FormControl>
            <FormControl isInvalid={error !== undefined}>
              {error !== undefined && (
                <FormErrorMessage mt={5}>{error}</FormErrorMessage>
              )}
            </FormControl>
          </form>
        </Flex>
      </Container>
    </Flex>
  );
};
