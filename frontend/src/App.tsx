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
import { Route, Routes, Link as ReactRouterLink } from "react-router-dom";
import { DataAPI } from "./api";
import { Loading } from "./components/Loading";
import { Home } from "./pages/Home";
import { MatchPage } from "./pages/Match";
import { NotFound } from "./pages/NotFound";
import { MatchInfo } from "./types";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

const Footer = () => {
  const showLove = useBreakpointValue([false, false, true]);
  return (
    <Flex bg="#212938" h="2.5rem" alignItems="center" px={2.5} color="gray">
      <Text mr={3} fontWeight="bold">
        Puggies v1.0.0
      </Text>
      <Link href="/puggies-src.tar.gz" mr={3}>
        Source Code
      </Link>
      <Link href="/LICENSE" mr={3}>
        License
      </Link>
      <Link isExternal href="https://github.com/jayden-chan/puggies">
        GitHub
      </Link>
      {showLove && <Text ml="auto">made with &#128153; in Canada</Text>}
    </Flex>
  );
};

const Header = () => {
  return (
    <Flex
      bg="#212938"
      h="3rem"
      alignItems="center"
      px={4}
      color="gray"
      fontWeight="bold"
    >
      <Link as={ReactRouterLink} to="/" mr={3}>
        Home
      </Link>
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
      <Header />
      {matches === undefined ? (
        <Loading minH="calc(100vh - 5.5rem)">Loading matches...</Loading>
      ) : (
        <Routes>
          <Route path="/" element={<Home matches={matches} />} />
          <Route path="/match/:id" element={<MatchPage matches={matches} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      <Footer />
    </ChakraProvider>
  );
};
