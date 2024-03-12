import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import ToastContext from "../../utils/contexts/ToastContext";
import { FiSearch, FiX } from "react-icons/fi";
import CompanyCard from "./CompanyCard";
import Company from "../interfaces/Company";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import CompanyService from "../../services/CompanyService";
import userService from "../../services/UserService";
import machineryService from "../../services/MachineryService";

interface CompaniesPanelProps {
  type: string;
}

export default function CompaniesPanel(props: CompaniesPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState<{ searchTerm: string; highlightTerm: string; doSearch: boolean }>({
    searchTerm: "",
    highlightTerm: "",
    doSearch: false,
  });
  const [companySort, setCompanySort] = useState<string>("none");
  const [loadingCompanies, setLoadingCompanies] = useState<boolean>(true);
  const [update, setUpdate] = useState<boolean>(false);
  const [first, setFirst] = useState<boolean>(true);
  const [type, setType] = useState<string>(props.type);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // GET COMPANIES
  useEffect(() => {
    async function getCompanies() {
      setLoadingCompanies(true);
      if ((companySort !== "none" || (!update && !first)) && type === props.type) {
        setLoadingCompanies(false);
        return;
      }

      setType(props.type);

      // Reset search
      setCompanySearch({ searchTerm: "", doSearch: true, highlightTerm: "" });
      try {
        let companiesResult = await CompanyService.getCompanies();
        const promises = companiesResult.map(async (el: Company) => {
          const [users, machineries] = await Promise.all([
            userService.getCompanyUsers(el.id),
            machineryService.getMachineriesByCompanyID(el.id),
          ]);
          const numEmployees = users.length;
          const numMachineries = Array.from(machineries.values()).flat().length;
          return { ...el, numEmployees, numMachineries, active: true };
        });
        const updatedCompanies = await Promise.all(promises);
        setCompanies(updatedCompanies);
        setActiveCompanies(updatedCompanies);
        setUpdate(false);
        setCompanySearch((val) => ({ ...val, doSearch: true }));
      } catch (e) {
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Dashboards could not be fetched");
      } finally {
        setLoadingCompanies(false);
        setFirst(false);
      }
    }

    getCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies.length, companySort, first, principal, type, update]);

  // HANDLE SEARCH
  useEffect(() => {
    if (!companySearch.doSearch) return;

    const searchTerm = companySearch.searchTerm.toLowerCase();
    setActiveCompanies(
      companies.filter(
        (el) => !searchTerm || el.name.toLowerCase().includes(searchTerm) || el.city.toLowerCase().includes(searchTerm),
      ),
    );

    setCompanySearch((val) => {
      val.doSearch = false;
      val.highlightTerm = val.searchTerm.trim();
      return { ...val };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySearch]);

  // HANDLE SORT
  useEffect(() => {
    if (companySort === "none") return;

    setActiveCompanies((val) => {
      val.sort((a, b) => {
        switch (companySort) {
          case "name": {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          }
          case "city": {
            return a.city.toLowerCase() > b.city.toLowerCase() ? 1 : -1;
          }
          case "employees": {
            return a.numEmployees! > b.numEmployees! ? -1 : 1;
          }
          case "machineries": {
            return a.numMachineries! > b.numMachineries! ? -1 : 1;
          }
          default: {
            ToastHelper.makeToast(toast, "Sorting failed", "warning");
            return 0;
          }
        }
      });
      return [...val];
    });
    ToastHelper.makeToast(toast, "Sorting applied", "info");
  }, [companySort, toast]);

  // HANDLE COMPANY CREATION
  function CreateCompanyForm() {
    const [companyName, setCompanyName] = useState<string>("");
    const [city, setCity] = useState<string>("");

    const handleCancel = () => {
      setCompanyName("");
      setCity("");
    };

    async function handleConfirm() {
      setIsLoading(true);
      if (!companyName || !city) {
        ToastHelper.makeToast(toast, "Fill in all required fields", "warning");
        setIsLoading(false);
        return;
      }
      try {
        const newCompany: Company = {
          id: -1,
          name: companyName,
          city: city,
          active: true,
        };
        await CompanyService.createCompany(newCompany);
        setUpdate(true);
        ToastHelper.makeToast(toast, "Company created successfully", "success");
      } catch (e) {
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Error while creating new company");
      }
      setIsLoading(false);
    }

    return (
      <Accordion allowToggle w="full">
        <AccordionItem borderStyle={"none"}>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Looking to create a new company?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pt={6} pb={6}>
            <Box>
              <Text fontWeight={600} pb={3}>
                Company Name
              </Text>
              <Input
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <Text fontWeight={600} pt={5} pb={3}>
                City
              </Text>
              <Input placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} />
            </Box>

            <Flex justifyContent="flex-end" gap={4} pt={4}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Tooltip
                label={"Fill in all required fields"}
                isDisabled={Boolean(companyName || city)}
                placement="top"
                rounded="md"
              >
                <Button
                  mr={2}
                  colorScheme={"blue"}
                  onClick={handleConfirm}
                  isLoading={isLoading}
                  isDisabled={!companyName || !city}
                >
                  {isLoading ? "Creating Company" : "Create Company"}
                </Button>
              </Tooltip>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <>
      <VStack w={"full"} h={"full"}>
        {props.type === "company_management" && (
          <VStack px={6} py={2} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
            <CreateCompanyForm />
          </VStack>
        )}
        <HStack p={6} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<FiSearch />} />
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="Search company"
              value={companySearch.searchTerm}
              onChange={(e) =>
                setCompanySearch((val) => {
                  val.searchTerm = e.target.value;
                  return { ...val };
                })
              }
            />
            <InputRightElement width="6.5rem">
              <Box
                pr={1}
                _hover={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  setCompanySearch({
                    searchTerm: "",
                    doSearch: true,
                    highlightTerm: "",
                  });
                }}
              >
                <FiX size={18} color={"gray"} />
              </Box>
              <Button
                h="1.75rem"
                size="sm"
                colorScheme={"blue"}
                onClick={() =>
                  setCompanySearch((val) => {
                    val.doSearch = true;
                    return { ...val };
                  })
                }
              >
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
          <Select w={"350px"} value={companySort} onChange={(e) => setCompanySort(e.target.value)}>
            <option value="none">Sort by default order</option>
            <option value="name">Sort by name</option>
            <option value="city">Sort by city</option>
            <option value="employees">Sort by number of employees</option>
            <option value="machineries">Sort by number of machineries</option>
          </Select>
        </HStack>
        {loadingCompanies ? (
          <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
            <Spinner size={"xl"} />
          </VStack>
        ) : activeCompanies.length > 0 ? (
          activeCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              setUpdate={setUpdate}
              highlightTerm={companySearch.highlightTerm}
              type={props.type}
              numEmployees={company.numEmployees!}
              numMachineries={company.numMachineries!}
            />
          ))
        ) : (
          <HStack w={"full"} h={"200px"} justifyContent={"center"} alignItems={"center"}>
            {companySearch.highlightTerm ? (
              <Text>Nothing matches your search term</Text>
            ) : (
              <Text>No companies found</Text>
            )}
          </HStack>
        )}
      </VStack>
    </>
  );
}
