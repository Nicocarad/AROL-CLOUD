import { useContext, useEffect, useState } from "react";
import Machinery from "../../machinery-management/interfaces/Machinery";
import UserWithPermissions from "../interfaces/UserWithPermissions";
import userService from "../../services/UserService";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import machineryService from "../../services/MachineryService";
import MachineryPermissions from "../interfaces/MachineryPermissions";
import MachineryForm from "../../machinery-management/components/MachineryForm";
import { FcCancel, FcOk } from "react-icons/fc";
import { GiMechanicalArm } from "react-icons/gi";
import { BiSolidUser } from "react-icons/bi";
import { MdSettings } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import dayjs from "dayjs";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  HStack,
  StackDivider,
  Select,
  VStack,
  Divider,
  Text,
  Tooltip,
  Heading,
  Image,
  Avatar,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalContent,
  ModalCloseButton,
  Badge,
  List,
  ListItem,
  ListIcon,
  Spinner,
} from "@chakra-ui/react";
import ToastContext from "../../utils/contexts/ToastContext";
import User from "../../users/interfaces/User";
import roleTranslator from "../../utils/RoleTranslator";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import companyService from "../../services/CompanyService";
import Company from "../../companies/interfaces/Company";
import PermissionChecker from "../../utils/PermissionChecker";

export default function MachineryPermissionsPanelArol() {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<UserWithPermissions[]>([]);
  const [machineries, setMachineries] = useState<Machinery[]>([]);
  const [fetchData, setFetchData] = useState<boolean>(true);
  const [selectedMachinery, setSelectedMachinery] = useState<
    Machinery | undefined
  >(undefined);
  const [usersResult, setUsersResult] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [permissionButtonMode, setPermissionButtonMode] = useState<string>("");
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // FETCH DATA
  useEffect(() => {
    async function retrieveData() {
      if (!fetchData) return;
      if (!principal || Number(principal.companyID) !== 0) return;

      setIsLoading(true);

      try {
        const [companies, users, machineries] = await Promise.all([
          companyService.getCompanies(),
          userService.getCompanyUsers(0),
          machineryService.getAllMachineries(),
        ]);

        setCompanies(companies);

        // Filter, sort and set users
        let sortedUsers = users
          .filter(({ accountActive }) => accountActive)
          .sort((a, b) =>
            `${a.name.toLowerCase()} ${a.surname.toLowerCase()}`.localeCompare(
              `${b.name.toLowerCase()} ${b.surname.toLowerCase()}`
            )
          );
        if (principal?.roles.includes("AROL_ROLE_SUPERVISOR"))
          sortedUsers = sortedUsers.filter(
            ({ roles }) => !roles.includes("AROL_ROLE_CHIEF")
          );
        setUsersResult(sortedUsers);
        if (!selectedUser) setSelectedUser(sortedUsers[0]);

        const filteredMachineryArray: Machinery[] = [];
        machineries.forEach((val) => {
          val.forEach((machinery) => {
            if (PermissionChecker.hasMachineryAccess(principal, machinery.uid))
              filteredMachineryArray.push(machinery);
          });
        });

        setMachineries(filteredMachineryArray);
        if (!selectedMachinery) setSelectedMachinery(filteredMachineryArray[0]);

        // Fetch permissions and combine with users
        let permissionsArray: UserWithPermissions[] = [];
        for (const user of sortedUsers) {
          const machineryPermissionsResult: MachineryPermissions[] =
            await userService.getAllUserPermissions(Number(user.id));
          let machineryPermissionsArray: MachineryPermissions[] = [];
          for (const machinery of filteredMachineryArray) {
            const foundPermission = machineryPermissionsResult.find(
              (el) => el.machineryUID === machinery.uid
            );
            if (foundPermission) {
              const permission = {
                machineryAccess: true,
                dashboardsModify: foundPermission.dashboardsModify || false,
                dashboardsWrite: foundPermission.dashboardsWrite || false,
                dashboardsRead: foundPermission.dashboardsRead || false,
                documentsModify: foundPermission.documentsModify || false,
                documentsRead: foundPermission.documentsRead || false,
                documentsWrite: foundPermission.documentsWrite || false,
                machineryUID: machinery.uid,
                userID: Number(user.id),
              };
              machineryPermissionsArray.push(permission);
            }
          }
          permissionsArray.push({
            user: user,
            permissions: machineryPermissionsArray,
            active: true,
          });
        }
        setPermissions(permissionsArray);

        setFetchData(false);

        setIsLoading(false);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          "Error retrieving data"
        );
      }
    }

    retrieveData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, principal, selectedMachinery, fetchData]);

  // UPDATE PERMISSION BUTTON MODE
  useEffect(() => {
    const disable = permissions.some(
      (el) =>
        el.user.id === selectedUser?.id &&
        el.permissions.some(
          (perm) =>
            perm.machineryUID === selectedMachinery?.uid && perm.machineryAccess
        )
    );

    setHasPermissions(
      PermissionChecker.getRoleRank(principal?.roles) >
        PermissionChecker.getRoleRank(selectedUser?.roles) &&
        PermissionChecker.hasMachineryAccess(
          principal,
          selectedMachinery?.uid!
        )!
    );

    setPermissionButtonMode(disable ? "disable" : "enable");
  }, [principal, selectedMachinery, permissions, selectedUser]);

  // HANDLE ACCESS GIVEN/REVOKED
  async function handleAccessModified() {
    if (selectedUser?.id.toString() === principal?.id)
      return ToastHelper.makeToast(
        toast,
        "You can't change your own permissions",
        "warning"
      );
    if (!hasPermissions)
      return ToastHelper.makeToast(
        toast,
        "You don't have the required permissions",
        "warning"
      );

    try {
      const disable = permissions.some(
        (el) =>
          el.user.id === selectedUser?.id &&
          el.permissions.some(
            (perm) =>
              perm.machineryUID === selectedMachinery?.uid &&
              perm.machineryAccess
          )
      );

      const singlePermission = {
        userID: selectedUser!.id,
        machineryUID: selectedMachinery!.uid,
        machineryAccess: !disable,
        dashboardsWrite: !disable,
        dashboardsModify: !disable,
        dashboardsRead: !disable,
        documentsWrite: !disable,
        documentsModify: !disable,
        documentsRead: !disable,
      };

      await userService.updateUserPermissions(singlePermission);

      ToastHelper.makeToast(toast, "Permissions updated", "success");
    } catch (e) {
      console.log(e);
      axiosExceptionHandler.handleAxiosExceptionWithToast(
        e,
        toast,
        "Some permissions could not be updated"
      );
    }

    setFetchData(true);
  }

  function ArolUserCard() {
    return (
      <Box px={6} w={"full"} h={"full"}>
        <HStack
          px={12}
          pt={5}
          pb={3}
          w={"full"}
          h={"full"}
          borderWidth={2}
          borderColor={"teal.600"}
          bgColor={"white"}
          rounded={"md"}
          alignItems={"stretch"}
          columnGap={5}
        >
          <VStack w={"full"}>
            <HStack w={"full"}>
              <Avatar
                size={"md"}
                name={selectedUser?.name + " " + selectedUser?.surname}
              />
              <VStack
                justifyContent="flex-start"
                alignItems="flex-start"
                flexWrap={"nowrap"}
                w={"full"}
                h={"full"}
                pl={3}
              >
                <Heading
                  fontSize={"2xl"}
                  fontFamily={"body"}
                  fontWeight={550}
                  color={"black"}
                  whiteSpace={"nowrap"}
                >
                  {selectedUser?.name + " " + selectedUser?.surname}
                  {principal &&
                    selectedUser?.id.toString() === principal!!.id &&
                    " (You)"}
                  {selectedUser?.createdAt !== undefined &&
                    dayjs().diff(dayjs(+selectedUser?.createdAt), "day") <
                      7 && (
                      <Badge ml={2} colorScheme="purple">
                        New
                      </Badge>
                    )}
                </Heading>
                <Heading
                  fontSize={"md"}
                  fontFamily={"body"}
                  fontWeight={450}
                  color={"gray.500"}
                  whiteSpace={"nowrap"}
                  mb={"1!important"}
                >
                  {selectedUser?.email}
                </Heading>
              </VStack>
            </HStack>
            <Divider />
            <HStack w={"full"} justifyContent={"left"} alignItems={"stretch"}>
              <Box>
                <Text
                  fontWeight={300}
                  color={"gray.400"}
                  whiteSpace={"nowrap"}
                  fontSize={"sm"}
                >
                  Account status
                </Text>
                <Text
                  color={selectedUser?.accountActive ? "teal" : "red"}
                  fontWeight={500}
                  whiteSpace={"nowrap"}
                  mt={"0!important"}
                  mb={4}
                >
                  {selectedUser?.accountActive ? "ACTIVE" : "DISABLED"}
                </Text>
              </Box>

              <Divider orientation={"vertical"} h={"auto"} />
              <Box>
                <Text
                  fontWeight={300}
                  color={"gray.400"}
                  whiteSpace={"nowrap"}
                  fontSize={"sm"}
                >
                  User Roles
                </Text>
                <Text
                  color={"black"}
                  fontSize="md"
                  fontWeight={400}
                  whiteSpace={"nowrap"}
                  mt={"0!important"}
                  mb={4}
                >
                  {roleTranslator.translateRoles(
                    selectedUser ? selectedUser!.roles : []
                  )}
                </Text>
              </Box>
            </HStack>
          </VStack>
          <VStack h={"full"} alignItems={"center"} spacing={6}>
            <Tooltip
              label={
                !hasPermissions
                  ? PermissionChecker.getRoleRank(principal?.roles) <=
                    PermissionChecker.getRoleRank(selectedUser?.roles)
                    ? "You can not modify permissions of users with the same or higher role than yours"
                    : "You have no permissions on this machinery"
                  : "You can not modify your own permissions"
              }
              fontSize="md"
              placement="top-end"
              rounded="md"
              isDisabled={hasPermissions}
            >
              <Button
                leftIcon={<FiEdit3 />}
                colorScheme={
                  permissionButtonMode === "enable" ? "green" : "red"
                }
                onClick={() => handleAccessModified()}
                p={2}
                minWidth={40}
                minHeight={10}
                isDisabled={
                  selectedUser?.id.toString() === principal?.id ||
                  !hasPermissions
                }
              >
                {permissionButtonMode === "enable"
                  ? "Give access"
                  : "Remove access"}
              </Button>
            </Tooltip>
            <Box
              p={2}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1}
              borderWidth={2}
              borderColor={"gray.200"}
              bgColor={"white"}
              rounded={"md"}
              width={100}
              height={90}
            >
              <Text fontSize="md" color="gray.700" fontWeight="bold">
                Status:
              </Text>
              <Tooltip
                label={
                  permissionButtonMode === "enable"
                    ? "This user has no permissions for the selected machinery"
                    : "This user has all permissions for the selected machinery"
                }
                fontSize="md"
                placement="top-end"
                rounded="md"
              >
                <span>
                  {permissionButtonMode === "enable" ? (
                    <FcCancel size={40} />
                  ) : (
                    <FcOk size={40} />
                  )}
                </span>
              </Tooltip>
            </Box>
          </VStack>
        </HStack>
      </Box>
    );
  }

  function SelectForm() {
    return (
      <Box pb={1} h="full">
        <VStack alignItems="flex-start">
          <HStack pt={3} spacing={12}>
            <VStack>
              <Text fontSize="md" color="gray.700" mb={2} fontWeight="bold">
                <GiMechanicalArm size={50} />
              </Text>
              <Select
                w="250px"
                value={
                  selectedMachinery &&
                  `${selectedMachinery.uid} - ${selectedMachinery.modelName}`
                }
                onChange={(event) =>
                  setSelectedMachinery(
                    machineries?.find(
                      (machinery) =>
                        `${machinery.uid} - ${machinery.modelName}` ===
                        event.target.value
                    )
                  )
                }
              >
                {machineries
                  ?.sort((a, b) => {
                    const companyA =
                      companies.find((c: Company) => c.id === a.companyID)
                        ?.name || "";
                    const companyB =
                      companies.find((c: Company) => c.id === b.companyID)
                        ?.name || "";
                    return companyA.localeCompare(companyB);
                  })
                  .map((machinery) =>
                    PermissionChecker.hasMachineryAccess(
                      principal,
                      machinery.uid
                    ) ? (
                      <option
                        key={machinery.uid}
                        value={`${machinery.uid} - ${machinery.modelName}`}
                      >
                        {
                          companies.find(
                            (c: Company) => c.id === machinery?.companyID
                          )?.name
                        }{" "}
                        - {machinery.uid}
                      </option>
                    ) : null
                  )}
              </Select>
            </VStack>
            <VStack>
              <Text fontSize="md" color="gray.700" mb={2} fontWeight="bold">
                <BiSolidUser size={50} />
              </Text>
              <Select
                w="250px"
                value={`${selectedUser?.name} ${selectedUser?.surname}`}
                onChange={(event) =>
                  setSelectedUser(
                    usersResult?.find(
                      (user) =>
                        `${user.name} ${user.surname}` === event.target.value
                    )
                  )
                }
              >
                {usersResult?.map(({ id, name, surname }) => (
                  <option key={id} value={`${name} ${surname}`}>
                    {`${name} ${surname}`}
                  </option>
                ))}
              </Select>
            </VStack>
          </HStack>
        </VStack>
      </Box>
    );
  }

  function MachineryCard() {
    return (
      <Box
        px={6}
        py={6}
        borderWidth={2}
        borderColor="teal.600"
        bgColor="white"
        rounded="md"
        boxSize="420px"
      >
        <VStack px={12} w="full" h="full" justifyContent="space-between">
          <Text fontSize="lg" color="gray.700">
            {selectedMachinery?.uid}&nbsp;-&nbsp;
            {Number(selectedMachinery?.companyID) === 0 ? (
              <Badge mb={1} colorScheme="orange">
                AROL
              </Badge>
            ) : (
              <Badge mb={1} colorScheme="green">
                {
                  companies.find(
                    (c: Company) => c.id === selectedMachinery?.companyID
                  )?.name
                }
              </Badge>
            )}
          </Text>
          <VStack overflowY={"auto"}>
            <Box boxSize="180px" margin="15px">
              {selectedMachinery && (
                <Image
                  src={require("./../../assets/machineries/" +
                    selectedMachinery.modelID +
                    ".png")}
                />
              )}
            </Box>
          </VStack>
          <VStack>
            <Text fontSize="lg" color="gray.700">
              {selectedMachinery?.modelName}
            </Text>
            <Text fontSize="sm" color="gray.700">
              {selectedMachinery?.numHeads} heads
            </Text>
            <Text fontSize="sm" color="gray.500">
              {selectedMachinery?.modelType}
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  function ArolPermissionPanel() {
    return (
      <HStack
        p={8}
        w="full"
        h="full"
        borderWidth={1}
        borderColor="grey.200"
        bgColor="white"
        rounded="md"
        divider={<StackDivider borderColor="gray.300" />}
        spacing={12}
      >
        <MachineryCard />
        <VStack w="full" h="full" spacing={12}>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="gray.700"
            mb={4}
            alignSelf="flex-start"
          >
            Select Machinery and User
          </Text>
          <SelectForm />
          <Divider borderColor="gray.300" />
          <ArolUserCard />
        </VStack>
      </HStack>
    );
  }

  function AllMachineriesPermission() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    async function giveAllPermissions() {
      if (selectedUser?.id.toString() === principal?.id)
        return ToastHelper.makeToast(
          toast,
          "You can't change your own permissions",
          "warning"
        );

      if (!PermissionChecker.isArolSupervisorOrAbove(principal))
        return ToastHelper.makeToast(
          toast,
          "You don't have the required permissions",
          "warning"
        );

      try {
        const companyMachinery: Map<string, Machinery[]> =
          await machineryService.getMachineriesByCompanyID(
            selectedMachinery?.companyID!
          );
        const updatePromises: Promise<void>[] = Array.from(
          companyMachinery.values()
        ).flatMap((machineryArr) =>
          machineryArr
            .filter((machinery) =>
              PermissionChecker.hasMachineryAccess(principal, machinery.uid)
            )
            .map((machinery) =>
              userService.updateUserPermissions({
                userID: Number(selectedUser?.id),
                machineryUID: machinery.uid,
                machineryAccess: true,
                dashboardsWrite: true,
                dashboardsModify: true,
                dashboardsRead: true,
                documentsWrite: true,
                documentsModify: true,
                documentsRead: true,
              })
            )
        );

        await Promise.all(updatePromises);

        ToastHelper.makeToast(toast, "Permissions updated", "success");
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          "Some permissions could not be updated"
        );
      }
      setFetchData(true);
    }

    return (
      <>
        <Button
          w="250px"
          colorScheme="blue"
          onClick={onOpen}
          isDisabled={
            selectedUser?.id.toString() === principal?.id || !hasPermissions
          }
          leftIcon={<MdSettings size={25} />}
        >
          Manage machineries
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Attention</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Do you want to give&nbsp;
              <b>
                {selectedUser?.name} {selectedUser?.surname}
              </b>
              &nbsp;access to&nbsp;
              {principal?.roles.includes("AROL_ROLE_CHIEF") ? (
                <>
                  all machineries of&nbsp;
                  <b>
                    {companies?.find(
                      (c) => c.id === selectedMachinery?.companyID
                    )?.name ?? "AROL"}
                  </b>
                  ?
                </>
              ) : (
                <>
                  the following machineries of&nbsp;
                  <b>
                    {companies?.find(
                      (c) => c.id === selectedMachinery?.companyID
                    )?.name ?? "AROL"}
                  </b>
                  ?
                  <Box overflowY="auto" maxH="150px">
                    <List spacing={2}>
                      {machineries
                        ?.filter(
                          (m) =>
                            m.companyID === selectedMachinery?.companyID &&
                            PermissionChecker.hasMachineryAccess(
                              principal,
                              m.uid
                            )
                        )
                        .map((m, index) => (
                          <ListItem key={index}>
                            <ListIcon as={MdSettings} color="green.500" />
                            {m.uid}
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="gray" mr={4} onClick={onClose}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => giveAllPermissions()}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
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
        >
          <HStack w={"full"} justifyContent={"space-between"}>
            <Text>Looking to create a new machinery?</Text>
            <MachineryForm
              setFetchData={setFetchData}
              operationType="create"
              machinery={{
                uid: "",
                companyID: selectedMachinery?.companyID!,
                modelID: "",
                modelName: "",
                modelType: "",
                geoLocation: { x: Number(""), y: Number("") },
                locationCluster: "",
                numHeads: Number(""),
              }}
            />
          </HStack>
          {machineries.length > 0 && (
            <>
              <Divider />
              <HStack w={"full"} justifyContent={"space-between"}>
                <Text>
                  Do you want to manage all&nbsp;
                  {companies?.find(
                    (c: Company) => c.id === selectedMachinery?.companyID
                  )?.name ?? "AROL"}
                  &nbsp;machineries?
                </Text>
                <AllMachineriesPermission />
              </HStack>
            </>
          )}
        </VStack>
        {isLoading ? (
          <VStack
            w={"full"}
            h={"300px"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Spinner size={"xl"} />
          </VStack>
        ) : machineries.length > 0 ? (
          <>
            <HStack w={"full"}>
              <Alert status="info" variant={"left-accent"} rounded={"md"}>
                <AlertIcon />
                <AlertTitle>Important information:</AlertTitle>
                Only machineries to which you have access are listed.
              </Alert>
            </HStack>
            <ArolPermissionPanel />
          </>
        ) : (
          <Text pt={5} w={"300px"} textAlign="center">
            You have no permission on any machineries. Create a new one or ask
            an AROL Chief.
          </Text>
        )}
      </VStack>
    </>
  );
}
