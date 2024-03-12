import { useCallback, useState, useEffect, useContext } from "react";
import {
  Tooltip,
  Button,
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  VStack,
  MenuItem,
} from "@chakra-ui/react";
import Machinery from "../interfaces/Machinery";
import Company from "../../companies/interfaces/Company";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastContext from "../../utils/contexts/ToastContext";
import companyService from "../../services/CompanyService";
import machineryService from "../../services/MachineryService";
import ToastHelper from "../../utils/ToastHelper";
import { GiMechanicalArm } from "react-icons/gi";
import { FiEdit3 } from "react-icons/fi";
import PermissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import UserPermissions from "../../authentication/interfaces/UserPermissons";
import userService from "../../services/UserService";

interface MachineryModel {
  modelID: string;
  modelName: string;
  modelType: string;
}

interface MachineryFormProps {
  setFetchData: React.Dispatch<React.SetStateAction<boolean>>; // if called from machineries management
  operationType: string;
  machinery: Machinery;
  hasDashboardPermission?: boolean;
}

function MachineryForm(props: MachineryFormProps) {
  const isEdit = props.operationType === "modify";

  const toast = useContext(ToastContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { principal } = useContext(PrincipalContext);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [machineryModels, setMachineryModels] = useState<MachineryModel[]>([]);

  const [submit, setSubmit] = useState<boolean>(false);

  const [uid, setUid] = useState<string>(isEdit ? props.machinery.uid : "");
  const [selectedModelID, setSelectedModelID] = useState<string>(isEdit ? props.machinery.modelID : "");
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const [geoLocation, setGeoLocation] = useState<{ latitude: number | null; longitude: number | null }>(
    isEdit
      ? {
          latitude: props.machinery.geoLocation ? props.machinery.geoLocation.x : null,
          longitude: props.machinery.geoLocation ? props.machinery.geoLocation.y : null,
        }
      : { latitude: null, longitude: null },
  );
  const [locality, setLocality] = useState<string>(isEdit ? props.machinery.locationCluster : "");
  const [heads, setHeads] = useState<number>(isEdit ? props.machinery.numHeads : 0);

  // Update the principal object with the new permissions
  async function updatePrincipal() {
    const userPermissionsArray = await userService.getAllUserPermissions(parseInt(principal!.id));
    if (!userPermissionsArray) {
      ToastHelper.makeToast(toast, "Error while retriving user permissions", "warning");
      return false;
    }

    let userPermissionsObject: UserPermissions = {};
    userPermissionsArray.forEach((permissions) => {
      userPermissionsObject[permissions.machineryUID] = {
        dashboardsWrite: permissions.dashboardsWrite,
        dashboardsModify: permissions.dashboardsModify,
        dashboardsRead: permissions.dashboardsRead,
        documentsWrite: permissions.documentsWrite,
        documentsModify: permissions.documentsModify,
        documentsRead: permissions.documentsRead,
      };
    });

    principal!.permissions = userPermissionsObject;

    return true;
  }

  // Submit the form
  async function handleSubmitButtonClicked() {
    if (isEdit && !PermissionChecker.hasMachineryAccess(principal, props.machinery.uid))
      return ToastHelper.makeToast(toast, "You don't have access to this machinery", "warning");
    if (isFormValid()) {
      try {
        if (isEdit) {
          const requestData = {
            uid: props.machinery.uid,
            companyID: selectedCompany,
            modelID: selectedModelID,
            geoLocation: {
              x: geoLocation.latitude!,
              y: geoLocation.longitude!,
            },
            locationCluster: locality,
            numHeads: heads!,
          };

          const result = await machineryService.modifyMachinery(requestData);

          props.setFetchData(true);
          if (result) ToastHelper.makeToast(toast, "Machinery updated successfully", "success");
        } else {
          await machineryService.insertMachinery({
            uid: uid,
            modelID: selectedModelID,
            companyID: selectedCompany,
            geoLocation: {
              x: geoLocation.latitude!,
              y: geoLocation.longitude!,
            },
            locationCluster: locality,
            numHeads: heads!,
          });

          const principalUpdateResult = await updatePrincipal();
          if (!principalUpdateResult)
            ToastHelper.makeToast(toast, "Please manually logout to see the updated machineries list", "info");
          props.setFetchData(true);
          ToastHelper.makeToast(toast, "Machinery created successfully", "success");
        }

        setSubmit(false);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          isEdit ? "Error while modifying machinery" : "Error while creating new machinery",
        );
        setSubmit(false);
      }
      onClose();
    } else {
      setSubmit(false);
      ToastHelper.makeToast(toast, "Invalid form fields", "warning");
    }
    return;
  }

  // Retrieve companies and machinery models on component mount
  useEffect(() => {
    async function retriveCompaniesAndMachineryModels() {
      try {
        const companiesResult: Company[] = await companyService.getCompanies();
        setCompanies(companiesResult.filter((company) => Number(company.id) !== 0));
        if (companiesResult)
          setSelectedCompany(
            Number(props.machinery.companyID) === 0 ? companiesResult[1]?.id : props.machinery.companyID,
          ); //setting a default company option in the dropdown

        const machineriesArray: Machinery[] = Array.from((await machineryService.getAllMachineries()).values()).flat();
        const machineryModels: MachineryModel[] = machineriesArray.reduce(
          (acc: MachineryModel[], machinery: Machinery) => {
            const existingModel = acc.find((model) => model.modelID === machinery.modelID);
            if (!existingModel) {
              const newModel: MachineryModel = {
                modelID: machinery.modelID,
                modelName: machinery.modelName,
                modelType: machinery.modelType,
              };
              return [...acc, newModel];
            }
            return acc;
          },
          [],
        );
        // Set the retrieved machinery models
        setMachineryModels(machineryModels);
        // Set selected model ID if there are machinery models available
        if (machineryModels.length > 0) {
          setSelectedModelID(machineryModels[0]?.modelID);
        }
      } catch (e) {
        console.log(e);
      }
    }
    retriveCompaniesAndMachineryModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  const handleModelChange = (event: any) => {
    setSelectedModelID(event.target.value);
  };

  const handleCompanyChange = (event: any) => {
    setSelectedCompany(Number(event.target.value));
  };

  const setGeoLocationX = (value: number) => {
    setGeoLocation((prevGeoLocation) => ({
      ...prevGeoLocation,
      latitude: value,
    }));
  };

  const setGeoLocationY = (value: number) => {
    setGeoLocation((prevGeoLocation) => ({
      ...prevGeoLocation,
      longitude: value,
    }));
  };

  // Check if the form is valid
  const isFormValid = useCallback(() => {
    return (
      Boolean(uid.trim()) &&
      locality.trim() !== "" &&
      locality.trim() !== "unassigned" &&
      Boolean(geoLocation.latitude && geoLocation.longitude) &&
      heads !== 0
    );
  }, [uid, locality, geoLocation, heads]);

  // Get the disabled message
  const getDisabledMessage = () => {
    if (!isFormValid()) return "Please fill in all required fields";
    return ""; // No message if the form is valid
  };

  return (
    <>
      {isEdit ? (
        <MenuItem icon={<FiEdit3 />} onClick={onOpen}>
          Modify Machinery
        </MenuItem>
      ) : (
        <Button w="250px" leftIcon={<GiMechanicalArm size={30} />} colorScheme="blue" onClick={onOpen}>
          Create new machinery
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} trapFocus={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? "Modify Machinery" : "Create Machinery"}</ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack>
                <Box>
                  <FormControl id="UID" isRequired>
                    <FormLabel>Machinery UID</FormLabel>
                    <Input
                      w="180px"
                      type="text"
                      placeholder="XX000"
                      isDisabled={isEdit}
                      defaultValue={isEdit ? props.machinery.uid : ""}
                      onChange={(e) => {
                        isEdit ? setUid(props.machinery.uid) : setUid(e.target.value);
                      }}
                    />
                  </FormControl>
                </Box>

                <FormControl id="Model" isRequired={true}>
                  <FormLabel>Machinery Model</FormLabel>
                  <Select
                    w="210px"
                    isDisabled={isEdit}
                    onChange={handleModelChange}
                    defaultValue={isEdit ? props.machinery.modelID : ""}
                  >
                    {machineryModels.map(({ modelID, modelName }) => (
                      <option key={modelID} value={modelID}>
                        {modelName}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl id="Company" isRequired>
                <FormLabel>Company</FormLabel>

                <Select onChange={(event) => handleCompanyChange(event)} value={selectedCompany}>
                  {companies.map(({ id, name }) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl id="Locality" isRequired>
                <FormLabel>Locality</FormLabel>
                <Input
                  type="text"
                  placeholder="Mirafiori Sud, Torino"
                  defaultValue={
                    isEdit
                      ? props.machinery.locationCluster === "unassigned"
                        ? ""
                        : props.machinery.locationCluster
                      : ""
                  }
                  onChange={(e) => {
                    setLocality(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl id="Geolocalization" isRequired>
                <FormLabel>Geolocalization</FormLabel>
                <Flex direction="row" gap={3}>
                  <Input
                    type="number"
                    placeholder="Latitude"
                    defaultValue={
                      isEdit ? (props.machinery.geoLocation ? Number(props.machinery.geoLocation.x) : "") : ""
                    }
                    onChange={(e) => setGeoLocationX(Number(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Longitude"
                    defaultValue={
                      isEdit ? (props.machinery.geoLocation ? Number(props.machinery.geoLocation.y) : "") : ""
                    }
                    onChange={(e) => setGeoLocationY(Number(e.target.value))}
                  />
                </Flex>
              </FormControl>
              <FormControl id="Heads" isRequired>
                <FormLabel>Number of Heads</FormLabel>
                <Input
                  type="number"
                  placeholder="1"
                  defaultValue={isEdit ? props.machinery.numHeads : ""}
                  onChange={(e) => {
                    setHeads(Number(e.target.value));
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={4} onClick={onClose}>
              Close
            </Button>

            <Tooltip label={getDisabledMessage()} isDisabled={isFormValid()} placement="top" rounded="md">
              <Button
                colorScheme={"blue"}
                isLoading={submit}
                loadingText={props.operationType === "create" ? "Creating Machinery" : "Modifying Machine"}
                onClick={() => {
                  handleSubmitButtonClicked();
                  setSubmit(true);
                }}
                isDisabled={!isFormValid()}
              >
                {isEdit ? "Modify Machinery" : "Create Machinery"}
              </Button>
            </Tooltip>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default MachineryForm;
