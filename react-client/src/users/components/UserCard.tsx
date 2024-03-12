import { Avatar, Box, Button, Divider, Heading, HStack, Text, VStack, Flex, Badge } from "@chakra-ui/react";

import React, { useContext, useEffect, useState, useRef } from "react";
import User from "../interfaces/User";
import UserService from "../../services/UserService";
import ToastContext from "../../utils/contexts/ToastContext";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import dayjs from "dayjs";
import { FiCheckCircle, FiEdit3, FiKey, FiXCircle } from "react-icons/fi";
import roleTranslator from "../../utils/RoleTranslator";
import helperFunctions from "../../utils/HelperFunctions";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from "@chakra-ui/react";
import PermissionChecker from "../../utils/PermissionChecker";
import userService from "../../services/UserService";

interface UserCardProps {
  onUpdate: (newValue: any) => void;
  user: User;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  highlightTerm: string;
  setAccountModalUser: React.Dispatch<React.SetStateAction<User | null>>;
  setAccountModalType: React.Dispatch<React.SetStateAction<string>>;
  setResetPasswordModalUser: React.Dispatch<React.SetStateAction<User | null>>;
  openPopoverId: string | null;
  usersCount: number;
}

export default function UserCard(props: UserCardProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);

  const completeName = props.user.name + " " + props.user.surname;
  const isLoggedUser = props.user.id.toString() === principal?.id;

  const [accountStatus, setAccountStatus] = useState<string>("");

  function isUserLocked(user: User): boolean {
    if (isLoggedUser) return true;
    else if (Number(principal?.companyID) === Number(user.companyID))
      return PermissionChecker.getRoleRank(principal?.roles) <= PermissionChecker.getRoleRank(user.roles);
    else return false;
  }

  useEffect(() => {
    if (!accountStatus) return;

    async function changeAccountStatus() {
      try {
        const newAccountDetails = { ...props.user };
        newAccountDetails.accountActive = accountStatus === "enabled";
        await UserService.updateAccountDetails(newAccountDetails);

        props.setUsers((val) => {
          const foundUser = val.find((el) => el.id === newAccountDetails.id);
          if (foundUser) val[val.indexOf(foundUser)] = newAccountDetails;
          return [...val];
        });

        ToastHelper.makeToast(toast, "Account status updated", "success");
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Account status could not be updated");
      }

      setAccountStatus("");
    }

    changeAccountStatus();
  }, [accountStatus, props, toast]);

  function handleModifyAccountClicked() {
    props.setAccountModalUser(props.user);
    props.setAccountModalType("modify");
  }

  function DeleteUserButton({ user }: { user: User }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef(null);
    const toast = useContext(ToastContext);

    async function handleDeleteButtonClicked() {
      try {
        const permissions = await UserService.getAllUserPermissions(user.id);
        if (permissions.length > 0) await UserService.deleteAllUserPermissions(user.id);

        const userDeleted = await UserService.deleteUser(user.id);
        if (userDeleted) {
          props.onUpdate(true);
          ToastHelper.makeToast(toast, "Account deleted", "success");
        }
      } catch (e) {
        let msg = "Account could not be deleted";
        if (props.usersCount === 1) msg = "Company must have at least one user";
        else if ((await userService.getAllUserPermissions(user.id)).length > 0) msg = "User still has some machineries";
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, msg);
      }
    }

    return (
      <>
        {props.usersCount > 1 ? (
          <>
            <Button leftIcon={<FiXCircle />} colorScheme="red" loadingText="Deleting account" onClick={onOpen}>
              Delete account
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Account
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure you want to delete user:
                    <Box
                      pl={5}
                      pr={5}
                      pt={2}
                      pb={2}
                      mt={4}
                      mb={4}
                      border={"2px"}
                      w="fit-content"
                      rounded={10}
                      borderStyle={"teil.400"}
                    >
                      <Box>
                        <Flex direction="row" gap={2}>
                          <Text>Name:</Text>
                          <Text fontWeight={"medium"}>
                            {user.name} {user.surname}
                          </Text>
                        </Flex>
                      </Box>
                      <Box>
                        <Flex direction="row" gap={2}>
                          <Text>Email:</Text>
                          <Text fontWeight={"medium"}>{user.email}</Text>
                        </Flex>
                      </Box>
                    </Box>
                    This user could be associated to a machinery and it will delete all associated data.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" ml={3} onClick={() => handleDeleteButtonClicked()}>
                      Delete Account
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        ) : (
          <>
            <Button leftIcon={<FiXCircle />} colorScheme="red" loadingText="Deleting account" onClick={onOpen}>
              Delete account
            </Button>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Account
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Unfortunately this company has only one user left so you cannot delete it. Consider to disable the
                    account instead, or completly delete the company.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Close
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>
        )}
      </>
    );
  }

  const hoverStyle = {
    _hover: {
      boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
      transform: "translateY(-5px)",
      transition: "transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out",
    },
  };

  return (
    <HStack
      px={6}
      pt={6}
      pb={2}
      mt={1}
      w={"full"}
      h={"fit-content"}
      borderWidth={1}
      borderColor={"gray.200"}
      bgColor={"white"}
      rounded={"md"}
      alignItems={"stretch"}
      columnGap={5}
      {...(!props.openPopoverId ? hoverStyle : {})}
    >
      <VStack w={"full"}>
        <HStack w={"full"}>
          <Avatar size={"md"} name={completeName} />

          <VStack justifyContent="flex-start" alignItems="flex-start" flexWrap={"nowrap"} w={"full"} h={"full"} pl={3}>
            <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={550} color={"black"} whiteSpace={"nowrap"}>
              {helperFunctions.highlightText(completeName, 550, props.highlightTerm)}
              {isLoggedUser && " (You)"}
              &nbsp;
              {dayjs().diff(dayjs(+props.user.createdAt), "day") < 7 && <Badge colorScheme="purple">New</Badge>}
              &nbsp;
            </Heading>

            <Heading
              fontSize={"md"}
              fontFamily={"body"}
              fontWeight={450}
              color={"gray.500"}
              whiteSpace={"nowrap"}
              mb={"1!important"}
            >
              {helperFunctions.highlightText(props.user.email, 450, props.highlightTerm)}
            </Heading>
          </VStack>
        </HStack>
        <Divider />
        <HStack w={"full"} justifyContent={"left"} alignItems={"stretch"}>
          <Box>
            <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
              Account status
            </Text>
            <Text
              color={props.user.accountActive ? "teal" : "red"}
              fontWeight={500}
              whiteSpace={"nowrap"}
              mt={"0!important"}
              mb={4}
            >
              {props.user.accountActive ? "ACTIVE" : "DISABLED"}
            </Text>
          </Box>
          <Divider orientation={"vertical"} h={"auto"} />
          <Box>
            <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
              User Roles
            </Text>
            <Text color={"black"} fontSize="md" fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"} mb={4}>
              {helperFunctions.highlightText(roleTranslator.translateRoles(props.user.roles), 400, props.highlightTerm)}
            </Text>
          </Box>
        </HStack>

        <HStack w={"full"} justifyContent={"left"} spacing={4}>
          <Text fontSize={"sm"} color={"gray.400"} fontWeight={400}>
            Account created on: {dayjs(+props.user.createdAt).format("D MMM YYYY H:mm")}
          </Text>
        </HStack>
      </VStack>

      <VStack h={"full"} justifyContent={"start"}>
        <Button
          leftIcon={<FiEdit3 />}
          colorScheme={"blue"}
          isDisabled={isUserLocked(props.user)}
          onClick={handleModifyAccountClicked}
        >
          Modify account
        </Button>
        <Button
          leftIcon={<FiKey />}
          colorScheme={"purple"}
          isDisabled={isUserLocked(props.user)}
          onClick={() => props.setResetPasswordModalUser(props.user)}
        >
          Reset password
        </Button>
        {props.user.accountActive ? (
          <Button
            leftIcon={<FiXCircle />}
            colorScheme={"red"}
            isLoading={accountStatus !== ""}
            loadingText={"Disabling account"}
            isDisabled={isUserLocked(props.user)}
            onClick={() => setAccountStatus("disabled")}
          >
            Disable account
          </Button>
        ) : (
          <>
            <Button
              leftIcon={<FiCheckCircle />}
              colorScheme={"teal"}
              isLoading={accountStatus !== ""}
              loadingText={"Enabling account"}
              isDisabled={isUserLocked(props.user)}
              onClick={() => setAccountStatus("enabled")}
            >
              Enable account
            </Button>
            <DeleteUserButton user={props.user} />
          </>
        )}
      </VStack>
    </HStack>
  );
}
