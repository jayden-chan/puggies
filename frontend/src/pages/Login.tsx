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
