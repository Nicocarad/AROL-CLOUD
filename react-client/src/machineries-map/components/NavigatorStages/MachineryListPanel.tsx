import { Divider, Heading, HStack, Text, VStack } from "@chakra-ui/layout";
import { Fragment } from "react";
import Machinery from "../../../machinery-management/interfaces/Machinery";
import Navigator from "../../interfaces/Navigator";
import { FiChevronLeft } from "react-icons/fi";

interface MachineryListPanelProps {
  machineries: Map<string, Machinery[]>;
  navigator: Navigator;
  handleBackClicked: (arg0: string) => void;
  handleMachineryClicked: (arg0: string) => void;
}

const MachineryItem = ({ entry, handleMachineryClicked }) => (
  <Fragment key={entry.uid}>
    <VStack
      w={"full"}
      _hover={{
        bgColor: "gray.200",
        cursor: "pointer",
      }}
      p={1}
      onClick={() => handleMachineryClicked(entry.uid)}
      borderWidth={2}
      borderColor="teal.800"
      rounded="md"
    >
      <HStack>
        <VStack>
          <Text fontSize={"lg"} color={"gray.700"}>
            {entry.uid}
          </Text>
          <Text fontSize={"sm"} color={"gray.700"}>
            {entry.modelName}
          </Text>
          <Text fontSize={"sm"} color={"gray.500"}>
            {entry.modelType}
          </Text>
        </VStack>
      </HStack>
    </VStack>
    <Divider orientation={"horizontal"} />
  </Fragment>
);

export function MachineryListPanel({
  machineries,
  navigator: { clusterLocation },
  handleBackClicked,
  handleMachineryClicked,
}: MachineryListPanelProps) {
  return (
    <>
      <HStack
        minWidth={"full"}
        alignContent={"center"}
        _hover={{
          bgColor: "gray.200",
          cursor: "pointer",
        }}
        onClick={() => {
          handleBackClicked(clusterLocation === "unassigned" ? "" : "Machinery List Panel");
        }}
      >
        <FiChevronLeft />
        <Heading w={"full"} textAlign={"center"} mr={"14px!important"} size={"sm"} p={3}>
          {clusterLocation}
        </Heading>
      </HStack>
      {machineries.has(clusterLocation) ? (
        <VStack w={"full"} pt={5} pl={2} pr={2}>
          {machineries.get(clusterLocation)!.map((entry, index) => (
            <MachineryItem key={index} entry={entry} handleMachineryClicked={handleMachineryClicked} />
          ))}
        </VStack>
      ) : (
        <Text fontSize="md" maxW="full" textAlign="center" my="8!important">
          No machineries to be displayed
        </Text>
      )}
    </>
  );
}
