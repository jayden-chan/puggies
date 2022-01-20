import * as React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { MatchPage } from "./pages/Match";
import { data } from "./data";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

export const App = () => (
  <ChakraProvider theme={theme}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/match/:id" element={<MatchPage data={data} />} />
    </Routes>
  </ChakraProvider>
);
