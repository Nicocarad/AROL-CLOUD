import {
  Heading,
  HStack,
  VStack,
  Text,
  Button,
  Divider,
} from "@chakra-ui/react";
import { FiChevronLeft, FiLock } from "react-icons/fi";
import { useContext, Fragment } from "react";
import PermissionChecker from "../../../utils/PermissionChecker";
import PrincipalContext from "../../../utils/contexts/PrincipalContext";
import { useNavigate } from "react-router-dom";
import Machinery from "../../../machinery-management/interfaces/Machinery";

interface ClusterPanelProps {
  companyID?: number;
  machineries: Map<string, Machinery[]>;
  handleBackClicked: (arg0: string) => void;
  handleClusterLocationClicked: (arg0: string) => void;
}

export function ClusterPanel(props: ClusterPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const navigate = useNavigate();

  return (
    <>
      {Number(principal?.companyID) === 0 ? (
        <HStack
          minWidth={"full"}
          alignContent={"center"}
          _hover={{
            bgColor: "gray.200",
            cursor: "pointer",
          }}
          onClick={() => props.handleBackClicked("Cluster Panel")}
          p={3}
        >
          <FiChevronLeft />
          <Heading
            w={"full"}
            textAlign={"center"}
            mr={"14px!important"}
            size={"sm"}
          >
            Locations
          </Heading>
        </HStack>
      ) : (
        <VStack>
          <Heading size={"sm"}>Locations</Heading>
        </VStack>
      )}
      {props.machineries.size > 0 ? (
        <>
          <VStack
            w={"full"}
            h={"full"}
            justifyContent={"space-between"}
            pl={2}
            pr={2}
          >
            <VStack w={"full"} pt={5}>
              {Array.from(props.machineries.entries()).map((entry) => (
                <Fragment key={entry[0]}>
                  <VStack
                    w={"full"}
                    p={1}
                    _hover={{
                      bgColor: "gray.200",
                      cursor: "pointer",
                    }}
                    onClick={() => props.handleClusterLocationClicked(entry[0])}
                    borderWidth={2}
                    borderColor="teal.800"
                    rounded="md"
                  >
                    <HStack>
                      <VStack>
                        <Text fontSize={"lg"} color={"gray.700"}>
                          {entry[0]}
                        </Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                          {entry[1].length} machineries
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  <Divider orientation={"horizontal"} />
                </Fragment>
              ))}
            </VStack>
            {PermissionChecker.isManagerOrAbove(principal) && (
              <Button
                w={"full"}
                colorScheme={"blue"}
                leftIcon={<FiLock />}
                onClick={() => navigate("/permissions")}
              >
                Machinery permissions
              </Button>
            )}
            {PermissionChecker.isArolSupervisorOrAbove(principal) && (
              <Button
                w={"full"}
                colorScheme={"blue"}
                leftIcon={<FiLock />}
                onClick={() =>
                  navigate("/companies/" + props.companyID, {
                    state: "machinery_permissions",
                  })
                }
              >
                Machinery permissions
              </Button>
            )}
          </VStack>
        </>
      ) : (
        <Text fontSize="md" maxW="full" textAlign="center" my="8!important">
          This company has no machineries registered. Please register a new one
          or contact Arol Support.
        </Text>
      )}
    </>
  );
}
