import {
  Button,
  ChakraProvider,
  extendTheme,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  ThemeConfig,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Link as ReactRouterLink, Route, Routes } from "react-router-dom";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Flex h="2.5rem" alignItems="center" px={2.5} color="#777">
        <Text mr={4} fontWeight="bold">
          Puggies 1.0.0
        </Text>
        <Link href="/puggies-src.tar.gz" mr={4}>
          Source Code
        </Link>
        <Link isExternal href="https://github.com/jayden-chan/puggies" mr={4}>
          GitHub
        </Link>
        <Link href="/LICENSE" mr={4}>
          License
        </Link>
        <Link onClick={onOpen}>Logo Attribution</Link>
        {showLove && <Text ml="auto">made with &#128153; in Canada</Text>}
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logo Attribution</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Pug icons created by Vitaly Gorbachev - Flaticon
          </ModalBody>

          <ModalFooter>
            <Button
              as={Link}
              isExternal
              href="https://www.flaticon.com/free-icons/pug"
              variant="ghost"
              mr={3}
            >
              flaticon.com
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const Header = () => {
  return (
    <Flex
      bg="linear-gradient(180deg, rgba(20,24,33,1) 0%, rgba(20,24,33,0.0) 100%);"
      h="3rem"
      alignItems="center"
      px={4}
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
