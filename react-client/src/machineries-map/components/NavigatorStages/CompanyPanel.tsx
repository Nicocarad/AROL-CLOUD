import { VStack, Heading, Text, HStack, Divider } from "@chakra-ui/react";
import { Fragment } from "react";
import Company from "../../../companies/interfaces/Company";

interface CompanyPanelProps {
  companies: Company[];
  handleCompanyClicked: (id: number) => void;
}

export function CompanyPanel(props: CompanyPanelProps) {
  return (
    <>
      {props.companies.length > 0 ? (
        <>
          <VStack pb={5}>
            <Heading size={"sm"}>Company List</Heading>
          </VStack>
          <VStack w={"full"} h={"full"} justifyContent={"space-between"} p={3}>
            <VStack w={"full"}>
              {props.companies.map((company) => (
                <Fragment key={company.id}>
                  <VStack
                    w={"full"}
                    p={1}
                    _hover={{
                      bgColor: "gray.200",
                      cursor: "pointer",
                    }}
                    onClick={() => props.handleCompanyClicked(company.id)}
                    borderWidth={2}
                    borderColor="teal.800"
                    rounded="md"
                  >
                    <HStack>
                      <VStack>
                        <Text fontSize={"lg"} color={"gray.700"}>
                          {company.name}
                        </Text>
                        <Text fontSize={"sm"} color={"gray.500"}>
                          {company.city}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                  <Divider orientation={"horizontal"} />
                </Fragment>
              ))}
            </VStack>
          </VStack>
        </>
      ) : (
        <Text fontSize={"md"} maxW={"full"} textAlign={"center"} my={"8!important"}>
          No companies found
        </Text>
      )}
    </>
  );
}
