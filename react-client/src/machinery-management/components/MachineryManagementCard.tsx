import { useState, Fragment, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { FiSearch, FiFileText, FiGrid } from "react-icons/fi";
import {
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  Text,
  VStack,
  Badge,
  Flex,
  Box,
  useDisclosure,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialog,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
} from "@chakra-ui/react";
import { FaRegTrashCan } from "react-icons/fa6";
import { AiOutlineMenu } from "react-icons/ai";
import { MdOutlineMenu } from "react-icons/md";
import MachineryWithDashsAndDocs from "../interfaces/MachineryWithDashsAndDocs";
import MachineryForm from "./MachineryForm";
import machineryService from "../../services/MachineryService";
import HelperFunctions from "../../utils/HelperFunctions";
import ToastHelper from "../../utils/ToastHelper";
import ToastContext from "../../utils/contexts/ToastContext";
import AxiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import PermissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import { TbPhotoSensor3 } from "react-icons/tb";

interface DeleteMachineryProps {
  uid: string;
  handleBackClicked?: (arg0: string) => void;
  setFetchData: React.Dispatch<React.SetStateAction<boolean>>;
}

function DeleteMachinery(props: DeleteMachineryProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { principal } = useContext(PrincipalContext);
  const cancelRef = useRef(null);
  const toast = useContext(ToastContext);
  const [submit, setSubmit] = useState<boolean>(false);

  async function handleDelete() {
    setSubmit(true);
    try {
      if (PermissionChecker.hasMachineryAccess(principal, props.uid)) {
        await machineryService.deleteMachineryByUID(props.uid);
        ToastHelper.makeToast(toast, "Machinery deleted successfully", "success");
      } else ToastHelper.makeToast(toast, "Insufficient permissions on machinery", "warning");
      props.handleBackClicked?.("");
    } catch (e) {
      console.log(e);
      AxiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Error while deleting machinery");
    }
    props.setFetchData(true);
    setSubmit(false);
    onClose();
  }

  return (
    <>
      <MenuItem icon={<FaRegTrashCan />} onClick={onOpen}>
        Delete Machinery
      </MenuItem>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Machinery
            </AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              Are you sure to delete machinery <b>{props.uid}</b>? This will delete all associated data and you can't
              undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={null} onClick={onClose}>
                Cancel
              </Button>

              <Button
                colorScheme="red"
                ml={3}
                onClick={handleDelete}
                isLoading={submit}
                loadingText={"Deleting Machinery"}
              >
                Delete Machinery
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

interface MachineryManagementCardProps {
  machinery: MachineryWithDashsAndDocs;
  highlightTerm: string;
  openPopoverId: string | null;
  companyID: number;
  companyName: string;
  setFetchData: React.Dispatch<React.SetStateAction<boolean>>;
  openIndex: any;
}

export default function MachineryManagementCard(props: MachineryManagementCardProps) {
  const navigate = useNavigate();
  const { principal } = useContext(PrincipalContext);

  const hasMachineryAccess = PermissionChecker.hasMachineryAccess(principal, props.machinery.uid);

  const [isOpen, setIsOpen] = useState(false);

  function getFilePath(inputFilePath: string) {
    const startIndex = inputFilePath.indexOf(props.machinery.uid);

    return inputFilePath.slice(startIndex + props.machinery.uid.length).toString();
  }

  // const hoverStyle = {
  //   _hover: {
  //     boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
  //     transform: "translateY(-5px)",
  //     transition: "transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out",
  //   },
  // };

  return (
    <VStack
      p={6}
      w={"full"}
      borderWidth={1}
      borderColor={"gray.200"}
      bgColor={"white"}
      rounded={"md"}
      // {...(!props.openPopoverId ? hoverStyle : {})}
    >
      <HStack w={"full"} h={"220px"} mb={3}>
        <HStack minW={"220px"} maxW={"220px"} justifyContent={"center"}>
          <Image
            boxSize={"220px"}
            objectFit="contain"
            src={require("./../../assets/machineries/" + props.machinery.modelID + ".png")}
          />
        </HStack>
        <Divider orientation={"vertical"} h={"full"} />

        <VStack justifyContent="flex-start" alignItems="flex-start" flexWrap={"nowrap"} w={"full"} h={"full"} pl={2}>
          <Heading fontSize={"md"} fontFamily={"body"} fontWeight={450} color={"gray.400"} whiteSpace={"nowrap"}>
            {HelperFunctions.highlightText(props.machinery.uid, 450, props.highlightTerm)}
          </Heading>
          <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={550} whiteSpace={"nowrap"} mb={"4!important"}>
            {HelperFunctions.highlightText(props.machinery.modelName, 550, props.highlightTerm)}
          </Heading>
          <Flex direction={"column"} gap={3}>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Machinery type
              </Text>
              <Text color={"black"} fontSize="md" fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(props.machinery.modelType, 400, props.highlightTerm)}
              </Text>
            </Box>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Number of Heads
              </Text>
              <Text color={"black"} fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(props.machinery.numHeads.toString(), 400, props.highlightTerm)}
              </Text>
            </Box>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Machinery location
              </Text>
              <Text color={"black"} fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(props.machinery.locationCluster, 400, props.highlightTerm)}
              </Text>
            </Box>
          </Flex>
        </VStack>

        {hasMachineryAccess && (
          <VStack w="full" h="full" justifyContent={"flex-start"} alignItems={"end"}>
            <Menu size="xl" isOpen={isOpen} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)}>
              <MenuButton
                w={"250px"}
                as={Button}
                leftIcon={isOpen ? <AiOutlineMenu size={"20px"} /> : <MdOutlineMenu size={"20px"} />}
              >
                Machinery Menu
              </MenuButton>
              <MenuList>
                <MenuGroup title="Edit">
                  {PermissionChecker.isArolSupervisorOrAbove(principal) && (
                    <>
                      <MachineryForm
                        operationType="modify"
                        machinery={{
                          uid: props.machinery.uid,
                          companyID: props.machinery.companyID,
                          modelID: props.machinery.modelID,
                          modelName: props.machinery.modelName,
                          modelType: props.machinery.modelType,
                          geoLocation: props.machinery.geoLocation,
                          locationCluster: props.machinery.locationCluster,
                          numHeads: props.machinery.numHeads,
                        }}
                        setFetchData={props.setFetchData}
                      />
                      <DeleteMachinery uid={props.machinery.uid} setFetchData={props.setFetchData} />
                    </>
                  )}
                  <MenuItem
                    icon={<TbPhotoSensor3 />}
                    onClick={() =>
                      navigate("/machinery/" + props.machinery.uid + "/sensors", {
                        state: {
                          companyID: props.companyID,
                          companyName: props.companyName,
                          machinery: { ...props.machinery },
                          dashboardName: null,
                        },
                      })
                    }
                  >
                    Manage Sensors
                  </MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Contents">
                  <MenuItem
                    icon={<FiGrid />}
                    isDisabled={props.companyID === 0}
                    onClick={() => {
                      if (props.companyID !== 0) {
                        navigate("/machinery/" + props.machinery.uid + "/dashboard", {
                          state: {
                            companyID: props.companyID,
                            companyName: props.companyName,
                            machinery: { ...props.machinery },
                            dashboardName: null,
                          },
                        });
                      }
                    }}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem
                    icon={<FiFileText />}
                    onClick={() =>
                      navigate("/machinery/" + props.machinery.uid + "/documents", {
                        state: {
                          companyID: props.companyID,
                          companyName: props.companyName,
                          machinery: { ...props.machinery },
                          dashboardName: null,
                        },
                      })
                    }
                  >
                    Documents
                  </MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>
          </VStack>
        )}
      </HStack>

      {hasMachineryAccess ? (
        <HStack w={"full"} justifyContent={"space-between"} mt={5}>
          <Accordion w={"full"} allowMultiple index={props.openIndex}>
            {props.companyID !== 0 && (
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box as="span" flex="1" textAlign="left" rounded={"md"}>
                      <Flex alignItems={"center"} gap={2}>
                        <Box position="relative" display="inline-block">
                          <FiGrid size={22} />
                          {props.machinery.dashboards.length !== 0 && (
                            <Badge
                              colorScheme="blue"
                              w={"20px"}
                              h={"20px"}
                              borderRadius="full"
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              position="absolute"
                              top={-2}
                              left={-2}
                            >
                              {props.machinery.dashboards.length}
                            </Badge>
                          )}
                        </Box>
                        <Text color="gray.600" fontWeight={"bold"}>
                          Available dashboards
                        </Text>
                      </Flex>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack w={"full"} maxH={"350px"} overflowY={"auto"} overflowX={"hidden"} p={3}>
                    {props.machinery.dashboards.length > 0 &&
                      props.machinery.dashboards.map((savedDashboard, index) => (
                        <Fragment key={savedDashboard.name}>
                          <HStack w={"full"} m={2}>
                            <VStack w={"full"} alignItems={"left"}>
                              {savedDashboard.isDefault && (
                                <Text fontSize={"xs"} fontWeight={600} color={"green"}>
                                  Default dashboard
                                </Text>
                              )}
                              <HStack alignItems={"baseline"} mt={"0!important"}>
                                <Text
                                  fontSize={"md"}
                                  fontWeight={500}
                                  mt={savedDashboard.isDefault ? "0!important" : ""}
                                >
                                  {HelperFunctions.highlightText(savedDashboard.name, 500, props.highlightTerm)}
                                </Text>
                                {dayjs().diff(dayjs(savedDashboard.timestamp), "day") < 7 && (
                                  <Badge colorScheme="purple">New</Badge>
                                )}
                              </HStack>
                              <HStack mt={"0!important"}>
                                <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                                  {savedDashboard.numSensorsMonitored} sensors monitored
                                </Text>
                                <Text fontSize={"xs"} color={"gray.500"} mt={"0!important"}>
                                  | {savedDashboard.numWidgets} widgets
                                </Text>
                              </HStack>
                              <Text fontSize={"xs"} color={"gray.500"} fontWeight={500}>
                                Saved on {dayjs(savedDashboard.timestamp).format("ddd, MMM D, YYYY H:mm")}
                              </Text>
                            </VStack>
                            <VStack>
                              <Button
                                leftIcon={<FiSearch />}
                                w={"full"}
                                colorScheme="blue"
                                variant="solid"
                                onClick={() =>
                                  navigate("/machinery/" + props.machinery.uid + "/dashboard", {
                                    state: {
                                      machinery: { ...props.machinery },
                                      dashboardName: savedDashboard.name,
                                      companyName: props.companyName,
                                    },
                                  })
                                }
                              >
                                Load dashboard
                              </Button>
                            </VStack>
                          </HStack>
                          {index < props.machinery.dashboards.length - 1 && <Divider />}
                        </Fragment>
                      ))}
                  </VStack>
                  {props.machinery.dashboards.length === 0 && (
                    <HStack w={"full"} justifyContent={"center"}>
                      <Text pt={3} fontSize={"sm"} fontWeight={500}>
                        This machinery has no saved dashboards
                      </Text>
                    </HStack>
                  )}
                </AccordionPanel>
              </AccordionItem>
            )}
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <Flex alignItems={"center"} gap={2}>
                      <Box position="relative" display="inline-block">
                        <FiFileText size={22} />{" "}
                        {props.machinery.documents.length !== 0 && (
                          <Badge
                            colorScheme="teal"
                            w={"20px"}
                            h={"20px"}
                            borderRadius="full"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            position="absolute"
                            top={-2}
                            left={-2}
                          >
                            {props.machinery.documents.length}
                          </Badge>
                        )}
                      </Box>
                      <Text color="gray.600" fontWeight={"bold"}>
                        Available documents
                      </Text>
                    </Flex>
                  </Box>

                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack w={"full"} maxH={"350px"} overflowY={"auto"} overflowX={"hidden"} p={3}>
                  {props.machinery.documents.length > 0 &&
                    props.machinery.documents.map((document, index) => (
                      <Fragment key={document.id}>
                        <HStack w={"full"} m={2}>
                          <VStack w={"full"} alignItems={"left"}>
                            <VStack w={"full"} alignItems={"left"}>
                              <HStack alignItems={"baseline"} mt={"0!important"}>
                                <Text fontSize={"md"} fontWeight={500}>
                                  {HelperFunctions.highlightText(document.name, 500, props.highlightTerm)}
                                </Text>
                                <Text fontSize={"xs"} color={"gray.500"} fontWeight={500}>
                                  {HelperFunctions.formatFileSize(document.size)}
                                </Text>
                              </HStack>
                              <Badge color="green" w={"fit-content"}>
                                Public
                              </Badge>
                            </VStack>
                            <Text fontSize={"xs"} color={"gray.500"} fontWeight={500} mt={"0!important"}>
                              {getFilePath(document.parentId)}
                            </Text>
                          </VStack>

                          <VStack>
                            <Button
                              leftIcon={<FiSearch />}
                              w={"full"}
                              colorScheme="teal"
                              variant="solid"
                              onClick={() =>
                                document.documentUID &&
                                navigate(
                                  "/machinery/" +
                                    props.machinery.uid +
                                    "/documents/" +
                                    document.documentUID.split("\\").pop(),
                                  {
                                    state: {
                                      document: document,
                                      machinery: props.machinery,
                                      companyName: props.companyName,
                                    },
                                  },
                                )
                              }
                            >
                              View document
                            </Button>
                          </VStack>
                        </HStack>
                        {index < props.machinery.documents.length - 1 && <Divider />}
                      </Fragment>
                    ))}
                </VStack>
                {props.machinery.documents.length === 0 && (
                  <HStack w={"full"} justifyContent={"center"}>
                    <Text pt={3} fontSize={"sm"} fontWeight={500}>
                      This machinery has no stored documents
                    </Text>
                  </HStack>
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </HStack>
      ) : (
        <Text pt={5} fontWeight={"bold"} fontSize={"15px"} color="red.600">
          You don't have any permissions on this machinery
        </Text>
      )}
    </VStack>
  );
}
