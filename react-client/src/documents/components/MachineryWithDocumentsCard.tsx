import { useNavigate } from "react-router-dom";
import { Button, Divider, Heading, HStack, Image, Text, VStack, Flex, Box, Badge } from "@chakra-ui/react";
import { FiFolder, FiSearch } from "react-icons/fi";
import { Fragment } from "react";
import MachineryWithDocuments from "../interfaces/MachineryWithDocuments";
import HelperFunctions from "../../utils/HelperFunctions";

interface machineryWithDocumentsCardProps {
  machineryWithDocuments: MachineryWithDocuments;
  highlightTerm: string;
  openPopoverId: string | null;
  companyID?: number;
}

export default function MachineryWithDocumentsCard(props: machineryWithDocumentsCardProps) {
  const navigate = useNavigate();

  //FORMAT FILE PATH
  function getFilePath(inputFilePath: string) {
    let startIndex = inputFilePath.indexOf(props.machineryWithDocuments.uid);

    return inputFilePath.slice(startIndex + props.machineryWithDocuments.uid.length).toString();
  }

  const hoverStyle = {
    _hover: {
      boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.2)",
      transform: "translateY(-5px)",
      transition: "transform 0.3s ease-in-out, box-shadow 0.2s ease-in-out",
    },
  };

  return (
    <VStack
      p={6}
      w={"full"}
      borderWidth={1}
      borderColor={"gray.200"}
      bgColor={"white"}
      rounded={"md"}
      {...(!props.openPopoverId ? hoverStyle : {})}
    >
      <HStack w={"full"} h={"220px"} mb={3}>
        <HStack minW={"220px"} maxW={"220px"} justifyContent={"center"}>
          <Image
            boxSize={"220px"}
            objectFit="contain"
            src={require("./../../assets/machineries/" + props.machineryWithDocuments.modelID + ".png")}
          />
        </HStack>
        <Divider orientation={"vertical"} h={"full"} />

        <VStack justifyContent="flex-start" alignItems="flex-start" flexWrap={"nowrap"} w={"full"} h={"full"} pl={2}>
          <Heading fontSize={"md"} fontFamily={"body"} fontWeight={450} color={"gray.400"} whiteSpace={"nowrap"}>
            {HelperFunctions.highlightText(props.machineryWithDocuments.uid, 450, props.highlightTerm)}
          </Heading>
          <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={550} whiteSpace={"nowrap"} mb={"4!important"}>
            {HelperFunctions.highlightText(props.machineryWithDocuments.modelName, 550, props.highlightTerm)}
          </Heading>
          <Flex direction={"column"} gap={3}>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Machinery type
              </Text>
              <Text color={"black"} fontSize="md" fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(props.machineryWithDocuments.modelType, 400, props.highlightTerm)}
              </Text>
            </Box>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Number of Heads
              </Text>
              <Text color={"black"} fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(
                  props.machineryWithDocuments.numHeads.toString(),
                  400,
                  props.highlightTerm,
                )}
              </Text>
            </Box>
            <Box>
              <Text fontWeight={300} color={"gray.400"} whiteSpace={"nowrap"} fontSize={"sm"}>
                Machinery location
              </Text>
              <Text color={"black"} fontWeight={400} whiteSpace={"nowrap"} mt={"0!important"}>
                {HelperFunctions.highlightText(props.machineryWithDocuments.locationCluster, 400, props.highlightTerm)}
              </Text>
            </Box>
          </Flex>
        </VStack>
        <VStack w="full" h="full" justifyContent={"flex-start"} alignItems={"end"}>
          <Button
            leftIcon={<FiFolder />}
            colorScheme={"blue"}
            onClick={() =>
              navigate("/machinery/" + props.machineryWithDocuments.uid + "/documents", {
                state: {
                  companyID: props.companyID,
                  machinery: { ...props.machineryWithDocuments },
                  dashboardName: null,
                },
              })
            }
          >
            Manage documents
          </Button>
        </VStack>
      </HStack>
      <Divider m={1} />
      <VStack w={"full"} maxH={"350px"} overflowY={"auto"}>
        {props.machineryWithDocuments.documents.length > 0 &&
          props.machineryWithDocuments.documents.map((document, index) => (
            <Fragment key={document.id}>
              <HStack w={"full"}>
                <VStack w={"full"} alignItems={"left"}>
                  <HStack alignItems={"baseline"} mt={"0!important"}>
                    <Text fontSize={"md"} fontWeight={500}>
                      {HelperFunctions.highlightText(document.name, 500, props.highlightTerm)}
                    </Text>
                    <Text fontSize={"xs"} color={"gray.500"} fontWeight={500}>
                      {HelperFunctions.formatFileSize(document.size)}
                    </Text>
                   
                  </HStack>
                  {document.isPrivate ? <Badge w={"fit-content"}>Private</Badge> : <Badge color={"green"} w={"fit-content"}>Public</Badge>}
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
                          props.machineryWithDocuments.uid +
                          "/documents/" +
                          document.documentUID.split("\\").pop(),
                        {
                          state: {
                            document: document,
                            machinery: props.machineryWithDocuments,
                          },
                        },
                      )
                    }
                  >
                    View document
                  </Button>
                </VStack>
              </HStack>
              {index < props.machineryWithDocuments.documents.length - 1 && <Divider />}
            </Fragment>
          ))}
      </VStack>
      {props.machineryWithDocuments.documents.length === 0 && (
        <HStack w={"full"} justifyContent={"center"}>
          <Text pt={3} fontSize={"sm"} fontWeight={500}>
            This machinery has no stored documents
          </Text>
        </HStack>
      )}
    </VStack>
  );
}
