import React, { useEffect, useState } from "react";
import { Box, CloseButton, Flex, HStack, Switch, Text, VStack } from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import Sensor from "../../dashboard/models/Sensor";
import ManageSensors from "./ManageSensors";

interface SensorEntryProps {
  sensor: Sensor;
  checked: boolean;
  handleSwitchChange: (sensor: Sensor, value: boolean) => void;
  setFetch: React.Dispatch<React.SetStateAction<boolean>>;
}

function SensorDescriptionItem({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <>
      <Text fontWeight={300} color={"gray.500"} fontSize={"xs"}>
        {label}
      </Text>
      <Text color={"black"} fontSize="sm" mt={"0!important"} mb={4}>
        {value ? value : "N/A"}
      </Text>
    </>
  );
}

function SensorDescription({
  sensor,
  setDescriptionExpanded,
}: {
  sensor: Sensor;
  setDescriptionExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <HStack w={"full"} alignItems={"top"} justifyContent={"space-between"} pl={6}>
        <HStack>
          <VStack h={"full"} alignItems={"left"} justifyContent={"start"}>
            <SensorDescriptionItem label="Sensor description" value={sensor.description} />
            <SensorDescriptionItem label="Sensor type" value={sensor.type} />
            <SensorDescriptionItem label="Sensor unit" value={sensor.unit} />
            <Text fontWeight={300} color={"gray.500"} fontSize={"xs"}>
              Sensor thresholds
            </Text>
            <HStack mb={4} mt={"0!important"}>
              <Text color={"black"} fontSize="sm">
                Lower: {sensor.thresholdLow ? sensor.thresholdLow + " " + sensor.unit : "N/A"}
              </Text>
              <Text color={"black"} fontSize="sm">
                &nbsp;-&nbsp;
              </Text>
              <Text color={"black"} fontSize="sm">
                Upper: {sensor.thresholdHigh ? sensor.thresholdHigh + " " + sensor.unit : "N/A"}
              </Text>
            </HStack>
          </VStack>
        </HStack>
        <CloseButton onClick={() => setDescriptionExpanded(false)} />
      </HStack>
    </>
  );
}

export default function SensorEntry(props: SensorEntryProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    setChecked(props.checked);
  }, [props.checked]);

  return (
    <VStack w={"full"} justifyContent={"left"} pt={3} pb={3}>
      <HStack w={"full"} mt={2} justifyContent={"space-between"}>
        <HStack>
          <VStack alignItems={"left"}>
            <Flex direction={"column"} gap={1}>
              <HStack justifyContent={"left"} pl={4}>
                <Text fontSize={"17px"}> {props.sensor.name}</Text>
                <Box _hover={{ cursor: "pointer" }} onClick={() => setDescriptionExpanded((val) => !val)}>
                  <FiInfo />
                </Box>
              </HStack>
              <ManageSensors sensor={props.sensor} operationType={"modify"} setFetch={props.setFetch} />
            </Flex>
          </VStack>
        </HStack>
        <HStack justifyContent={"right"}>
          <Switch
            size="lg"
            onChange={(e) => {
              props.handleSwitchChange(props.sensor, e.target.checked);
              setChecked(e.target.checked);
            }}
            isChecked={checked}
          />
        </HStack>
      </HStack>
      {descriptionExpanded && (
        <SensorDescription sensor={props.sensor} setDescriptionExpanded={setDescriptionExpanded} />
      )}
    </VStack>
  );
}
