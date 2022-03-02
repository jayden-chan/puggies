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

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { getDaysInMonth, parse } from "date-fns";
import React, { useEffect, useState } from "react";
import { api } from "../api";

const currDate = new Date();
const currYear = currDate.getFullYear();
const years = currYear - 2011;
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const daySuffix = (day: number): string => {
  switch (day) {
    case 1:
    case 21:
    case 31:
      return "st";
    case 2:
    case 22:
      return "nd";
    case 3:
    case 23:
      return "rd";
    default:
      return "th";
  }
};

export const UpdateMetaModal = (props: {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { isOpen, onClose, matchId } = props;

  const [demoLink, setDemoLink] = useState("");
  const [dateOverride, setDateOverride] = useState<
    Partial<{
      year: number;
      month: number;
      day: number;
      h: number;
      m: number;
    }>
  >();

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const numDays = getDaysInMonth(
    new Date(dateOverride?.year ?? currYear, dateOverride?.month ?? 0)
  );

  useEffect(() => {
    if (isOpen === true) {
      setDemoLink("");
      setDateOverride(undefined);
      setLoadingMeta(true);
      setError(undefined);
      setLoading(false);

      api()
        .userMeta(matchId)
        .then((m) => {
          const date = m?.dateOverride;
          if (date !== undefined) {
            const parsed = parse(date.toString(), "T", new Date());
            setDateOverride({
              year: parsed.getFullYear(),
              month: parsed.getMonth(),
              day: parsed.getDate(),
              h: parsed.getHours(),
              m: parsed.getMinutes(),
            });
          }
          setDemoLink(m?.demoLink ?? "");
          setLoadingMeta(false);
        });
    }
  }, [isOpen, matchId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    let dateNumber = 0;

    if (
      dateOverride !== undefined &&
      Object.values(dateOverride).every((v) => v !== undefined)
    ) {
      dateNumber = new Date(
        dateOverride.year!,
        dateOverride.month!,
        dateOverride.day!,
        dateOverride.h!,
        dateOverride.m!
      ).getTime();
    }

    api()
      .updateMatchMeta(matchId, { demoLink, dateOverride: dateNumber })
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
  };

  return (
    <Modal size="3xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update {matchId} metadata</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={onSubmit}>
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="demoLink">Demo download link</FormLabel>
              <Input
                id="demoLink"
                type="text"
                value={demoLink}
                isDisabled={loadingMeta}
                onChange={(e) => setDemoLink(e.target.value)}
                mb={5}
              />
              <FormLabel htmlFor="dateOverride">Date</FormLabel>
              <Flex alignItems="center" justifyContent="flex-start">
                <Menu isLazy>
                  <MenuButton
                    mr={2}
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {dateOverride?.year !== undefined
                      ? dateOverride.year
                      : "Year"}
                  </MenuButton>
                  <MenuList>
                    {Array.from({ length: years }, (_, i) => i + 2012)
                      .reverse()
                      .map((y) => (
                        <MenuItem
                          key={y}
                          onClick={() =>
                            setDateOverride((prev) => ({ ...prev, year: y }))
                          }
                        >
                          {y}
                        </MenuItem>
                      ))}
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuButton
                    mr={2}
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {dateOverride?.month !== undefined
                      ? months[dateOverride.month]
                      : "Month"}
                  </MenuButton>
                  <MenuList>
                    {months.map((m, i) => (
                      <MenuItem
                        key={m}
                        onClick={() => {
                          setDateOverride((prev) => {
                            const numDays = getDaysInMonth(
                              new Date(prev?.year ?? currYear, i)
                            );

                            return {
                              ...prev,
                              month: i,
                              day:
                                (prev?.day ?? 1) > numDays
                                  ? numDays
                                  : prev?.day ?? 1,
                            };
                          });
                        }}
                      >
                        {m}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuButton
                    mr={2}
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {dateOverride?.day !== undefined
                      ? dateOverride.day + daySuffix(dateOverride.day)
                      : "Day"}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    {Array.from({ length: numDays }, (_, i) => i + 1).map(
                      (d) => (
                        <MenuItem
                          key={d}
                          onClick={() =>
                            setDateOverride((prev) => ({ ...prev, day: d }))
                          }
                        >
                          {d}
                        </MenuItem>
                      )
                    )}
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuButton
                    mr={2}
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                  >
                    {dateOverride?.h !== undefined
                      ? dateOverride.h.toString().padStart(2, "0") + "h"
                      : "Hour"}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                      <MenuItem
                        key={h}
                        onClick={() =>
                          setDateOverride((prev) => ({ ...prev, h }))
                        }
                      >
                        {h}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <Menu isLazy>
                  <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                    {dateOverride?.m !== undefined
                      ? dateOverride.m.toString().padStart(2, "0") + "m"
                      : "Minute"}
                  </MenuButton>
                  <MenuList maxH="300px" overflowY="auto">
                    {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                      <MenuItem
                        key={m}
                        onClick={() =>
                          setDateOverride((prev) => ({ ...prev, m }))
                        }
                      >
                        {m}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Flex>
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
