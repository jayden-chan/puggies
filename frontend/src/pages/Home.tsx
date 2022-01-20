import {
  Box,
  Code,
  Grid,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";
import * as React from "react";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { Logo } from "../Logo";

export const Home = () => (
  <Box textAlign="center" fontSize="xl">
    <Grid minH="100vh" p={3}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <VStack spacing={8}>
        <Logo h="40vmin" pointerEvents="none" />
        <Text>
          Edit <Code fontSize="xl">src/App.tsx</Code> and save to reload.
        </Text>
        <ChakraLink
          color="teal.500"
          href="https://chakra-ui.com"
          fontSize="2xl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Chakra
        </ChakraLink>
      </VStack>
    </Grid>
  </Box>
);
