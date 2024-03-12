import { Box, Heading, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import MachineryPermissionsPanel from "../components/MachineryPermissionsPanel";
import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import companyService from "../../services/CompanyService";
import MachineryPermissionsPanelArol from "../components/MachineryPermissionsPanelArol";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import { useNavigate } from "react-router-dom";

export default function MachineryPermissionsPage() {
  const params = useParams();
  const { principal } = useContext(PrincipalContext);
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function getCompanyByID() {
      try {
        const company = await companyService.getCompanyByID(
          params.id ? Number(params.id) : Number(principal!.companyID),
        );
        setCompanyName(company.name);
      } catch (e) {
        console.log(e);
      }
    }
    getCompanyByID();
  }, [principal, params.id]);

  return (
    <Box w={"full"}>
      {Number(principal!.companyID) === 0 && (
        <Breadcrumb mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/companies", { state: "machinery_permissions" })}>
              Company List
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{companyName}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      )}
      <Heading mb={6}>Machinery permissions</Heading>
      <HStack w={"full"}>
        {Number(params.id) === 0 ? (
          <MachineryPermissionsPanelArol />
        ) : (
          <MachineryPermissionsPanel companyID={Number(params.id)} />
        )}
      </HStack>
    </Box>
  );
}
