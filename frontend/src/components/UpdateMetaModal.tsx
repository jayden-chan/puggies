/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { DataAPI } from "../api";

export const UpdateMetaModal = (props: {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isOpen, onClose, matchId } = props;

  const [demoLink, setDemoLink] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const api = new DataAPI();

  useEffect(() => {
    if (isOpen === true) {
      setDemoLink("");
      setLoadingMeta(true);
      setError(undefined);
      setLoading(false);

      api.userMeta(matchId).then((m) => {
        setDemoLink(m?.demoLink ?? "");
        setLoadingMeta(false);
      });
    }
  }, [isOpen]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    api
      .updateMatchMeta(matchId, { demoLink })
      .then(() => {
        toast({
          title: "Updated match metadata",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.toString());
        setLoading(false);
      });

    e.preventDefault();
  };

  return (
    <Modal isCentered size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update {matchId} metadata</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl isRequired>
              <FormLabel htmlFor="demoLink">Demo download link</FormLabel>
              <Input
                id="demoLink"
                type="text"
                value={demoLink}
                isDisabled={loadingMeta}
                onChange={(e) => setDemoLink(e.target.value)}
                mb={5}
              />
            </FormControl>
            <FormControl isInvalid={error !== undefined}>
              {error !== undefined && (
                <FormErrorMessage>{error}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={loading}
              type="submit"
              colorScheme="green"
              mr={3}
              variant="solid"
            >
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};
