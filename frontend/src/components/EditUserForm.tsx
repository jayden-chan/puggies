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
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { User } from "../api";
import { capitalize, ROLES } from "../data";

export const EditUserForm = (props: {
  adminMode: boolean;
  submitButton: boolean;
  loading: boolean;
  error: string | undefined;
  onSubmit: (user: User & { password: string }) => void;
  defaults?: User;
}) => {
  const { loading, error, adminMode, defaults } = props;

  const [username, setUsername] = useState(defaults?.username ?? "");
  const [displayName, setDisplayName] = useState(defaults?.displayName ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState(defaults?.roles ?? []);
  const [steamId, setSteamId] = useState(defaults?.steamId ?? "");

  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (/\s+/.test(trimmedUsername)) {
      setUsernameError("Username cannot contain spaces.");
      return;
    }

    props.onSubmit({ username, displayName, email, steamId, roles, password });
  };

  return (
    <form onSubmit={onSubmit} id="edit-user-form">
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
        isRequired={!adminMode}
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
      <FormControl isRequired={!adminMode}>
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
        {props.adminMode && (
          <Menu closeOnSelect={false}>
            <MenuButton as={Button} colorScheme="blue" variant="outline">
              Roles
            </MenuButton>
            <MenuList minWidth="240px">
              <MenuOptionGroup
                title="Roles"
                type="checkbox"
                value={roles}
                defaultValue={roles}
                onChange={(v) => setRoles(v as string[])}
              >
                {ROLES.map((r) => (
                  <MenuItemOption key={r} value={r}>
                    {capitalize(r)}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        )}
        {props.submitButton && (
          <Button
            isLoading={loading}
            type="submit"
            form="edit-user-form"
            colorScheme="green"
            variant="solid"
            w="100%"
          >
            Register
          </Button>
        )}
      </FormControl>
      <FormControl isInvalid={error !== undefined}>
        {error !== undefined && (
          <FormErrorMessage mt={5}>{error}</FormErrorMessage>
        )}
      </FormControl>
    </form>
  );
};
