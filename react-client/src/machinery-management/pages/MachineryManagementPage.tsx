import { useNavigate, useParams } from "react-router-dom";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Heading, HStack } from "@chakra-ui/react";
import MachineryManagementList from "../components/MachineryManagementList";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import CompanyService from "../../services/CompanyService";
import { useEffect, useContext, useState } from "react";

export default function MachineryManagementPage() {
  const params = useParams();
  const { principal } = useContext(PrincipalContext);
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");

  // RETRIEVE COMPANY NAME
  useEffect(() => {
    async function getCompanyByID() {
      try {
        let company = await CompanyService.getCompanyByID(params.id ? Number(params.id) : Number(principal!.companyID));
        setCompanyName(company.name);
      } catch (e) {
        console.error(e);
      }
    }
    getCompanyByID();
  }, [params.id, principal]);

  return (
    <Box w={"full"}>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() =>
              navigate("/companies", {
                state: "machinery_management",
              })
            }
          >
            Company List
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{companyName}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading mb={6}>Machineries management</Heading>
      <HStack w={"full"}>
        <MachineryManagementList companyID={Number(params.id)} companyName={companyName} />
      </HStack>
    </Box>
  );
}
