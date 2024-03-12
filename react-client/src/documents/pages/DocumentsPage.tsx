import { useParams } from "react-router-dom";
import { Box, Heading, HStack } from "@chakra-ui/react";
import MachineryDocumentsPanel from "../components/MachineryDocumentsPanel";

export default function DocumentsPage() {
  const params = useParams();

  return (
    <Box w={"full"}>
      <Heading mb={6}>Machinaries</Heading>
      <HStack w={"full"}>
        <MachineryDocumentsPanel companyID={Number(params.id)} />
      </HStack>
    </Box>
  );
}
