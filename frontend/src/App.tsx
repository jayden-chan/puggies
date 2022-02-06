import {
  Flex,
  ChakraProvider,
  extendTheme,
  ThemeConfig,
  Text,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { DataAPI } from "./api";
import { Loading } from "./components/Loading";
import { Home } from "./pages/Home";
import { MatchPage } from "./pages/Match";
import { MatchInfo } from "./types";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const Footer = () => {
  const showLove = useBreakpointValue([false, false, true]);
  return (
    <Flex
      bg="#212938"
      w="100hw"
      h="2.6rem"
      alignItems="center"
      px={2}
      color="gray"
    >
      <Text mr={3} fontWeight="bold">
        Puggies v1.0.0
      </Text>
      <Link href="/puggies-src.tar.gz" mr={3}>
        Source Code
      </Link>
      <Link href="/LICENSE" mr={3}>
        License
      </Link>
      <Link href="https://github.com/jayden-chan/puggies">GitHub</Link>
      {showLove && <Text ml="auto">made with &#128153; in Canada</Text>}
    </Flex>
  );
};

export const App = () => {
  const [matches, setMatches] = useState<MatchInfo[] | undefined>();
  useEffect(() => {
    const api = new DataAPI();
    api.fetchMatches().then((m) => setMatches(m));
  }, []);

  return (
    <ChakraProvider theme={theme}>
      {matches === undefined ? (
        <Loading minH="calc(100vh - 2.6rem)">Loading matches...</Loading>
      ) : (
        <Routes>
          <Route path="/" element={<Home matches={matches} />} />
          <Route path="/match/:id" element={<MatchPage matches={matches} />} />
        </Routes>
      )}
      <Footer />
    </ChakraProvider>
  );
};
