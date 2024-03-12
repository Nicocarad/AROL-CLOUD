import React, { useCallback, useContext, useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/layout";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/modal";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
import { Tooltip } from "@chakra-ui/tooltip";
import Sensor from "../../dashboard/models/Sensor";
import machineryService from "../../../services/MachineryService";
import ToastHelper from "../../../utils/ToastHelper";
import AxiosExceptionHandler from "../../../utils/AxiosExceptionHandler";
import HelperFunctions from "../../../utils/HelperFunctions";
import PermissionChecker from "../../../utils/PermissionChecker";
import PrincipalContext from "../../../utils/contexts/PrincipalContext";

interface ManageSensorsProps {
  setFetch: React.Dispatch<React.SetStateAction<boolean>>;
  operationType: string;
  sensor: Sensor;
}

export default function ManageSensors(props: ManageSensorsProps) {
  const isEdit = props.operationType === "modify";

  const defaultName = isEdit ? props.sensor.name : "";
  const defaultDescription = isEdit ? props.sensor.description : "";
  const defaultCategory = isEdit ? props.sensor.category : "plc";
  const defaultType = isEdit ? props.sensor.type : "";
  const defaultBucketingType = isEdit ? props.sensor.bucketingType : "minority";
  const defaultUnit = isEdit ? props.sensor.unit : "";
  const defaultThresholdLow = isEdit ? props.sensor.thresholdLow?.toString() ?? "" : "";
  const defaultThresholdHigh = isEdit ? props.sensor.thresholdHigh?.toString() ?? "" : "";

  const { principal } = useContext(PrincipalContext);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>(defaultName);
  const [description, setDescription] = useState<string>(defaultDescription);
  const [category, setCategory] = useState<string>(defaultCategory);
  const [type, setType] = useState<string>(defaultType);
  const [bucketingType, setBucketingType] = useState<string>(defaultBucketingType);
  const [unit, setUnit] = useState<string>(defaultUnit);
  const [thresholdLow, setThresholdLow] = useState<string>(defaultThresholdLow);
  const [thresholdHigh, setThresholdHigh] = useState<string>(defaultThresholdHigh);

  const isFormValid = useCallback(() => {
    const parseNumberOrReturnNull = (value: string) => (value && !isNaN(parseFloat(value)) ? parseFloat(value) : null);

    const thresholdLowNumber = parseNumberOrReturnNull(thresholdLow);
    const thresholdHighNumber = parseNumberOrReturnNull(thresholdHigh);

    const lowIsLessThanHigh = () => {
      if (thresholdLowNumber !== null && thresholdHighNumber !== null) return thresholdLowNumber < thresholdHighNumber;
      return true;
    };

    const fields = [name, description, category, type, bucketingType, unit];
    return fields.every((field) => Boolean(field.trim())) && lowIsLessThanHigh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholdLow, thresholdHigh, name, description, category, type, bucketingType, unit]);

  // HANDLE CREATE/EDIT SENSOR BUTTON CLICK
  async function handleSensorButtonClicked() {
    if (!isFormValid()) return;
    if (!principal || !PermissionChecker.isArolSupervisorOrAbove(principal))
      return ToastHelper.makeToast(
        toast,
        "You do not have permission to" + (isEdit ? "edit" : "create") + "a sensor",
        "warning",
      );

    setIsLoading(true);

    const trimmedName = name.trim();
    const trimmedInternalName = HelperFunctions.toCamelCase(trimmedName);
    const trimmedDescription = description.trim();
    const trimmedUnit = unit.trim();
    const trimmedCategory = category.trim();
    const trimmedType = type.trim().toLowerCase();
    const trimmedBucketingType = bucketingType.trim().toLowerCase();
    const thresholdLowNumber = parseFloat(thresholdLow) || null;
    const thresholdHighNumber = parseFloat(thresholdHigh) || null;

    try {
      if (isEdit) {
        await machineryService.updateSensor(
          props.sensor.internalName,
          props.sensor.category,
          trimmedName,
          trimmedDescription,
          trimmedUnit,
          thresholdLowNumber,
          thresholdHighNumber,
          trimmedType,
          trimmedBucketingType,
        );
      } else {
        await machineryService.insertSensor({
          name: trimmedName,
          description: trimmedDescription,
          unit: trimmedUnit,
          thresholdLow: thresholdLowNumber,
          thresholdHigh: thresholdHighNumber,
          internalName: trimmedInternalName,
          category: trimmedCategory,
          type: trimmedType,
          bucketingType: trimmedBucketingType,
          imgFilename: "",
          imgPointerLocation: { x: "", y: "" },
        });
      }

      props.setFetch(true);
      setIsLoading(false);
      onClose();
      ToastHelper.makeToast(toast, "Sensor " + isEdit ? "updated" : "created", "success");
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      AxiosExceptionHandler.handleAxiosExceptionWithToast(
        e,
        toast,
        isEdit ? "Failed to edit sensor" : "Failed to create sensor",
      );
    }
  }

  // CLEAR FORM ON CLOSE
  useEffect(() => {
    if (!isOpen) {
      setName(defaultName);
      setDescription(defaultDescription);
      setUnit(defaultUnit);
      setThresholdLow(defaultThresholdLow);
      setThresholdHigh(defaultThresholdHigh);
      setCategory(defaultCategory);
      setType(defaultType);
      setBucketingType(defaultBucketingType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {isEdit ? (
        <Text
          pl={6}
          fontWeight={"bold"}
          color={"yellow.500"}
          fontSize={"13px"}
          onClick={onOpen}
          _hover={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Edit sensor
        </Text>
      ) : (
        <Button leftIcon={<IoMdAdd />} onClick={onOpen} w="250px" colorScheme="blue">
          Create a new sensor
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent w="500px">
          <ModalHeader> {isEdit ? "Edit" : "Create a new"} sensor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form>
              <VStack w={"full"} justifyContent={"left"} pt={3} pb={3}>
                <HStack w={"full"} mt={2} justifyContent={"center"}>
                  <VStack alignItems={"left"}>
                    <Flex direction={"column"} gap={4}>
                      <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input onChange={(e) => setName(e.target.value)} defaultValue={defaultName} />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Description</FormLabel>
                        <Input onChange={(e) => setDescription(e.target.value)} defaultValue={defaultDescription} />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onChange={(e) => setCategory(e.target.value)}
                          defaultValue={defaultCategory}
                          isDisabled={isEdit}
                        >
                          <option value={"plc"}>PLC</option>
                          <option value={"eqtq"}>EQTQ</option>
                          <option value={"drive"}>DRIVE</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Type</FormLabel>
                        <Input onChange={(e) => setType(e.target.value.toLowerCase())} defaultValue={defaultType} />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Unit</FormLabel>
                        <Input onChange={(e) => setUnit(e.target.value)} defaultValue={defaultUnit} />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Bucketing Type</FormLabel>
                        <Select onChange={(e) => setBucketingType(e.target.value)} defaultValue={defaultBucketingType}>
                          <option value={"minority"}>Minority</option>
                          <option value={"majority"}>Majority</option>
                          <option value={"average"}>Average</option>
                          <option value={"min"}>Minimum</option>
                          <option value={"max"}>Maximum</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Thresholds</FormLabel>
                        <HStack>
                          <Text>Lower:</Text>
                          <Input
                            placeholder={"N/A"}
                            onChange={(e) => setThresholdLow(e.target.value)}
                            defaultValue={defaultThresholdLow}
                          />
                          <Text>Upper:</Text>
                          <Input
                            placeholder={"N/A"}
                            onChange={(e) => setThresholdHigh(e.target.value)}
                            defaultValue={defaultThresholdHigh}
                          />
                        </HStack>
                      </FormControl>
                    </Flex>

                    <Tooltip label={!isFormValid() && "Please fill out all fields"} hasArrow>
                      <Box w="full">
                        <Button
                          w="full"
                          mt={5}
                          type="submit"
                          colorScheme={"blue"}
                          isDisabled={!isFormValid()}
                          isLoading={isLoading}
                          loadingText={(isEdit ? "Editing" : "Creating") + " sensor"}
                          onClick={() => handleSensorButtonClicked()}
                        >
                          {isEdit ? "Edit" : "Create"} sensor
                        </Button>
                      </Box>
                    </Tooltip>
                  </VStack>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
