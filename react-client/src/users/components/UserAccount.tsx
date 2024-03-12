import React, { useContext, useState, useEffect, useCallback } from "react";
import { Box, Text, VStack, Divider, Flex, Spinner, Heading } from "@chakra-ui/react";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import CompanyService from "../../services/CompanyService";
import RoleTranslator from "../../utils/RoleTranslator";

export default function UserAccount() {
  const { principal } = useContext(PrincipalContext);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const getCompanyByID = useCallback(async () => {
    setLoading(true);
    try {
      let company = await CompanyService.getCompanyByID(Number(principal!.companyID));
      setCompanyName(company.name);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [principal]);

  useEffect(() => {
    getCompanyByID();
  }, [getCompanyByID]);

  return (
    <VStack
      align="start"
      justify="space-between"
      spacing={5}
      px={6}
      py={8}
      w={"full"}
      h={"80%"}
      borderWidth={1}
      borderColor={"gray.200"}
      bgColor={"white"}
      rounded={"md"}
    >
      <Box>
        <Heading fontSize="3xl" fontWeight="bold" mb={12}>
          Access Credentials
        </Heading>
        <Box ml={12}>
          <Text mb={2}>Email Address</Text>
          <Text fontWeight="bold">{principal?.email}</Text>
        </Box>
      </Box>
      <Divider m={5} w={"80%"} />
      <Box>
        <Heading fontSize="3xl" fontWeight="bold" mb={12}>
          Personal Details
        </Heading>
        <Flex gap={8} direction={"row"}>
          <Box ml={12}>
            <Text mb={2}>Name</Text>
            <Text fontWeight="bold">{principal?.name}</Text>
          </Box>
          <Box ml={12}>
            <Text mb={2}>Surname</Text>
            <Text fontWeight="bold">{principal?.surname}</Text>
          </Box>
          <Box ml={12}>
            <Text mb={2}>Company</Text>
            {loading ? <Spinner /> : <Text fontWeight="bold">{companyName}</Text>}
          </Box>
          <Box ml={12}>
            <Text mb={2}>Role</Text>
            <Text fontWeight="bold">{RoleTranslator.translateRolesForNavbar(principal)}</Text>
          </Box>
        </Flex>
      </Box>
    </VStack>
  );
}
