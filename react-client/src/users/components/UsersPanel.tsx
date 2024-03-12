import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import ToastContext from "../../utils/contexts/ToastContext";
import { FiSearch, FiUserPlus, FiX } from "react-icons/fi";
import UserCard from "./UserCard";
import User from "../interfaces/User";
import UserFilters from "../../filters/interfaces/UserFilters";
import userService from "../../services/UserService";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import UserAccountModal from "./UserAccountModal";
import PasswordResetModal from "./PasswordResetModal";
import roleTranslator from "../../utils/RoleTranslator";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import UserFilter from "../../filters/components/UserFilter";
import dayjs from "dayjs";

export default function UsersPanel({ companyID }) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);
  // Loading state
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  // User data
  const [users, setUsers] = useState<User[]>([]);
  // User search and sort
  const [userSearch, setUserSearch] = useState<{
    searchTerm: string;
    highlightTerm: string;
    doSearch: boolean;
  }>({
    searchTerm: "",
    highlightTerm: "",
    doSearch: false,
  });
  const [userSort, setUserSort] = useState<string>("none");
  // User filters
  const [userFilter, setUserFilter] = useState<UserFilters>({});
  // UI state
  const [deleted, setDeleted] = useState(false);
  const [accountModalUser, setAccountModalUser] = useState<User | null>(null);
  const [accountModalType, setAccountModalType] = useState<string>("");
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<User | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  /* FILTERING FUNCTIONS */

  function isDateInRange(dateToCheck: number): boolean {
    const startDate = userFilter.creationDate?.startDate;
    const endDate = userFilter.creationDate?.endDate;
    const dayjsDate = dayjs(dateToCheck);
    if (startDate && dayjsDate.isBefore(startDate, "day")) return false;
    if (endDate && dayjsDate.isAfter(endDate, "day")) return false;
    return true;
  }

  function hasSelectedRoles(user: User): boolean {
    if (!userFilter.roles) return true;
    return user.roles.some((role) => userFilter.roles![role]);
  }

  function isActive(user: User): boolean {
    if (!userFilter.status) return true;
    return user.accountActive === (userFilter.status === "ACTIVE");
  }

  function foundSearchTerm(user: User): boolean {
    if (!userSearch.searchTerm) return true;

    const searchTerm = userSearch.searchTerm.toLowerCase();
    const userFields = [user.name + " " + user.surname, user.email, roleTranslator.translateRoles(user.roles)];

    return userFields.some((field) => field.toLowerCase().includes(searchTerm));
  }

  // LOAD USERS
  useEffect(() => {
    if (userSort !== "none") return;

    async function getUsers() {
      setLoadingUsers(true);
      setDeleted(false);
      try {
        const usersResult = await userService.getCompanyUsers(companyID);
        setUsers(usersResult);
        setUserSearch((val) => {
          val.doSearch = true;
          return { ...val };
        });
      } catch (e) {
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Dashboards could not be fetched");
      } finally {
        setLoadingUsers(false);
      }
    }
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal, companyID, deleted]);

  // HANDLE SEARCH AND FILTER
  useEffect(() => {
    if (userSearch.doSearch) {
      setUserSearch((val) => {
        val.doSearch = false;
        val.highlightTerm = val.searchTerm;
        return { ...val };
      });
    }
    setUsers((users) =>
      users.map((user) => {
        const displayUser =
          isActive(user) && isDateInRange(+user.createdAt) && hasSelectedRoles(user) && foundSearchTerm(user);
        return { ...user, active: displayUser };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFilter, userSearch.doSearch]);

  // HANDLE SORT
  useEffect(() => {
    if (userSort === "none") return;

    setUsers((users) => {
      users.sort((a, b) => {
        switch (userSort) {
          case "name": {
            return a.name.toLowerCase() + a.surname.toLowerCase() > b.name.toLowerCase() + b.surname.toLowerCase()
              ? 1
              : -1;
          }
          case "email": {
            return a.email.toLowerCase() > b.email.toLowerCase() ? 1 : -1;
          }
          case "account-status": {
            return Number(b.accountActive) - Number(a.accountActive);
          }
          case "created-at": {
            return b.createdAt - a.createdAt;
          }
          default: {
            console.error("Unknown sort term");
            return 0;
          }
        }
      });

      return [...users];
    });
    ToastHelper.makeToast(toast, "Sorting applied", "info");
  }, [toast, userSort]);

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
                  companyID: companyID ? companyID : principal?.companyID,
                  createdAt: 0,
                  createdBy: "",
                  active: true,
                  isTemp: false,
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
                  setUserSearch((val) => {
                    val.searchTerm = e.target.value;
                    return { ...val };
                  })
                }
              />
              <InputRightElement width="6.5rem">
                <Box
                  pr={1}
                  _hover={{
                    cursor: "pointer",
                  }}
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
                    setUserSearch((val) => {
                      val.doSearch = true;
                      val.searchTerm = val.searchTerm.trim();
                      return { ...val };
                    })
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
          {!loadingUsers && users.length > 0 && (
            <UserFilter
              companyID={companyID!}
              setUserFilter={setUserFilter}
              onPopoverChange={(popoverId) => setOpenPopoverId(popoverId)}
            />
          )}
        </VStack>

        <HStack w={"full"}>
          <Alert status="info" variant={"left-accent"} rounded={"md"}>
            <AlertIcon />
            <AlertTitle>Important information:</AlertTitle>
            Changes can take up to 5 minute to fully propagate.
          </Alert>
        </HStack>

        {loadingUsers ? (
          <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"xl"} />
          </VStack>
        ) : (
          <>
            {users
              .filter((user) => user.active)
              .map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  setUsers={setUsers}
                  highlightTerm={userSearch.highlightTerm}
                  setAccountModalUser={setAccountModalUser}
                  setAccountModalType={setAccountModalType}
                  setResetPasswordModalUser={setResetPasswordModalUser}
                  onUpdate={(flag) => setDeleted(flag)}
                  openPopoverId={openPopoverId}
                  usersCount={users.length}
                />
              ))}
            {users.filter((user) => user.active).length === 0 && (
              <HStack w={"full"} h={"200px"} justifyContent={"center"} alignItems={"center"}>
                {userSearch.highlightTerm || userFilter.creationDate || userFilter.roles || userFilter.status ? (
                  <Text>No matches found</Text>
                ) : (
                  <Text>No users available. Start by creating a user</Text>
                )}
              </HStack>
            )}
          </>
        )}
      </VStack>
      {accountModalUser && (
        <UserAccountModal
          accountModalUser={accountModalUser}
          setAccountModalUser={setAccountModalUser}
          operationType={accountModalType}
          user={accountModalUser}
          setUsers={setUsers}
          setUsersWithPermissions={null}
          machineries={null}
        />
      )}
      {resetPasswordModalUser && (
        <PasswordResetModal
          passwordResetModalUser={resetPasswordModalUser}
          setPasswordResetModalUser={setResetPasswordModalUser}
          user={resetPasswordModalUser}
        />
      )}
    </>
  );
}
