import { Flex, Link, Text } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";
import React from "react";
export const NotFound = () => {
  return (
    <Flex
      w="100%"
      minH="calc(100vh - 5.5rem)"
      pt={30}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Text
        fontSize="50vh"
        lineHeight="50vh"
        fontWeight="bold"
        color="#212938"
        letterSpacing="widest"
        m={0}
      >
        404
      </Text>
      <Link as={ReactRouterLink} to="/">
        Home
      </Link>
    </Flex>
  );
};
