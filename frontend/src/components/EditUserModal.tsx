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
import React, { useState } from "react";
import { DataAPI, User } from "../api";
import { EditUserForm } from "./EditUserForm";

export const EditUserModal = (props: {
  currUser: User;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isOpen, onClose, currUser } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const toast = useToast();

  return (
    <Modal isCentered size="2xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Editing user &#8220;{currUser.displayName}&#8221;
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <EditUserForm
            adminMode
            defaults={props.currUser}
            submitButton={false}
            loading={loading}
            error={error}
            onSubmit={(u) => {
              setLoading(true);
              const api = new DataAPI();
              api
                .editUser(currUser.username, u)
                .then(() => {
                  setLoading(false);
                  toast({
                    title: "Successfully updated user",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  onClose();
                })
                .catch((err) => {
                  setError(err.message);
                  setLoading(false);
                });
            }}
          />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            type="submit"
            isLoading={loading}
            form="edit-user-form"
            mr={3}
          >
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
