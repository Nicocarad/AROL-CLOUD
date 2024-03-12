import { useContext } from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import CompaniesPanel from "../components/CompaniesPanel";
import ToastContext from "../../utils/contexts/ToastContext";
import ToastHelper from "../../utils/ToastHelper";

interface CompaniesPageProps {
  type: string;
}

export default function CompaniesPage(props: CompaniesPageProps) {
  const { toast } = useContext(ToastContext);

  let pageTitle = "";

  switch (props.type) {
    case "machinery_management":
      pageTitle = "Machineries management";
      break;
    case "machinery_permissions":
      pageTitle = "Machinery permissions";
      break;
    case "company_management":
      pageTitle = "Companies management";
      break;
    default:
      ToastHelper.makeToast(toast, "Invaild page type", "warning");
      break;
  }

  return (
    <Box w={"full"}>
      <Heading mb={6}>Company List - {pageTitle}</Heading>
      <HStack w={"full"}>
        <CompaniesPanel type={props.type} />
      </HStack>
    </Box>
  );
}
