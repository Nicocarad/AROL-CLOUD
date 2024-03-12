import { Box, Heading, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import UsersPanel from "../components/UsersPanel";
import { useParams } from "react-router-dom";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import { useContext, useEffect, useState } from "react";
import CompanyService from "../../services/CompanyService";
import { useNavigate } from "react-router-dom";
export default function UsersPage() {
  const params = useParams();
  const { principal } = useContext(PrincipalContext);
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();
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

  // BREADCRUMB NAVIGATION
  function breadcrumbNavigate(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, to: string, isCurrent: boolean) {
    e.preventDefault();
    e.stopPropagation();

    if (isCurrent) return;

    switch (to) {
      case "company_management": {
        navigate("/companies", { state: "company_management" });
        break;
      }
      default: {
        console.error("Unkown breadcrumb destination");
        break;
      }
    }
  }
  return (
    <Box w="full">
      {Number(principal!.companyID) === 0 && (
        <Breadcrumb mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={(e) => breadcrumbNavigate(e, "company_management", false)}>
              Company List
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{companyName}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      )}
      <Heading mb={6}>Users management</Heading>
      <HStack w="full">
        <UsersPanel companyID={params.id ? Number(params.id) : Number(principal!.companyID)} />
      </HStack>
    </Box>
  );
}
