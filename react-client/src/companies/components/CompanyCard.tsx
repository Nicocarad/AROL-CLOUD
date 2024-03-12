import {
  Avatar,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  VStack,
  Text,
  useDisclosure,
  AlertDialog,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogHeader,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import React, { useContext, useRef } from "react";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import { FiEdit3 } from "react-icons/fi";
import { FiXCircle } from "react-icons/fi";
import helperFunctions from "../../utils/HelperFunctions";
import Company from "../interfaces/Company";
import { useNavigate } from "react-router-dom";
import { CgEnter } from "react-icons/cg";
import ToastContext from "../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import companyService from "../../services/CompanyService";
import machineryService from "../../services/MachineryService";

interface CompanyCardProps {
  company: Company;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  highlightTerm: string;
  type: string;
  numEmployees: number;
  numMachineries: number;
}

function DeleteCompanyButton(props: {
  company: Company;
  setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  numMachineries: number;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const toast = useContext(ToastContext);

  //1 - DELETE ALL MODE
  //2 - AROL REASSIGN MODE
  const [mode, setMode] = React.useState<string>("1");

  async function handleDeleteButtonClicked() {
    try {
      switch (mode) {
        case "1":
          await machineryService.deleteAllMachineries(props.company.id);
          break;
        case "2":
          await machineryService.reassignMachineriesToAROL(props.company.id);
          break;
        default:
          ToastHelper.makeToast(toast, "Invalid deletion mode", "warning");
          return;
      }

      await companyService.deleteCompany(props.company.id);

      ToastHelper.makeToast(toast, "Company deleted", "success");
      props.setUpdate(true);
      onClose();
    } catch (e) {
      console.log(e);
      axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Company cannot be deleted");
    }
  }

  return (
    <>
      <Button
        leftIcon={<FiXCircle />}
        w="185px"
        colorScheme={"red"}
        loadingText={"Delete company"}
        onClick={onOpen}
        isDisabled={Number(props.company.id) === 0 ? true : false}
      >
        Delete company
      </Button>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete company
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete company:
              <Box
                pl={5}
                pr={5}
                pt={2}
                pb={2}
                mt={4}
                mb={4}
                border={"2px"}
                w="300px"
                rounded={10}
                borderStyle={"teil.400"}
              >
                <Box>
                  <Flex direction="row" gap={2}>
                    <Text>Name:</Text>
                    <Text fontWeight={"medium"}>{props.company.name}</Text>
                  </Flex>
                </Box>
                <Box>
                  <Flex direction="row" gap={2}>
                    <Text>City:</Text>
                    <Text fontWeight={"medium"}>{props.company.city}</Text>
                  </Flex>
                </Box>
              </Box>
              You can't undo this action afterwards.
              {props.numMachineries > 0 && (
                <>
                  <Divider mt={4} mb={4} />
                  <Text mt={4} mb={3} fontWeight={"bold"}>
                    Choose Modality
                  </Text>
                  <DeleteModality value={mode} setValue={setMode} />
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={() => handleDeleteButtonClicked()}>
                Delete company
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

interface DeleteModalityProps {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

function DeleteModality(props: DeleteModalityProps) {
  const radios = [
    {
      value: "1",
      label: "Delete Company and all its machineries",
    },
    {
      value: "2",
      label: "Delete Company and assign all machineries to AROL",
    },
  ];

  return (
    <RadioGroup onChange={props.setValue} value={props.value.toString()}>
      <Box as="label">
        <VStack>
          <Flex direction="column" gap={4}>
            {radios.map((radio) => (
              <Radio
                key={radio.value}
                value={radio.value.toString()}
                variant="solid"
                borderRadius="md"
                _checked={{
                  bg: "teal.600",
                  color: "white",
                  borderColor: "teal.600",
                }}
                _focus={{
                  boxShadow: "outline",
                }}
              >
                {radio.label}
              </Radio>
            ))}
          </Flex>
        </VStack>
      </Box>
    </RadioGroup>
  );
}

function ModifyCompanyButton(props: { company: Company; setUpdate: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = React.useState(props.company.name);
  const [city, setCity] = React.useState(props.company.city);
  const [isLoading, setIsLoading] = React.useState(false);
  const toast = useContext(ToastContext);

  async function handleSubmitButtonClicked() {
    try {
      // MODIFY COMPANY
      setIsLoading(true);
      const requestData: Company = {
        id: props.company.id,
        name: name,
        city: city,
        active: props.company.active, //needed to complete Company interface
      };

      await companyService.updateCompany(requestData);

      ToastHelper.makeToast(toast, "Company updated successfully", "success");
      props.setUpdate(true);
      onClose();
    } catch (e) {
      console.log(e);
      axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Error while updating company");
    }
    onClose();
    setIsLoading(false);
    return;
  }

  return (
    <>
      <Button
        leftIcon={<FiEdit3 />}
        w="185px"
        colorScheme={"teal"}
        loadingText={"Modify company"}
        isDisabled={Number(props.company.id) === 0 ? true : false}
        onClick={onOpen}
      >
        Modify Company
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} trapFocus={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modify Company</ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="Company name" isRequired>
                <FormLabel>Company Name</FormLabel>
                <Input
                  w="full"
                  type="text"
                  defaultValue={props.company.name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </FormControl>

              <FormControl id="Model" isRequired={true}>
                <FormLabel>City</FormLabel>
                <Input
                  w="full"
                  type="text"
                  defaultValue={props.company.city}
                  onChange={(e) => {
                    setCity(e.target.value);
                  }}
                ></Input>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={4} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="blue"
              pr={8}
              pl={8}
              onClick={handleSubmitButtonClicked}
              isLoading={isLoading}
              loadingText={"Modifying Company"}
            >
              Modify Company
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function CompanyCard(props: CompanyCardProps) {
  const { principal } = useContext(PrincipalContext);
  const navigate = useNavigate();

  const hoverStyle = {
    _hover: {
      boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
      transform: "translateY(-5px)",
      transition: "transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out",
    },
  };

  function handleManageCompanyClicked() {
    navigate("/companies/" + props.company.id, { state: props.type });
  }

  return (
    <HStack
      px={6}
      pt={6}
      pb={3}
      mt={1}
      w={"full"}
      h={"fit-content"}
      borderWidth={1}
      borderColor={"gray.200"}
      bgColor={"white"}
      rounded={"md"}
      alignItems={"center"}
      columnGap={5}
      {...hoverStyle}
    >
      <VStack w={"full"}>
        <HStack w={"full"}>
          <Avatar size={"md"} name={props.company.name} />
          <VStack justifyContent="flex-start" alignItems="flex-start" flexWrap={"nowrap"} w={"full"} h={"full"} pl={3}>
            <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={550} color={"black"} whiteSpace={"nowrap"}>
              {helperFunctions.highlightText(props.company.name, 550, props.highlightTerm)}
              {principal && props.company.id.toString() === principal!!.companyID?.toString() && " (You)"}
            </Heading>
          </VStack>
        </HStack>
        <Divider pt={2} />
        <HStack w={"full"} justifyContent={"left"} alignItems={"stretch"}>
          <Box>
            <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
              # employees
            </Text>
            <Text fontWeight={500} whiteSpace={"nowrap"} mt={"0!important"} mb={4}>
              {props.numEmployees}
            </Text>
          </Box>
          <Divider orientation={"vertical"} h={"auto"} />
          <Box>
            <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
              # machineries
            </Text>
            <Text fontWeight={500} whiteSpace={"nowrap"} mt={"0!important"} mb={4}>
              {props.numMachineries}
            </Text>
          </Box>
          <Divider orientation={"vertical"} h={"auto"} />
          <Box>
            <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
              City
            </Text>
            <Text color={"black"} fontSize="md" fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"} mb={4}>
              {helperFunctions.highlightText(props.company.city, 500, props.highlightTerm)}
            </Text>
          </Box>
        </HStack>
      </VStack>

      <VStack h={"full"} pb={1}>
        <Button
          leftIcon={<CgEnter />}
          w={"185px"}
          colorScheme={"blue"}
          onClick={() => handleManageCompanyClicked()}
          loadingText={"Manage Company"}
        >
          Access Company
        </Button>
        {props.type === "company_management" && (
          <>
            <ModifyCompanyButton company={props.company} setUpdate={props.setUpdate} />
            <DeleteCompanyButton
              company={props.company}
              setUpdate={props.setUpdate}
              numMachineries={props.numMachineries}
            />
          </>
        )}
      </VStack>
    </HStack>
  );
}
