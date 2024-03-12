import { Fragment, useContext, useEffect, useState } from "react";
import { FiChevronLeft, FiFileText, FiGrid } from "react-icons/fi";
import PrincipalContext from "../../../utils/contexts/PrincipalContext";
import Machinery from "../../../machinery-management/interfaces/Machinery";
import PermissionChecker from "../../../utils/PermissionChecker";
import { VStack } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Box, HStack, Text, Heading } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";

interface MachineryPanelProps {
  handleBackClicked: (arg0: string) => void;
  navigator: Navigator;
  machineries: Map<string, Machinery[]>;
  handleDashboardButtonClicked: () => void;
  handleDocumentsButtonClicked: () => void;
}

interface Navigator {
  stage: string;
  clusterLocation: string;
  companyID?: number;
  machineryUID: string;
}

export function MachineryPanel(props: MachineryPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const [machinery, setMachinery] = useState<Machinery | null>(null);
  const [hasDashboardPermission, setHasDashboardPermission] = useState<boolean>(false);
  const [hasDocumentsPermission, setHasDocumentsPermission] = useState<boolean>(false);
  const [clusterLocation] = useState(props.navigator.clusterLocation);
  const [machineryUID] = useState(props.navigator.machineryUID);

  // Get machinery data and check dashboard and documents permissions
  useEffect(() => {
    const foundMachinery = props.machineries.get(clusterLocation)?.find((el) => el.uid === machineryUID);
    if (foundMachinery) {
      setMachinery(foundMachinery);
      setHasDashboardPermission(PermissionChecker.hasDashboardAccess(principal, foundMachinery.uid));
      setHasDocumentsPermission(PermissionChecker.hasDocumentsAccess(principal, foundMachinery.uid));
    }
  }, [props.machineries, clusterLocation, machineryUID, principal]);

  return (
    <>
      <HStack
        minWidth={"full"}
        alignContent={"center"}
        py={2}
        _hover={{
          bgColor: "gray.200",
          cursor: "pointer",
        }}
        onClick={() => props.handleBackClicked("Machinery Panel")}
      >
        <FiChevronLeft />
        <VStack w={"full"} textAlign={"center"} mr={"14px!important"}>
          <Text fontSize={"xs"} color={"gray.500"}>
            {clusterLocation === "unassigned" ? "" : clusterLocation}
          </Text>
          <Heading size={"sm"}>{machineryUID}</Heading>
        </VStack>
      </HStack>

      {machinery && (
        <Fragment key={machinery.uid}>
          <VStack w={"full"} h={"full"} justifyContent={"space-between"}>
            <VStack w={"full"} overflowY={"auto"}>
              <Box boxSize="180px" margin="15px">
                <Image src={require(`../../../assets/machineries/${machinery.modelID}.png`)} alt="Dan Abramov" />
              </Box>
            </VStack>
            <VStack>
              <Text fontSize={"lg"} color={"gray.700"}>
                {machinery.modelName}
              </Text>
              <Text fontSize={"sm"} color={"gray.700"}>
                {machinery.numHeads} heads
              </Text>
              <Text fontSize={"sm"} color={"gray.500"}>
                {machinery.modelType}
              </Text>
            </VStack>

            <VStack w="full" overflowY="hidden">
              <Button
                colorScheme="blue"
                w="full"
                leftIcon={<FiGrid />}
                isDisabled={!hasDashboardPermission}
                title={!hasDocumentsPermission ? "Operation not permitted" : ""}
                onClick={() => props.handleDashboardButtonClicked()}
              >
                Manage dashboards
              </Button>

              <Button
                colorScheme="teal"
                w="full"
                leftIcon={<FiFileText />}
                isDisabled={!hasDocumentsPermission}
                title={!hasDashboardPermission ? "Operation not permitted" : ""}
                onClick={() => props.handleDocumentsButtonClicked()}
              >
                Manage documents
              </Button>
            </VStack>
          </VStack>
        </Fragment>
      )}
    </>
  );
}
