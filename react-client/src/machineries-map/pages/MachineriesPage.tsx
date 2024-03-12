import MapPanel from "../components/MapPanel";
import { useEffect, useState, useContext } from "react";
import Machinery from "../../machinery-management/interfaces/Machinery";
import machineriesApi from "../../services/MachineryService";
import {
  Text,
  Box,
  Divider,
  Heading,
  HStack,
  useColorModeValue,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import NavigatorPanel from "../components/NavigatorPanel";
import PrincipalContext from "../../utils/contexts/PrincipalContext";

interface MachineriesPageProps {
  companyID?: number;
}

interface Navigator {
  stage: string;
  clusterLocation: string;
  companyID?: number;
  machineryUID: string;
}

export default function MachineriesPage(props: MachineriesPageProps) {
  const { principal } = useContext(PrincipalContext);
  const [machineries, setMachineries] = useState<Map<string, Machinery[]>>(
    new Map()
  );
  const [machineriesLoading, setMachineriesLoading] = useState(false);
  const [navigator, setNavigator] = useState<Navigator>({
    stage:
      Number(principal?.companyID) === 0 ? "Company Panel" : "Cluster Panel",
    clusterLocation: "",
    machineryUID: "",
  });

  // Fetch machineries map
  useEffect(() => {
    async function retrieveData() {
      setMachineriesLoading(true);
      try {
        let data: Map<string, Machinery[]>;
        if (Number(principal?.companyID) === 0) {
          data = await machineriesApi.getAllMachineries();
          data.delete("unassigned");
        } else {
          data = await machineriesApi.getMachineriesByCompanyID(
            props.companyID ? props.companyID : principal!.companyID
          );
        }

        setMachineries(data);
        if (data.size === 1) {
          setNavigator({
            stage: "Cluster Panel",
            clusterLocation: Array.from(data.keys())[0],
            machineryUID: "",
          });
        }
      } catch (e) {
        console.log(e);
      }
      setMachineriesLoading(false);
    }
    retrieveData();
  }, [principal, props.companyID]);

  return (
    <>
      <Box w={"full"}>
        <Heading mb={6} textAlign={"left"}>
          Home
        </Heading>
        <VStack w={"full"} h={"full"}>
          <Box w={"full"}>
            <HStack
              bg={useColorModeValue("white", "gray.900")}
              rounded={"lg"}
              p={6}
            >
              {machineriesLoading ? (
                <HStack
                  w="full"
                  h="full"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Spinner size="xl" />
                </HStack>
              ) : machineries.size === 0 ? (
                <Box>
                  <Text>No machineries available</Text>
                </Box>
              ) : (
                <>
                  <NavigatorPanel
                    machineries={machineries}
                    setMachineries={setMachineries}
                    machineriesLoading={machineriesLoading}
                    navigator={navigator}
                    setNavigator={setNavigator}
                  />
                  <Divider orientation={"vertical"} height={"500px"} />
                  <MapPanel
                    machineries={machineries}
                    setMachineries={setMachineries}
                    navigator={navigator}
                    setNavigator={setNavigator}
                  />
                </>
              )}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </>
  );
}
