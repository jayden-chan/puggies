import {
  ChakraProvider,
  extendTheme,
  Flex,
  Spinner,
  Text,
  ThemeConfig,
} from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { DataAPI, MatchInfo } from "./api";
import { Home } from "./pages/Home";
import { MatchPage } from "./pages/Match";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

export const App = () => {
  const [matches, setMatches] = useState<MatchInfo[] | undefined>();
  useEffect(() => {
    const api = new DataAPI("");
    api.fetchMatches().then((m) => setMatches(m));
  }, []);

  if (matches === undefined) {
    return (
      <Flex
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        h="90vh"
      >
        <Spinner size="xl" mb={5} />
        <Text>Loading matches...</Text>
      </Flex>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Home matches={matches} />} />
        <Route path="/match/:id" element={<MatchPage matches={matches} />} />
      </Routes>
    </ChakraProvider>
  );
};
