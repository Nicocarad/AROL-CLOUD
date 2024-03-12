import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  Divider,
  Flex,
  Stack,
  Skeleton,
  Heading,
  Badge,
} from "@chakra-ui/react";
import { FiEdit3 } from "react-icons/fi";
import machineryService from "../../../services/MachineryService";
import Sensor from "../../../machinery/dashboard/models/Sensor";

import ToastHelper from "../../../utils/ToastHelper";
import { useToast } from "@chakra-ui/toast";
import AxiosExceptionHandler from "../../../utils/AxiosExceptionHandler";

import ManageSensors from "./ManageSensors";
import SensorEntry from "./SensorEntry";
import PrincipalContext from "../../../utils/contexts/PrincipalContext";
import PermissionChecker from "../../../utils/PermissionChecker";

interface SensorModalProps {
  machineryUID: string;
}

function LoadingSkeleton() {
  return (
    <Box w="full" p={5}>
      <HStack pb={5}>
        <Skeleton height="35px" width="65px" borderRadius={"20px"} />
        <Skeleton height="35px" width="65px" borderRadius={"20px"} />
        <Skeleton height="35px" width="65px" borderRadius={"20px"} />
      </HStack>
      <Stack pl={5}>
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="150px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="120px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="115px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="137px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />

        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="155px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="100px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="165px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="160px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
        <Divider />
        <HStack justifyContent={"space-between"}>
          <Skeleton height="20px" width="122px" mt={2} mb={2} />
          <Skeleton height="28px" width="50px" borderRadius={"20px"} />
        </HStack>
      </Stack>
    </Box>
  );
}

export default function SensorsPanel(props: SensorModalProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useToast();

  const [sensorList, setSensorList] = useState(new Map<string, Sensor[]>());
  const [selectedSensors, setSelectedSensors] = useState(new Map<string, Sensor[]>());
  const [loadingSensors, setLoadingSensors] = useState<boolean>(true);
  const [submit, setSubmit] = useState<boolean>(false);
  const [sensorsToBeDeleted, setSensorsToBeDeleted] = useState<Sensor[]>([]);
  const [sensorsToBeAdded, setSensorsToBeAdded] = useState<Sensor[]>([]);
  const [fetch, setFetch] = useState<boolean>(true);
  const [newSensorsMounted, setNewSensorsMounted] = useState<boolean>(false);

  // RETRIEVE SENSORS
  useEffect(() => {
    async function fetchSensors() {
      if (!fetch) return;
      if (!newSensorsMounted) setLoadingSensors(true);

      try {
        const sensors = await machineryService.getSensorsCatalogue();
        const sensorMap = sensors.reduce((map, sensor) => {
          const category = sensor.category;
          if (!map.has(category)) map.set(category, []);
          if (!map.get(category)!.find((s) => s.name === sensor.name)) map.get(category)!.push(sensor);
          return map;
        }, new Map<string, Sensor[]>());

        setSensorList(new Map(Array.from(sensorMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))));

        const installed = await machineryService.getMachinerySensors(props.machineryUID);
        const installedSensorsMap = installed.reduce((map, sensor) => {
          const category = sensor.category;
          if (!map.has(category)) map.set(category, []);
          if (!map.get(category)!.find((s) => s.name === sensor.name)) map.get(category)!.push(sensor);
          return map;
        }, new Map<string, Sensor[]>());
        setSelectedSensors(installedSensorsMap);

        if (!newSensorsMounted) setLoadingSensors(false);
        else setNewSensorsMounted(false);

        setFetch(false);
      } catch (e) {
        console.log(e);
        AxiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Failed to fetch sensors");
      }
    }
    fetchSensors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  // UPDATE SENSORS
  useEffect(() => {
    if (!submit) return;
    if (!principal || !PermissionChecker.isArolSupervisorOrAbove(principal)) {
      setSubmit(false);
      return ToastHelper.makeToast(
        toast,
        "Current user doest not have permissions to modify machinery sensors",
        "warning",
      );
    }

    async function updateSensors() {
      try {
        await machineryService.modifyMachinerySensors(props.machineryUID, sensorsToBeAdded, sensorsToBeDeleted);
        setSensorsToBeAdded([]);
        setSensorsToBeDeleted([]);
        ToastHelper.makeToast(toast, "Sensors updated", "success");
      } catch (e) {
        console.log(e);
        AxiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Failed to update sensors");
      }
      setSubmit(false);

      setFetch(true);
    }
    updateSensors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  // HANDLE SENSOR SWITCH CHANGE
  function handleSwitchChange(sensor: Sensor, value: boolean) {
    if (value) {
      // If present in sensorsToBeDeleted, remove it
      setSensorsToBeDeleted((prevSensors) =>
        prevSensors.filter((s) => s.name !== sensor.name || (s.name === sensor.name && s.category !== sensor.category)),
      );
      // Add sensor to array of sensors to be added if not present in the selectedSensors
      setSensorsToBeAdded((prevSensors) => {
        if (!selectedSensors.get(sensor.category)?.find((s) => s.name === sensor.name)) return [...prevSensors, sensor];

        return prevSensors;
      });
    } else {
      // If present in sensorsToBeAdded, remove it
      setSensorsToBeAdded((prevSensors) =>
        prevSensors.filter((s) => s.name !== sensor.name || (s.name === sensor.name && s.category !== sensor.category)),
      );
      // Add sensor to array of sensors to be deleted if is present in the selectedSensors
      setSensorsToBeDeleted((prevSensors) => {
        if (selectedSensors.get(sensor.category)?.find((s) => s.name === sensor.name)) return [...prevSensors, sensor];

        return prevSensors;
      });
    }
  }

  const colorSchemes = ["teal", "blue", "green", "red", "orange", "purple", "pink"];
  const categoryColors: { [category: string]: string } = {};

  let currentColorIndex = 0;
  const getColorScheme = (category: string) => {
    if (!categoryColors[category]) {
      const color = colorSchemes[currentColorIndex];
      categoryColors[category] = color;
      currentColorIndex = (currentColorIndex + 1) % colorSchemes.length;
    }
    return categoryColors[category];
  };

  return (
    <>
      <VStack
        px={6}
        py={2}
        w="full"
        borderWidth={1}
        borderColor="gray.200"
        bgColor="white"
        rounded="md"
        mb={5}
        alignItems="left"
      >
        <Text pb={4} fontSize="3xl" color="gray.600" fontWeight="semibold" mb={5}>
          Sensors mounted
        </Text>
        {selectedSensors.size > 0 ? (
          Array.from(selectedSensors.entries()).map(([category, sensors], index) => (
            <Box key={index} pb={1}>
              <Flex
                key={category}
                direction="column"
                alignItems="start"
                bg="gray.100"
                borderRadius="md"
                p={5}
                shadow="md"
              >
                <Text pb={4} fontSize="xl" fontWeight="bold">
                  {category.toUpperCase()}
                </Text>
                <Flex direction="row" gap={4} width="fit-content" flexWrap="wrap" pl={4}>
                  {sensors.map((sensor, index) => (
                    <Badge key={index} colorScheme={getColorScheme(category)} px={3} py={1} borderRadius="full">
                      {sensor.name}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            </Box>
          ))
        ) : (
          <Text fontSize="lg" pl={10} pb={5}>
            There are no sensors mounted on this machinery
          </Text>
        )}
      </VStack>

      {PermissionChecker.isArolSupervisorOrAbove(principal) && (
        <VStack h="fit-content" w="full" bg="white" boxShadow="2xl" rounded="lg" align="start" p={5}>
          <Heading fontSize={"3xl"} color="gray.600" fontWeight={"semibold"} mb={5}>
            Add or remove sensors from machinery
          </Heading>
          <HStack w={"full"} justifyContent={"space-between"} pt={4} pb={8}>
            <Text>Looking to create a new sensor?</Text>
            <ManageSensors
              sensor={{
                name: "",
                description: "",
                unit: "",
                thresholdLow: null,
                thresholdHigh: null,
                internalName: "",
                category: "",
                type: "",
                bucketingType: "",
                imgFilename: "",
                imgPointerLocation: { x: "", y: "" },
              }}
              operationType="create"
              setFetch={setFetch}
            />
          </HStack>
          <Text fontSize={"lg"} fontWeight={600} pb={4}>
            Select sensors
          </Text>

          <VStack w={"full"}>
            {!loadingSensors ? (
              <Tabs variant="soft-rounded" colorScheme="green" w={"full"}>
                <TabList>
                  {Array.from(sensorList.keys()).map((category, index) => (
                    <Tab key={index}>{category.toUpperCase()}</Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {Array.from(sensorList.entries()).map(([category, sensors], index) => {
                    return (
                      <TabPanel key={index} pr={12}>
                        {sensors.length > 0 &&
                          sensors.map((sensor, index) => (
                            <React.Fragment key={index}>
                              <SensorEntry
                                key={sensor.name.toLowerCase()}
                                sensor={sensor}
                                handleSwitchChange={handleSwitchChange}
                                checked={Boolean(selectedSensors.get(category)?.find((s) => s.name === sensor.name))}
                                setFetch={setFetch}
                              />
                              <Divider />
                            </React.Fragment>
                          ))}
                      </TabPanel>
                    );
                  })}
                </TabPanels>
              </Tabs>
            ) : (
              <LoadingSkeleton />
            )}
          </VStack>

          <Button
            variant="solid"
            colorScheme={"teal"}
            ml={"auto"}
            mt={4}
            w={"180px"}
            leftIcon={<FiEdit3 />}
            loadingText={"Updating Sensors"}
            onClick={() => {
              setSubmit(true);
              setNewSensorsMounted(true);
            }}
            isLoading={submit}
          >
            Update sensors
          </Button>
        </VStack>
      )}
    </>
  );
}
