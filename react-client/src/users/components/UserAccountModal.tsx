import React, { useCallback, useContext, useState, useEffect } from "react";
import User from "../interfaces/User";
import { GeneratePassword } from "js-generate-password";
import { TfiRulerAlt } from "react-icons/tfi";
import {
  Box,
  ButtonGroup,
  Button,
  FormControl,
  FormLabel,
  HStack,
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
  Radio,
  RadioGroup,
  Select,
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
  Tooltip,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff, FiKey } from "react-icons/fi";
import userService from "../../services/UserService";
import ToastContext from "../../utils/contexts/ToastContext";
import UserWithPermissions from "../../machinery-users/interfaces/UserWithPermissions";
import Machinery from "../../machinery-management/interfaces/Machinery";
import AxiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import PermissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";

interface UserAccountModalProps {
  accountModalUser: User | null;
  setAccountModalUser: React.Dispatch<React.SetStateAction<User | null>>;
  operationType: string;
  user: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>> | null;
  setUsersWithPermissions: React.Dispatch<React.SetStateAction<UserWithPermissions[]>> | null;
  machineries: Machinery[] | null;
}

export default function UserAccountModal(props: UserAccountModalProps) {
  const toast = useContext(ToastContext);
  const { principal } = useContext(PrincipalContext);

  const [user, setUser] = useState<User>(JSON.parse(JSON.stringify(props.user)));
  const [userPassword, setUserPassword] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>(props.user.email ? props.user.email : "");
  const [showPasswordError, setShowPasswordError] = useState<boolean>(false);
  const [showEmailError, setShowEmailError] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);
  const [genLength, setGenLength] = useState<number>(14);
  const [roles, setRoles] = useState<{ value: string; displayName: string }[]>([]);

  const isAccountCreation = props.operationType === "create";
  const isArol = Number(props.user.companyID) === 0;

  // Set roles based on user type
  useEffect(() => {
    const companyRoleOptions = [
      { value: "none", displayName: "No role selected" },
      { value: "COMPANY_ROLE_WORKER", displayName: "Worker" },
      { value: "COMPANY_ROLE_MANAGER", displayName: "Manager" },
    ];
    const arolRoleOptions = [
      { value: "none", displayName: "No role selected" },
      { value: "AROL_ROLE_OFFICER", displayName: "Officer" },
      { value: "AROL_ROLE_SUPERVISOR", displayName: "Supervisor" },
    ];

    if (PermissionChecker.isArolChief(principal))
      arolRoleOptions.push({ value: "AROL_ROLE_CHIEF", displayName: "Chief" });
    if (PermissionChecker.isAdmin(principal) || Number(principal?.companyID) === 0)
      companyRoleOptions.push({ value: "COMPANY_ROLE_ADMIN", displayName: "Administrator" });

    setRoles(isArol ? arolRoleOptions : companyRoleOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal]);

  // Handle account creation or modification
  useEffect(() => {
    async function submitUserDetails() {
      if (!submit) return;

      const invalidPassword = isAccountCreation ? userPassword.length < 8 : false;
      const invalidEmail = !/\S+@\S+\.\S+/.test(userEmail);
      setShowPasswordError(invalidPassword);
      setShowEmailError(invalidEmail);

      if (invalidEmail || invalidPassword) {
        setSubmit(false);
        return;
      }

      try {
        user.roles = user.roles.filter((role) => role !== "none");
        if (isAccountCreation) {
          const newUser: User = await userService.createAccount(user, userPassword);
          newUser.active = true;
          if (props.setUsers) props.setUsers((val) => [newUser, ...val]);
          else if (props.setUsersWithPermissions && props.machineries)
            props.setUsersWithPermissions((val) => {
              return [
                {
                  user: newUser,
                  permissions: props.machineries!!.map((el) => ({
                    dashboardsModify: false,
                    dashboardsRead: false,
                    dashboardsWrite: false,
                    documentsModify: false,
                    documentsRead: false,
                    documentsWrite: false,
                    machineryAccess: false,
                    machineryUID: el.uid,
                    userID: newUser.id,
                  })),
                  active: true,
                },
                ...val,
              ];
            });
          else return;
          ToastHelper.makeToast(toast, "Account created", "success");
          props.setAccountModalUser(null);
        } else {
          const isDifferentUser = Number(principal?.id) !== Number(props.user.id);
          const isSameCompany =
            (Number(principal?.companyID) === 0 && Number(props.user.companyID) === 0) ||
            (Number(principal?.companyID) !== 0 && Number(props.user.companyID) !== 0);
          const hasLowerOrEqualRoleRank =
            PermissionChecker.getRoleRank(principal?.roles) <= PermissionChecker.getRoleRank(props.user.roles);

          if (isDifferentUser && isSameCompany && hasLowerOrEqualRoleRank) {
            setSubmit(false);
            return ToastHelper.makeToast(toast, "You cannot modify this account", "warning");
          }

          await userService.updateAccountDetails(user);

          if (props.setUsers) {
            props.setUsers((val) => {
              let foundUser = val.find((el) => el.id === user.id);
              if (foundUser) {
                let userIndex = val.indexOf(foundUser);
                val[userIndex] = user;
              }
              return [...val];
            });
          } else if (props.setUsersWithPermissions) {
            props.setUsersWithPermissions((val) => {
              let foundUser = val.find((el) => el.user.id === user.id);
              if (foundUser) {
                let userIndex = val.indexOf(foundUser);
                val[userIndex].user = user;
              }
              return [...val];
            });
          } else return;
          ToastHelper.makeToast(toast, "Account modified", "success");
          props.setAccountModalUser(null);
        }
        setSubmit(false);
      } catch (e) {
        AxiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          (isAccountCreation ? "Account creation" : "Account modification") + " failed",
        );
        setSubmit(false);
      }
    }
    submitUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccountCreation, submit, user, userEmail, userPassword]);

  // Handle changes in user details
  const handleUserDetailsChanged = useCallback((target: string, newValue: string) => {
    switch (target) {
      case "password":
        setUserPassword(newValue);
        break;
      case "email":
        setUserEmail(newValue);
        break;
      case "account-status":
        setUser((currentState) => ({ ...currentState, accountActive: newValue === "enabled" }));
        break;
      default:
        break;
    }

    setUser((currentState) => ({
      ...currentState,
      [target]: newValue,
    }));
  }, []);

  function handleRoleEdited(mode: string, roleValue?: string, index?: number) {
    setUser((val) => {
      if (mode === "add") {
        val.roles.push("none");
      } else if (mode === "select") {
        if (index! - val.roles.length > 0) return val;
        else if (index! - val.roles.length === 0) val.roles.push(roleValue!);
        else val.roles[index!] = roleValue!;
      } else if (mode === "remove") {
        val.roles = val.roles.filter((el) => el !== roleValue!);
      }
      return { ...val };
    });
  }

  const closeModal = useCallback(() => {
    if (submit) return;
    props.setAccountModalUser(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const isFormValid = useCallback(() => {
    const isNameValid = user.name.trim() !== "";
    const isSurnameValid = user.surname.trim() !== "";
    const hasEmail = userEmail.trim() !== "";
    const isPasswordValid = isAccountCreation ? userPassword.length > 0 : true;
    const hasRoles = user.roles.length === roles.length ? true : user.roles.length > 0 && !user.roles.includes("none");

    return isNameValid && isSurnameValid && isPasswordValid && hasRoles && hasEmail;
  }, [user, userEmail, isAccountCreation, userPassword, roles]);

  return (
    <Modal isOpen={props.accountModalUser !== null} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={"25px"} fontWeight={"semibold"}>
          {isAccountCreation ? "Create account" : "Modify account"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <HStack>
              <Box>
                <FormControl id="firstName" isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    type="text"
                    value={user.name}
                    onChange={(e) => handleUserDetailsChanged("name", e.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl id="lastName" isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    type="text"
                    value={user.surname}
                    onChange={(e) => handleUserDetailsChanged("surname", e.target.value)}
                  />
                </FormControl>
              </Box>
            </HStack>
            <FormControl id="email" isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={userEmail ? userEmail : ""}
                onChange={(e) => handleUserDetailsChanged("email", e.target.value)}
              />
              <Box color="red.500" mt={2} fontSize="sm" fontWeight="semibold" hidden={!showEmailError}>
                Enter a valid email address (e.g. example@email.it)
              </Box>
            </FormControl>
            {isAccountCreation && (
              <FormControl id="password" isRequired={true}>
                <FormLabel>Password</FormLabel>
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
                                  handleUserDetailsChanged(
                                    "password",
                                    GeneratePassword({
                                      length: genLength,
                                      symbols: true,
                                    }),
                                  );
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
                {isAccountCreation && !userPassword ? (
                  <Box color="blue.700" mt={2} fontSize="sm" fontWeight="semibold">
                    Click the key to generate a password randomly
                  </Box>
                ) : (
                  <Box color="red.500" mt={2} fontSize="sm" fontWeight="semibold" hidden={!showPasswordError}>
                    Password must be at least 8 characters long
                  </Box>
                )}
              </FormControl>
            )}
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <VStack w={"full"}>
                {user.roles.map((role, index, array) => (
                  <HStack key={index} w={"full"}>
                    <Select value={role} onChange={(e) => handleRoleEdited("select", e.target.value, index)}>
                      {roles
                        .filter((roleOption) => roleOption.value === role || !array.includes(roleOption.value))
                        .map((roleOption) => (
                          <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.displayName}
                          </option>
                        ))}
                    </Select>
                    {index < array.length - 1 && role !== "none" ? (
                      <Button colorScheme={"red"} onClick={() => handleRoleEdited("remove", role)}>
                        -
                      </Button>
                    ) : (
                      index === array.length - 1 &&
                      role !== "none" && (
                        <Button colorScheme={"teal"} onClick={() => handleRoleEdited("add")}>
                          +
                        </Button>
                      )
                    )}
                  </HStack>
                ))}
                {user.roles.length === 0 && (
                  <Select value={"none"} onChange={(e) => handleRoleEdited("select", e.target.value, 0)}>
                    {[...roles].map((roleOption) => (
                      <option key={roleOption.value} value={roleOption.value}>
                        {roleOption.displayName}
                      </option>
                    ))}
                  </Select>
                )}
              </VStack>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Account status</FormLabel>
              <RadioGroup
                onChange={(e) => handleUserDetailsChanged("account-status", e)}
                defaultValue={!isAccountCreation ? (user.accountActive ? "enabled" : "disabled") : "enabled"}
              >
                <HStack spacing="24px">
                  <Radio value="enabled">Enabled</Radio>
                  <Radio value="disabled">Disabled</Radio>
                </HStack>
              </RadioGroup>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={closeModal}>
            Close
          </Button>
          <Tooltip
            label={!isFormValid() && "Please fill in all required fields and add at least one role to confirm"}
            isDisabled={isFormValid()}
            placement="top"
            rounded="md"
          >
            <Button
              colorScheme={"blue"}
              isLoading={submit}
              loadingText={isAccountCreation ? "Creating account" : "Modifying account"}
              onClick={() => setSubmit(isFormValid())}
              isDisabled={!isFormValid()}
            >
              {isAccountCreation ? "Create account" : "Modify account"}
            </Button>
          </Tooltip>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
