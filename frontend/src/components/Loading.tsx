import { Flex, Spinner, Text } from "@chakra-ui/react";
import React from "react";

export const Loading = (props: { text: string }) => (
  <Flex flexDir="column" alignItems="center" justifyContent="center" h="90vh">
    <Spinner size="xl" mb={5} />
    <Text>{props.text}</Text>
  </Flex>
);
