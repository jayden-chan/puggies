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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { api } from "../api";

export const DeleteUserModal = (props: {
  displayName: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isOpen, onClose, displayName, username } = props;
  const toast = useToast();

  return (
    <Modal isCentered size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete user &#8220;{displayName}&#8221;?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>This action cannot be reversed.</ModalBody>

        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            onClick={() => {
              api()
                .deleteUser(username)
                .then(() => {
                  toast({
                    title: "User deleted",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  onClose();
                })
                .catch((err) => {
                  toast({
                    title: `Failed to delete user: ${err.toString()}`,
                    status: "error",
                    duration: null,
                    isClosable: true,
                  });
                });
            }}
          >
            Yes, delete user
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
