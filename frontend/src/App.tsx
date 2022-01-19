import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Match } from "./pages/Match";
import { Data } from "./types";
import { rawData } from "./data";

export const App = () => (
  <ChakraProvider theme={theme}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/match/:id" element={<Match data={data} />} />
    </Routes>
  </ChakraProvider>
);

const data: Data = {
  ...rawData,
  name: Object.fromEntries(Object.keys(rawData.teams).map((p) => [p, p])),
  efPerFlash: Object.fromEntries(
    Object.entries(rawData.flashesThrown).map(([player, flashes]) => {
      return [
        player,
        Math.round(((rawData.enemiesFlashed[player] ?? 0) / flashes) * 100) /
          100,
      ];
    })
  ),
};
