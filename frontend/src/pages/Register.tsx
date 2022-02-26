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

import { Container, Flex, Heading, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import shallow from "zustand/shallow";
import { User } from "../api";
import { EditUserForm } from "../components/EditUserForm";
import { useLoginStore } from "../stores/login";

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const toast = useToast();

  const [register] = useLoginStore((state) => [state.register], shallow);

  const onSubmit = (user: User & { password: string }) => {
    setLoading(true);
    register({
      username: user.username,
      password: user.password,
      email: user.email === "" ? undefined : user.email,
      displayName: user.displayName === "" ? undefined : user.displayName,
      steamId: user.steamId === "" ? undefined : user.steamId,
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
          <EditUserForm
            submitButton
            adminMode={false}
            loading={loading}
            error={error}
            onSubmit={onSubmit}
          />
        </Flex>
      </Container>
    </Flex>
  );
};
