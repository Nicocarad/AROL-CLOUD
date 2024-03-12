import React, { useContext, useEffect, useState, useCallback } from "react";
import { useDisclosure } from "@chakra-ui/react";
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
  Stack,
  Heading,
  useColorModeValue,
  Image,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { FaRegCircle } from "react-icons/fa";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import ToastContext from "../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import userService from "../../services/UserService";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import authService from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const toast = useContext(ToastContext);
  const navigate = useNavigate();
  const { principal, dispatchPrincipal } = useContext(PrincipalContext);
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userPasswordError, setUserPasswordError] = useState("");
  const [repeatUserPassword, setRepeatUserPassword] = useState("");
  const [repeatShowPassword, setRepeatShowPassword] = useState(false);
  const [repeatUserPasswordError, setRepeatUserPasswordError] = useState("");
  const [genLength, setGenLength] = useState(14);
  const [first, setFirst] = useState(true);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    if (!submit) return;

    if (userPassword.length < 8) {
      setUserPasswordError("Password must be at least 8 characters long");

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
        if (!principal) return;
        await userService.resetAccountPassword(Number(principal.id), userPassword, false);

        ToastHelper.makeToast(toast, "Permanent password set with success", "success");
        let refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) await authService.logout(parseInt(principal.id), refreshToken);
        dispatchPrincipal({
          principal: null,
          type: "logout",
        });
        navigate("/login", { state: "home" });
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Password reset failed");
      }

      setSubmit(false);
    }

    doSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, repeatUserPassword, submit, toast, userPassword]);

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

  function FirstLoginMessage() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [hasOpened, setHasOpened] = useState<boolean>(false);
    const cancelRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
      if (!hasOpened) {
        onOpen();
        setHasOpened(true);
      }
    }, [hasOpened, onOpen]);

    function closeAlert() {
      setFirst(false);
      onClose();
    }

    return (
      <>
        <AlertDialog
          motionPreset="slideInBottom"
          leastDestructiveRef={cancelRef}
          onClose={closeAlert}
          isOpen={isOpen}
          isCentered
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Temporary password</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              Please enter a new one before continuing. You will be logged out after setting your new password.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef!} onClick={closeAlert}>
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      {first && <FirstLoginMessage />}

      <Stack
        w={1000}
        mx={"auto"}
        minH={"full"}
        direction={{ base: "column", md: "row" }}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        rounded={"lg"}
        p={6}
      >
        <Flex p={6} flex={1} align={"center"} justify={"center"}>
          <VStack w={"400px"} border={"solid"} borderColor={"gray.200"} p={4}>
            <Heading pb={3}>Choose password</Heading>

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
            <VStack spacing={5}>
              <FormControl id="password" isRequired isInvalid={userPasswordError !== ""} w={300}>
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
                              <Button
                                colorScheme="blue"
                                onClick={() => {
                                  generateRandomPsw();
                                }}
                              >
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
                ) : userPasswordError && userPassword.length < 8 ? (
                  <Box color="red.500" mt={2} fontSize="sm" fontWeight="semibold">
                    Password must be at least 8 characters long
                  </Box>
                ) : (
                  <HStack>
                    <ProgressBar score={getPasswordStrength()} />
                    <Text
                      mt={3}
                      color={
                        getPasswordStrength() <= 3
                          ? "red.500"
                          : getPasswordStrength() === 4
                          ? "orange.500"
                          : "green.500"
                      }
                    >
                      {getPasswordStrengthMessage()}
                    </Text>
                    {userPasswordError && <FormErrorMessage>{userPasswordError}</FormErrorMessage>}
                  </HStack>
                )}
              </FormControl>

              <FormControl id="password" isRequired isInvalid={repeatUserPasswordError !== ""} mt={1} w={300}>
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
            </VStack>

            <Tooltip
              label={
                isPasswordStrongEnough()
                  ? userPassword !== repeatUserPassword && "Repeated password is different"
                  : "Password not strong enough"
              }
              isDisabled={isPasswordStrongEnough() && userPassword === repeatUserPassword}
              placement="top"
              rounded="md"
            >
              <Button
                colorScheme="blue"
                isLoading={submit}
                loadingText="Resetting password"
                onClick={() => setSubmit(true)}
                isDisabled={!isPasswordStrongEnough() || userPassword !== repeatUserPassword}
                mt={5}
                w={300}
              >
                Reset password
              </Button>
            </Tooltip>
          </VStack>
        </Flex>
        <Flex flex={1}>
          <Image alt={"Login Image"} objectFit={"contain"} src={require("./../../assets/arol-logo.png")} />
        </Flex>
      </Stack>
    </>
  );
}
