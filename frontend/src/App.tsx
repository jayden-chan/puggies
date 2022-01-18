import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Match, Data } from "./pages/Match";

export const App = () => (
  <ChakraProvider theme={theme}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/match/:id" element={<Match data={data} />} />
    </Routes>
  </ChakraProvider>
);

const data: Data = {
  "totalRounds": 20,
  "teams": {
    "BrianD": "T",
    "MrGenericUser": "T",
    "Nana4321": "T",
    "Spacebro": "T",
    "Wild_West": "CT",
    "atomic": "CT",
    "awesomaave": "CT",
    "honestpretzels": "CT",
    "jiaedin": "CT",
    "nosidE": "T"
  },
  "kills": {
    "BrianD": 11,
    "MrGenericUser": 6,
    "Nana4321": 9,
    "Spacebro": 14,
    "Wild_West": 10,
    "atomic": 35,
    "awesomaave": 9,
    "honestpretzels": 18,
    "jiaedin": 18,
    "nosidE": 19
  },
  "assists": {
    "BrianD": 2,
    "MrGenericUser": 3,
    "Nana4321": 2,
    "Spacebro": 2,
    "Wild_West": 1,
    "atomic": 6,
    "awesomaave": 3,
    "honestpretzels": 6,
    "jiaedin": 3,
    "nosidE": 4
  },
  "deaths": {
    "BrianD": 18,
    "MrGenericUser": 19,
    "Nana4321": 19,
    "Spacebro": 19,
    "Wild_West": 13,
    "atomic": 10,
    "awesomaave": 13,
    "honestpretzels": 11,
    "jiaedin": 12,
    "nosidE": 15
  },
  "trades": {
    "BrianD": 4,
    "MrGenericUser": 3,
    "Wild_West": 4,
    "atomic": 5,
    "awesomaave": 1,
    "honestpretzels": 4,
    "jiaedin": 4,
    "nosidE": 2
  },
  "headshotPct": {
    "BrianD": 18,
    "MrGenericUser": 50,
    "Nana4321": 33,
    "Spacebro": 43,
    "Wild_West": 20,
    "atomic": 43,
    "awesomaave": 44,
    "honestpretzels": 33,
    "jiaedin": 72,
    "nosidE": 53
  },
  "kd": {
    "BrianD": 0.61,
    "MrGenericUser": 0.32,
    "Nana4321": 0.47,
    "Spacebro": 0.74,
    "Wild_West": 0.77,
    "atomic": 3.5,
    "awesomaave": 0.69,
    "honestpretzels": 1.64,
    "jiaedin": 1.5,
    "nosidE": 1.27
  },
  "kdiff": {
    "BrianD": -7,
    "MrGenericUser": -13,
    "Nana4321": -10,
    "Spacebro": -5,
    "Wild_West": -3,
    "atomic": 25,
    "awesomaave": -4,
    "honestpretzels": 7,
    "jiaedin": 6,
    "nosidE": 4
  },
  "kpr": {
    "BrianD": 0.55,
    "MrGenericUser": 0.3,
    "Nana4321": 0.45,
    "Spacebro": 0.7,
    "Wild_West": 0.5,
    "atomic": 1.75,
    "awesomaave": 0.45,
    "honestpretzels": 0.9,
    "jiaedin": 0.9,
    "nosidE": 0.95
  },
  "adr": {
    "BrianD": 64,
    "MrGenericUser": 51,
    "Nana4321": 73,
    "Spacebro": 66,
    "Wild_West": 45,
    "atomic": 162,
    "awesomaave": 51,
    "honestpretzels": 123,
    "jiaedin": 91,
    "nosidE": 94
  },
  "kast": {
    "BrianD": 50,
    "MrGenericUser": 45,
    "Nana4321": 45,
    "Spacebro": 60,
    "Wild_West": 75,
    "atomic": 100,
    "awesomaave": 80,
    "honestpretzels": 85,
    "jiaedin": 65,
    "nosidE": 85
  },
  "impact": {
    "BrianD": 0.8,
    "MrGenericUser": 0.29,
    "Nana4321": 0.59,
    "Spacebro": 1.12,
    "Wild_West": 0.68,
    "atomic": 3.44,
    "awesomaave": 0.61,
    "honestpretzels": 1.63,
    "jiaedin": 1.57,
    "nosidE": 1.7
  },
  "hltv": {
    "BrianD": 0.64,
    "MrGenericUser": 0.32,
    "Nana4321": 0.52,
    "Spacebro": 0.82,
    "Wild_West": 0.84,
    "atomic": 2.59,
    "awesomaave": 0.87,
    "honestpretzels": 1.59,
    "jiaedin": 1.3,
    "nosidE": 1.42
  },
  "utilDamage": {
    "MrGenericUser": 8,
    "Nana4321": 54,
    "Wild_West": 24,
    "atomic": 45,
    "honestpretzels": 47,
    "nosidE": 32
  },
  "flashAssists": {
    "atomic": 1,
    "jiaedin": 1,
    "nosidE": 2
  },
  "enemiesFlashed": {
    "MrGenericUser": 3,
    "Spacebro": 3,
    "Wild_West": 4,
    "atomic": 10,
    "honestpretzels": 39,
    "jiaedin": 8,
    "nosidE": 19
  },
  "teammatesFlashed": {
    "MrGenericUser": 1,
    "Nana4321": 2,
    "Spacebro": 2,
    "Wild_West": 7,
    "atomic": 7,
    "awesomaave": 2,
    "honestpretzels": 10,
    "jiaedin": 3,
    "nosidE": 17
  },
  "rounds": [
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 1
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "CT",
      "winReason": 7
    },
    {
      "winner": "T",
      "winReason": 1
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "CT",
      "winReason": 8
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "CT",
      "winReason": 8
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "CT",
      "winReason": 7
    },
    {
      "winner": "CT",
      "winReason": 8
    },
    {
      "winner": "CT",
      "winReason": 8
    },
    {
      "winner": "T",
      "winReason": 9
    },
    {
      "winner": "CT",
      "winReason": 7
    }
  ],
  "flashesThrown": {
    "MrGenericUser": 1,
    "Nana4321": 1,
    "Spacebro": 2,
    "Wild_West": 4,
    "atomic": 7,
    "awesomaave": 1,
    "honestpretzels": 17,
    "jiaedin": 6,
    "nosidE": 12
  },
  "smokesThrown": {
    "BrianD": 1,
    "Nana4321": 4,
    "Wild_West": 4,
    "atomic": 17,
    "honestpretzels": 12,
    "jiaedin": 4,
    "nosidE": 5
  },
  "molliesThrown": {
    "MrGenericUser": 4,
    "Nana4321": 1,
    "Wild_West": 7,
    "atomic": 11,
    "awesomaave": 3,
    "honestpretzels": 12,
    "jiaedin": 3,
    "nosidE": 8
  },
  "HEsThrown": {
    "BrianD": 1,
    "MrGenericUser": 2,
    "atomic": 9,
    "honestpretzels": 7
  },
  "2k": {
    "BrianD": 1,
    "MrGenericUser": 1,
    "Nana4321": 2,
    "atomic": 4,
    "awesomaave": 2,
    "jiaedin": 5,
    "nosidE": 3
  },
  "3k": {
    "BrianD": 2,
    "atomic": 5,
    "jiaedin": 1,
    "nosidE": 1
  },
  "4k": {
    "atomic": 1,
    "honestpretzels": 2
  },
  "5k": {}
};
