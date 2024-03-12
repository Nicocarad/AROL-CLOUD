import { Fragment, useContext, useEffect, useState } from "react";
import Machinery from "../../machinery-management/interfaces/Machinery";
import UserWithPermissions from "../interfaces/UserWithPermissions";
import userService from "../../services/UserService";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import machineryService from "../../services/MachineryService";
import MachineryPermissions from "../interfaces/MachineryPermissions";
import dayjs from "dayjs";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { FiEdit3, FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import { MdPersonRemove } from "react-icons/md";
import ToastContext from "../../utils/contexts/ToastContext";
import UserAccountModal from "../../users/components/UserAccountModal";
import User from "../../users/interfaces/User";
import MachineryModal from "./MachineryModal";
import roleTranslator from "../../utils/RoleTranslator";
import helperFunctions from "../../utils/HelperFunctions";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import PermissionChecker from "../../utils/PermissionChecker";

interface MachineryPermissionsPanelProps {
  companyID?: number;
}

export default function MachineryPermissionsPanel(props: MachineryPermissionsPanelProps) {
  const companyID = props.companyID as number;

  const { principal } = useContext(PrincipalContext);
  const isArol = Number(principal?.companyID) === 0;

  const toast = useContext(ToastContext);

  const [permissions, setPermissions] = useState<UserWithPermissions[]>([]);
  const [principalPermissions, setPrincipalPermissions] = useState<UserWithPermissions | null>(null);
  const [machineries, setMachineries] = useState<Machinery[]>([]);

  const [refreshPermissions, setRefreshPermissions] = useState(false);

  const [userSearch, setUserSearch] = useState<{
    searchTerm: string;
    highlightTerm: string;
    doSearch: boolean;
  }>({
    searchTerm: "",
    highlightTerm: "",
    doSearch: false,
  });
  const [userSort, setUserSort] = useState<string>("name");

  const [accountModalUser, setAccountModalUser] = useState<User | null>(null);
  const [accountModalType, setAccountModalType] = useState<string>("");
  const [machineryModalOpen, setMachineryModalOpen] = useState<Machinery | undefined>(undefined);

  const [fetchData, setFetchData] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submit, setSubmit] = useState<boolean>(false);

  // CHECK IF USER IS LOGGED USER
  function isLoggedUser(user: User): boolean {
    return user.id.toString() === principal?.id;
  }

  // CHECK IF USER IS MODIFIABLE
  function isUserLocked(user: User): boolean {
    if (isLoggedUser(user)) return true;
    else if (Number(principal?.companyID) === Number(user.companyID))
      return PermissionChecker.getRoleRank(principal?.roles) <= PermissionChecker.getRoleRank(user.roles);
    else return false;
  }

  //FETCH USERS, MACHINERIES and COMBINE in USERS WITH PERMISSIONS
  useEffect(() => {
    if (!companyID) if (!principal || !principal.companyID) return;

    async function getData() {
      if (!refreshPermissions && !fetchData) return;

      if (!refreshPermissions) setIsLoading(true);

      try {
        const IDofCompanyToRetrive = companyID ? companyID : principal!.companyID!;

        const usersResult = await userService.getCompanyUsers(IDofCompanyToRetrive);
        const machineriesMapResultPromise = machineryService.getMachineriesByCompanyID(IDofCompanyToRetrive);
        const principalCompanyUsers = await userService.getCompanyUsers(principal!.companyID!);
        const principalUser = principalCompanyUsers.filter((e) => Number(e.id) === Number(principal!.id));

        if (Number(principal!.companyID) === 0 && principalUser) usersResult.push(principalUser[0]);

        usersResult.sort((a, b) => {
          const nameA = `${a.name.toLowerCase()} ${a.surname.toLowerCase()}`;
          const nameB = `${b.name.toLowerCase()} ${b.surname.toLowerCase()}`;
          return nameA.localeCompare(nameB);
        });

        let machineriesArray: Machinery[] = [];
        (await machineriesMapResultPromise).forEach((val) => {
          machineriesArray.push(...val);
        });
        setMachineries(machineriesArray);

        let permissionsArray: UserWithPermissions[] = [];
        for (const user of usersResult) {
          const machineryPermissionsResult: MachineryPermissions[] = await userService.getAllUserPermissions(
            Number(user.id),
          );

          let machineryPermissionsArray: MachineryPermissions[] = [];
          for (const machinery of machineriesArray) {
            const foundPermission = machineryPermissionsResult.find((el) => el.machineryUID === machinery.uid);
            // noinspection RedundantConditionalExpressionJS
            const permission = {
              machineryAccess: !!foundPermission,
              dashboardsModify: foundPermission?.dashboardsModify || false,
              dashboardsWrite: foundPermission?.dashboardsWrite || false,
              dashboardsRead: foundPermission?.dashboardsRead || false,
              documentsModify: foundPermission?.documentsModify || false,
              documentsRead: foundPermission?.documentsRead || false,
              documentsWrite: foundPermission?.documentsWrite || false,
              machineryUID: machinery.uid,
              userID: Number(user.id),
            };
            machineryPermissionsArray.push(permission);
          }

          if (isLoggedUser(user))
            setPrincipalPermissions({
              user: user,
              permissions: machineryPermissionsArray,
              active: false,
            });

          permissionsArray.push({
            user: user,
            permissions: machineryPermissionsArray,
            active: true,
          });
        }
        setPermissions(permissionsArray);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Error in fetching data");
      }

      setFetchData(false);

      if (!refreshPermissions) setIsLoading(false);
      else {
        setRefreshPermissions(false);
        setSubmit(false);
      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, companyID, fetchData, principal, refreshPermissions]);

  //HANDLE SEARCH
  useEffect(() => {
    if (userSearch.doSearch) {
      setUserSearch((val) => {
        val.doSearch = false;
        val.highlightTerm = val.searchTerm;
        return { ...val };
      });
      setPermissions((val) =>
        val.map((el) => {
          const searchTerm = userSearch.searchTerm.toLowerCase();
          const userFields = [
            el.user.name + " " + el.user.surname,
            el.user.email,
            roleTranslator.translateRoles(el.user.roles),
          ];
          const displayUser = !searchTerm || userFields.some((field) => field.toLowerCase().includes(searchTerm));
          return { ...el, active: displayUser };
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch.doSearch]);

  //HANDLE SORT
  useEffect(() => {
    if (permissions.length === 0) return;

    setPermissions((val) => {
      val.sort((a, b) => {
        switch (userSort) {
          case "name": {
            return a.user.name.toLowerCase() + a.user.surname.toLowerCase() >
              b.user.name.toLowerCase() + b.user.surname.toLowerCase()
              ? 1
              : -1;
          }
          case "email": {
            return a.user.email.toLowerCase() > b.user.email.toLowerCase() ? 1 : -1;
          }
          case "account-status": {
            return Number(b.user.accountActive) - Number(a.user.accountActive);
          }
          default: {
            console.error("Unknown sort term");
            return 0;
          }
        }
      });

      return [...val];
    });

    ToastHelper.makeToast(toast, "Sorting applied", "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSort]);

  //HANDLE UPDATE PERMISSIONS
  useEffect(() => {
    if (!submit) return;

    async function updatePermissions() {
      try {
        const permissionsToUpdatePromises: Promise<any>[] = [];
        for (const userWithPermissions of permissions.filter((el) => el.user.id.toString() !== principal?.id)) {
          for (const permission of userWithPermissions.permissions) {
            permissionsToUpdatePromises.push(userService.updateUserPermissions(permission));
          }
        }
        await Promise.all(permissionsToUpdatePromises);
        ToastHelper.makeToast(toast, "Permissions updated", "success");
      } catch (e) {
        console.error("Error in updating permissions:", e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Some permissions could not be updated");
      }
      setRefreshPermissions(true);
    }

    updatePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, principal, submit]);

  //HANDLE PERMISSION CHECKED/UNCHECKED
  function handlePermissionChanged(userID: number, machineryUID: string, permissionType: string, value: boolean) {
    setPermissions((val) => {
      const userPermissionsFound = val.find((el) => Number(el.user.id) === Number(userID));
      if (!userPermissionsFound) return val;

      const userPermissionFound = userPermissionsFound!.permissions.find((el) => el.machineryUID === machineryUID);
      if (!userPermissionFound) return val;

      switch (permissionType) {
        case "machinery-access": {
          userPermissionFound.machineryAccess = value;
          userPermissionFound.dashboardsWrite = value;
          userPermissionFound.dashboardsModify = value;
          userPermissionFound.dashboardsRead = value;
          userPermissionFound.documentsWrite = value;
          userPermissionFound.documentsModify = value;
          userPermissionFound.documentsRead = value;
          break;
        }
        default: {
          if (Object(userPermissionFound).hasOwnProperty(permissionType)) {
            userPermissionFound[permissionType] = value;
            if (value) {
              userPermissionFound.machineryAccess = true;

              if (permissionType === "dashboardsWrite") {
                userPermissionFound.dashboardsModify = true;
                userPermissionFound.dashboardsRead = true;
              } else if (permissionType === "dashboardsModify") {
                userPermissionFound.dashboardsRead = true;
              }

              if (permissionType === "documentsWrite") {
                userPermissionFound.documentsModify = true;
                userPermissionFound.documentsRead = true;
              } else if (permissionType === "documentsModify") {
                userPermissionFound.documentsRead = true;
              }
            } else {
              if (areAllPermissionsDisabled(userPermissionFound)) {
                userPermissionFound.machineryAccess = false;
              }

              if (permissionType === "dashboardsRead") {
                userPermissionFound.dashboardsModify = false;
                userPermissionFound.dashboardsWrite = false;
              } else if (permissionType === "dashboardsModify") {
                userPermissionFound.dashboardsWrite = false;
              }

              if (permissionType === "documentsRead") {
                userPermissionFound.documentsModify = false;
                userPermissionFound.documentsWrite = false;
              } else if (permissionType === "documentsModify") {
                userPermissionFound.documentsWrite = false;
              }
            }
          } else {
            console.error("Unknown permission type");
          }
          break;
        }
      }
      return [...val];
    });
  }

  //HELPER FN - check if all dash/doc permission are unchecked
  function areAllPermissionsDisabled(permission: MachineryPermissions) {
    return (
      !permission.dashboardsWrite &&
      !permission.dashboardsModify &&
      !permission.dashboardsRead &&
      !permission.documentsWrite &&
      !permission.documentsModify &&
      !permission.documentsRead
    );
  }

  //HELPER FN - remove all permissions
  function removeAllPermissions(userWithPermissions: UserWithPermissions) {
    const userID = userWithPermissions.user.id;
    const machineriesUID = userWithPermissions.permissions.map((el) => el.machineryUID);
    const checkPermissions = userWithPermissions.permissions.every((e) => areAllPermissionsDisabled(e));

    if (checkPermissions) ToastHelper.makeToast(toast, "User doesn't have any permissions", "warning");
    else
      machineriesUID.forEach((machineryUID) => {
        handlePermissionChanged(userID, machineryUID, "machinery-access", false);
      });
  }

  function UserElement(userWithPermissions: UserWithPermissions) {
    return (
      <VStack
        _hover={{
          cursor: isUserLocked(userWithPermissions.user) ? "default" : "pointer",
        }}
        onClick={() => {
          if (isUserLocked(userWithPermissions.user)) return;
          setAccountModalUser(userWithPermissions.user);
          setAccountModalType("modify");
        }}
      >
        {dayjs().diff(dayjs(+userWithPermissions.user.createdAt), "day") < 7 && <Badge colorScheme="purple">New</Badge>}
        <Text fontSize={"md"} fontWeight={500}>
          {helperFunctions.highlightText(
            userWithPermissions.user.name + " " + userWithPermissions.user.surname,
            500,
            userSearch.highlightTerm,
          )}
          {isLoggedUser(userWithPermissions.user) && " (You)"}
        </Text>
        <Text fontSize={"sm"} fontWeight={400} mt={"0!important"}>
          {helperFunctions.highlightText(userWithPermissions.user.email, 400, userSearch.highlightTerm)}
        </Text>
        <Text fontSize={"sm"} fontWeight={400} color={"gray.400"} mt={"0!important"}>
          {helperFunctions.highlightText(
            roleTranslator.translateRoles(userWithPermissions.user.roles),
            400,
            userSearch.highlightTerm,
          )}
        </Text>
        <Text color={userWithPermissions.user.accountActive ? "teal" : "red"} fontWeight={500} whiteSpace={"nowrap"}>
          {userWithPermissions.user.accountActive ? "ACTIVE" : "DISABLED"}
        </Text>
      </VStack>
    );
  }

  function MachineryPermissionsTable() {
    return (
      <VStack p={6} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
        {
          <>
            <TableContainer w={"full"}>
              <Table variant="striped" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th rowSpan={2} textAlign={"center"} fontSize={20}>
                      User
                    </Th>
                    <Th colSpan={2} textAlign={"center"} fontSize={17}>
                      Machinery
                    </Th>
                    <Th colSpan={3} textAlign={"center"} fontSize={17}>
                      Dashboards access
                    </Th>
                    <Th colSpan={3} textAlign={"center"} fontSize={17}>
                      Documents access
                    </Th>
                  </Tr>
                  <Tr>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Name
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Access
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Write
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Modify
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Read
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Write
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Modify
                    </Th>
                    <Th textAlign={"center"} fontWeight={"semibold"} fontSize={14}>
                      Read
                    </Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {(isArol ? permissions.filter((el) => el.user.id.toString() !== principal?.id) : permissions)
                    .filter((el) => el.active === true)
                    .map((userWithPermissions) => {
                      const isUserAdminAndPrincipalArol = PermissionChecker.isAdmin(userWithPermissions.user) && isArol;
                      const isArolSupervisorOrAbove = PermissionChecker.isArolSupervisorOrAbove(
                        userWithPermissions.user,
                      );
                      const isOverPrincipal =
                        !PermissionChecker.isArolSupervisorOrAbove(principal) &&
                        PermissionChecker.getRoleRank(userWithPermissions.user.roles) >=
                          PermissionChecker.getRoleRank(principal?.roles);
                      // Both isDisabled and isChecked will be used in combination with the effetive access to the machinery
                      const isDisabled =
                        isLoggedUser(userWithPermissions.user) ||
                        isUserAdminAndPrincipalArol ||
                        isArolSupervisorOrAbove ||
                        isOverPrincipal;
                      const isChecked = isUserAdminAndPrincipalArol || isArolSupervisorOrAbove;
                      return (
                        <Fragment key={userWithPermissions.user.id}>
                          {userWithPermissions.permissions.map((permission, index) => {
                            const principalPermission = principalPermissions?.permissions.find(
                              (el) => el.machineryUID === permission.machineryUID,
                            );
                            return (
                              <Fragment key={permission.userID + "_" + permission.machineryUID}>
                                {principalPermission && (
                                  <Tr
                                    style={{
                                      ...(index === 0 && {
                                        borderColor: "gray",
                                        borderTopWidth: "3px",
                                      }),
                                    }}
                                  >
                                    {index === 0 && (
                                      <>
                                        <Td rowSpan={userWithPermissions.permissions.length} textAlign={"center"}>
                                          {UserElement(userWithPermissions)}
                                          <Button
                                            rightIcon={<MdPersonRemove />}
                                            size="sm"
                                            variant="outline"
                                            marginTop={"50px"}
                                            colorScheme={"blue"}
                                            isDisabled={isDisabled || !principalPermission.machineryAccess}
                                            onClick={() => removeAllPermissions(userWithPermissions)}
                                          >
                                            Remove all
                                          </Button>
                                        </Td>
                                      </>
                                    )}
                                    <Td textAlign={"center"}>
                                      <Text
                                        fontSize={"md"}
                                        fontWeight={500}
                                        _hover={{ cursor: "pointer" }}
                                        onClick={() =>
                                          setMachineryModalOpen(
                                            machineries.find((el) => el.uid === permission.machineryUID),
                                          )
                                        }
                                      >
                                        {permission.machineryUID}
                                      </Text>
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.machineryAccess}
                                        isChecked={isChecked || permission.machineryAccess}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "machinery-access",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.dashboardsWrite}
                                        isChecked={isChecked || permission.dashboardsWrite}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "dashboardsWrite",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.dashboardsModify}
                                        isChecked={isChecked || permission.dashboardsModify}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "dashboardsModify",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.dashboardsRead}
                                        isChecked={isChecked || permission.dashboardsRead}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "dashboardsRead",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.documentsWrite}
                                        isChecked={isChecked || permission.documentsWrite}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "documentsWrite",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.documentsModify}
                                        isChecked={isChecked || permission.documentsModify}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "documentsModify",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                    <Td textAlign={"center"}>
                                      <Checkbox
                                        size="lg"
                                        colorScheme="blue"
                                        isDisabled={isDisabled || !principalPermission.documentsRead}
                                        isChecked={isChecked || permission.documentsRead}
                                        onChange={(e) =>
                                          handlePermissionChanged(
                                            permission.userID,
                                            permission.machineryUID,
                                            "documentsRead",
                                            e.target.checked,
                                          )
                                        }
                                      />
                                    </Td>
                                  </Tr>
                                )}
                              </Fragment>
                            );
                          })}
                          {userWithPermissions.permissions.length === 0 && (
                            <Tr>
                              <Td textAlign={"center"}>{UserElement(userWithPermissions)}</Td>
                              <Td colSpan={8} textAlign={"center"}>
                                No machineries available
                              </Td>
                            </Tr>
                          )}
                        </Fragment>
                      );
                    })}
                </Tbody>
              </Table>
            </TableContainer>
            <HStack w={"full"} justifyContent={"right"}>
              <Button
                mt={2}
                leftIcon={<FiEdit3 />}
                colorScheme={"teal"}
                isLoading={submit}
                loadingText={"Updating permissions"}
                onClick={() => setSubmit(true)}
              >
                Update permissions
              </Button>
            </HStack>
          </>
        }
      </VStack>
    );
  }

  return (
    <>
      <VStack w={"full"} h={"full"}>
        <VStack
          px={6}
          py={2}
          w={"full"}
          borderWidth={1}
          borderColor={"gray.200"}
          bgColor={"white"}
          rounded={"md"}
          justifyContent={"space-between"}
        >
          <HStack w={"full"} justifyContent={"space-between"}>
            <Text>Looking to create a new user account?</Text>
            <Button
              w={"250px"}
              leftIcon={<FiUserPlus />}
              colorScheme={"blue"}
              onClick={() => {
                setAccountModalUser({
                  id: 0,
                  email: "",
                  name: "",
                  surname: "",
                  roles: [],
                  accountActive: true,
                  companyID: companyID ? companyID : principal!!.companyID,
                  createdAt: 0,
                  createdBy: "",
                  active: true,
                  isTemp: true,
                });
                setAccountModalType("create");
              }}
            >
              Create new account
            </Button>
          </HStack>
        </VStack>
        <VStack
          p={6}
          w={"full"}
          borderWidth={1}
          borderColor={"gray.200"}
          bgColor={"white"}
          rounded={"md"}
          justifyContent={"start"}
        >
          <HStack w={"full"}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<FiSearch />} />
              <Input
                pr="4.5rem"
                type={"text"}
                placeholder="Search users"
                value={userSearch.searchTerm}
                onChange={(e) =>
                  setUserSearch((val) => ({
                    ...val,
                    searchTerm: e.target.value,
                  }))
                }
              />
              <InputRightElement width="6.5rem">
                <Box
                  pr={1}
                  _hover={{ cursor: "pointer" }}
                  onClick={() => {
                    setUserSearch({
                      searchTerm: "",
                      doSearch: true,
                      highlightTerm: "",
                    });
                  }}
                >
                  <FiX size={18} color={"gray"} />
                </Box>
                <Button
                  h="1.75rem"
                  size="sm"
                  colorScheme={"blue"}
                  onClick={() =>
                    setUserSearch((val) => ({
                      ...val,
                      doSearch: true,
                      searchTerm: val.searchTerm.trim(),
                    }))
                  }
                >
                  Search
                </Button>
              </InputRightElement>
            </InputGroup>
            <Select w={"350px"} value={userSort} onChange={(e) => setUserSort(e.target.value)}>
              <option value="name">Sort by name</option>
              <option value="email">Sort by email</option>
              <option value="account-status">Sort by account status</option>
            </Select>
          </HStack>
        </VStack>

        <HStack w={"full"}>
          <Alert status="info" variant={"left-accent"} rounded={"md"}>
            <AlertIcon />
            <AlertTitle>Important information:</AlertTitle>
            Changes can take up to 5 minute to fully propagate.
          </Alert>
        </HStack>

        {isLoading ? (
          <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"xl"} />
          </VStack>
        ) : userSearch.highlightTerm && permissions.filter((el) => el.active).length === 0 ? (
          <Text>No matches found</Text>
        ) : !userSearch.highlightTerm && permissions.filter((el) => el.active).length < (isArol ? 2 : 1) ? (
          <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
            <Text>No users available. Start by creating one</Text>
          </VStack>
        ) : (
          <MachineryPermissionsTable />
        )}
      </VStack>

      {accountModalUser && (
        <UserAccountModal
          accountModalUser={accountModalUser}
          setAccountModalUser={setAccountModalUser}
          operationType={accountModalType}
          user={accountModalUser}
          setUsers={null}
          setUsersWithPermissions={setPermissions}
          machineries={machineries}
        />
      )}
      {machineryModalOpen && (
        <MachineryModal
          machineryModalMachinery={machineryModalOpen}
          setMachineryModalMachinery={setMachineryModalOpen}
        />
      )}
    </>
  );
}
