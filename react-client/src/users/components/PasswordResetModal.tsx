import React, { useContext, useEffect, useState, useCallback } from "react";
import User from "../interfaces/User";
import { GeneratePassword } from "js-generate-password";
import { TfiRulerAlt } from "react-icons/tfi";
import {
  Button,
  Box,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  List,
  ListItem,
  ListIcon,
  Flex,
  HStack,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

import { FaRegCircle } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import userService from "../../services/UserService";
import ToastContext from "../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";

interface PasswordResetModalProps {
  passwordResetModalUser: User | null;
  setPasswordResetModalUser: React.Dispatch<React.SetStateAction<User | null>>;

  user: User;
}

export default function PasswordResetModal(props: PasswordResetModalProps) {
  const toast = useContext(ToastContext);

  const [userPassword, setUserPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userPasswordError, setUserPasswordError] = useState<string>("");
  const [repeatUserPassword, setRepeatUserPassword] = useState<string>("");
  const [repeatShowPassword, setRepeatShowPassword] = useState<boolean>(false);
  const [repeatUserPasswordError, setRepeatUserPasswordError] = useState<string>("");
  const [genLength, setGenLength] = useState<number>(14);

  const [submit, setSubmit] = useState<boolean>(false);

  const closeModal = useCallback(() => {
    props.setPasswordResetModalUser(null);
  }, [props]);

  useEffect(() => {
    if (!submit) return;

    if (!userPassword || !repeatUserPassword) {
      setUserPasswordError("Password cannot be empty");
      setRepeatUserPasswordError("Password cannot be empty");
      setSubmit(false);
      return;
    }

    if (getPasswordStrength() < 5) {
      setUserPasswordError("Password is too weak");
      setSubmit(false);
      return;
    }

    if (userPassword !== repeatUserPassword) {
      setRepeatUserPasswordError("Passwords do not match");
      setSubmit(false);
      return;
    }

    setUserPasswordError("");
    setRepeatUserPasswordError("");

    async function doSubmit() {
      try {
        await userService.resetAccountPassword(props.user.id, userPassword, true);

        ToastHelper.makeToast(toast, "Password reset", "success");

        closeModal();
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Password reset failed");
      }

      setSubmit(false);
    }

    doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit, closeModal]);

  function generateRandomPsw() {
    const password = GeneratePassword({
      length: genLength,
      symbols: true,
    });

    setUserPassword(password);
    setRepeatUserPassword(password);
    setUserPasswordError("");
  }

  const isPasswordStrongEnough = () => {
    return getPasswordStrength() >= 5;
  };

  const passwordChecks = [
    { check: () => userPassword.length >= 8, label: "8 characters" },
    { check: () => /[A-Z]/.test(userPassword), label: "1 uppercase letter" },
    { check: () => /[a-z]/.test(userPassword), label: "1 lowercase letter" },
    { check: () => /\d/.test(userPassword), label: "1 number" },
    { check: () => /\W/.test(userPassword), label: "1 special character" },
  ];

  const getPasswordStrength = useCallback(() => {
    const score = passwordChecks.reduce((score, { check }) => score + (check() ? 1 : 0), 0);
    return score;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPassword]);

  const getPasswordStrengthMessage = useCallback(() => {
    switch (getPasswordStrength()) {
      case 4:
        return "Medium";
      case 5:
        return "Strong";
      default:
        return "Weak";
    }
  }, [getPasswordStrength]);

  const ProgressBar = ({ score }) => {
    return (
      <Box width="100%" mt={4}>
        <Flex gap={1.5}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Box
              key={index}
              width="15%"
              height="6px"
              bg={index < score ? (score <= 3 ? "red.500" : score === 4 ? "orange.500" : "green.500") : "gray.300"}
            />
          ))}
        </Flex>
      </Box>
    );
  };

  return (
    <Modal isOpen={props.passwordResetModalUser !== null} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent w={"1200px"}>
        <ModalHeader fontSize={"25"}>Password reset</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb={4}>
          <Text fontWeight={"semibold"}>
            Enter a new password for {props.user.name} {props.user.surname}
          </Text>
          <Text fontWeight={"semibold"}>Make sure to include at least:</Text>
          <List pt={5} pb={9} spacing={2} ml={5} fontWeight={"semibold"}>
            {passwordChecks.map(({ check, label }, index) => {
              const isCheckPassed = check();
              return (
                <ListItem key={index} color={isCheckPassed ? "green.500" : "black"}>
                  <ListIcon
                    as={isCheckPassed ? FaRegCircleCheck : FaRegCircle}
                    color={isCheckPassed ? "green.500" : "black"}
                    boxSize="1.2em"
                  />
                  {label}
                </ListItem>
              );
            })}
          </List>

          <VStack spacing={4}>
            <FormControl id="password" isRequired isInvalid={userPasswordError !== ""}>
              <FormLabel>New password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={userPassword ? userPassword : ""}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
                <InputRightElement h={"full"}>
                  {userPassword ? (
                    <Button variant="ghost" onClick={() => setShowPassword((showPassword) => !showPassword)}>
                      {showPassword ? <FiEye /> : <FiEyeOff />}
                    </Button>
                  ) : (
                    <Popover placement="right" closeOnBlur={false}>
                      <PopoverTrigger>
                        <Button variant="ghost" loadingText="Generating password">
                          <FiKey />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
                        <PopoverHeader pt={4} fontWeight="bold" border="0">
                          Choose your password length
                        </PopoverHeader>
                        <PopoverArrow bg="blue.800" />
                        <PopoverCloseButton />
                        <PopoverBody>
                          <Slider
                            aria-label="slider-ex-4"
                            defaultValue={14}
                            step={1}
                            min={8}
                            max={20}
                            onChange={(length) => setGenLength(length)}
                          >
                            <SliderTrack bg="red.100">
                              <SliderFilledTrack bg="tomato" />
                            </SliderTrack>
                            <SliderThumb boxSize={6}>
                              <Box color="tomato" as={TfiRulerAlt} />
                            </SliderThumb>
                          </Slider>
                        </PopoverBody>
                        <PopoverFooter
                          border="0"
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          pb={4}
                        >
                          <Box fontSize="sm">Length: {genLength}</Box>
                          <ButtonGroup size="sm">
                            <Button colorScheme="blue" onClick={() => generateRandomPsw()}>
                              Generate
                            </Button>
                          </ButtonGroup>
                        </PopoverFooter>
                      </PopoverContent>
                    </Popover>
                  )}
                </InputRightElement>
              </InputGroup>
              {!userPassword ? (
                <Box color="blue.700" mt={2} fontSize="sm" fontWeight="semibold">
                  Click the key to generate a password randomly
                </Box>
              ) : (
                <HStack>
                  <ProgressBar score={getPasswordStrength()} />
                  <Text
                    mt={3}
                    color={getPasswordStrength() <= 3 ? "red.500" : getPasswordStrength() === 4 ? "orange.500" : "green.500"}
                  >
                    {getPasswordStrengthMessage()}
                  </Text>
                  {userPasswordError && <FormErrorMessage>{userPasswordError}</FormErrorMessage>}
                </HStack>
              )}
            </FormControl>

            <FormControl id="password" isRequired isInvalid={repeatUserPasswordError !== ""} mt={1}>
              <FormLabel>Repeat new password</FormLabel>
              <InputGroup>
                <Input
                  type={repeatShowPassword ? "text" : "password"}
                  value={repeatUserPassword}
                  onChange={(e) => setRepeatUserPassword(e.target.value)}
                />
                <InputRightElement h={"full"}>
                  <Button variant={"ghost"} onClick={() => setRepeatShowPassword((showPassword) => !showPassword)}>
                    {repeatShowPassword ? <FiEye /> : <FiEyeOff />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {repeatUserPasswordError && <FormErrorMessage>{repeatUserPasswordError}</FormErrorMessage>}
            </FormControl>
            <HStack w={"full"} mt={2} width={"100%"} height={"fit-content"}>
              <Alert status="warning" variant={"left-accent"} rounded={"md"}>
                <AlertIcon />
                <AlertTitle fontSize={"13px"}>Important information:</AlertTitle>
                <Text fontSize={"13px"}>This user will remain setted as temporary until the first login</Text>
              </Alert>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={closeModal}>
            Close
          </Button>
          <Tooltip
            label={
              isPasswordStrongEnough()
                ? userPassword !== repeatUserPassword && "Repeated password is different"
                : "Password not strong enough"
            }
            isDisabled={isPasswordStrongEnough() && userPassword !== repeatUserPassword}
            placement="top"
            rounded="md"
          >
            <Button
              colorScheme="blue"
              isLoading={submit}
              loadingText="Resetting password"
              onClick={() => setSubmit(true)}
              isDisabled={!isPasswordStrongEnough() || userPassword !== repeatUserPassword}
            >
              Reset password
            </Button>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
