import { useParams } from "react-router-dom";
import { Box, Heading, HStack } from "@chakra-ui/react";
import MachineryDashboardsPanel from "../components/MachineryDashboardsPanel";

export default function DashboardsPage() {
  const params = useParams();

  return (
    <Box w={"full"}>
      <Heading mb={6}>Machinaries</Heading>
      <HStack w={"full"}>
        <MachineryDashboardsPanel companyID={Number(params.id)} />
      </HStack>
    </Box>
  );
}
