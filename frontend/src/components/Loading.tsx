import { Flex, FlexProps, Spinner, Text } from "@chakra-ui/react";
import React from "react";

export const Loading = (props: FlexProps) => (
  <Flex
    flexDir="column"
    alignItems="center"
    justifyContent="center"
    h="90vh"
    {...props}
  >
    <Spinner size="xl" mb={5} />
    <Text>{props.children}</Text>
  </Flex>
);
