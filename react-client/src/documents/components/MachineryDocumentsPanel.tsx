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
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import machineryService from "../../services/MachineryService";
import Machinery from "../../machinery-management/interfaces/Machinery";
import ToastContext from "../../utils/contexts/ToastContext";
import { FiSearch, FiX } from "react-icons/fi";
import MachineryWithDocumentsCard from "./MachineryWithDocumentsCard";
import MachineryWithDocuments from "../interfaces/MachineryWithDocuments";
import documentsService from "../../services/DocumentService";
import FileMapEntry from "../../machinery/documents/interfaces/FileMapEntry";
import FileMap from "../../machinery/documents/interfaces/FileMap";
import permissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import MachineryFilters from "../../filters/interfaces/MachineryFilters";
import MachineryFilter from "../../filters/components/MachineryFilter";

interface MachineryDashboardsPanelProps {
  companyID?: number;
}

export default function MachineryDocumentsPanel(props: MachineryDashboardsPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);
  const [machineriesWithDocuments, setMachineriesWithDocuments] = useState<MachineryWithDocuments[]>([]);
  const [machinerySearch, setMachinerySearch] = useState<{
    searchTerm: string;
    highlightTerm: string;
    doSearch: boolean;
  }>({
    searchTerm: "",
    highlightTerm: "",
    doSearch: false,
  });
  const [machinerySort, setMachinerySort] = useState<string>("none");
  const [loadingMachineries, setLoadingMachineries] = useState<boolean>(true);
  const [machineryFilter, setMachineryFilter] = useState<MachineryFilters>({});
  const [machineryModels, setMachineryModels] = useState<string[]>([]);
  const [machineryTypes, setMachineryTypes] = useState<string[]>([]);
  const [maxNumDocuments, setMaxNumDocuments] = useState<number>(1);
  const [maxNumHeads, setMaxNumHeads] = useState<number>(1);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  /* FILTERING FUNCTIONS */

  function hasSelectedProperty(machineryProp: string, filter: { [key: string]: boolean } | undefined): boolean {
    if (!filter) return true;
    return Object.keys(filter)
      .filter((key) => filter[key])
      .some((key) => machineryProp.includes(key));
  }

  function isNumberInRange(numToCheck: number, filter: { min: number; max: number } | undefined): boolean {
    if (filter) {
      const { min, max } = filter;
      if (min && max) return numToCheck >= min && numToCheck <= max;
      else if (min) return numToCheck >= min;
      else if (max) return numToCheck <= max;
    }
    return true;
  }

  function foundSearchTerm(machinery: MachineryWithDocuments): boolean {
    if (!machinerySearch.searchTerm) return true;
    const searchTermLower = machinerySearch.searchTerm.toLowerCase();
    return [
      machinery.uid?.toLowerCase(),
      machinery.modelName?.toLowerCase(),
      machinery.modelType?.toLowerCase(),
      machinery.locationCluster?.toLowerCase(),
      ...machinery.documents.map((docs) => docs.name.toLowerCase()),
    ].some((data) => data?.includes(searchTermLower));
  }

  // HANDLE SEARCH AND FILTER
  useEffect(() => {
    if (machinerySearch.doSearch) {
      setMachinerySearch((val) => {
        val.doSearch = false;
        val.highlightTerm = val.searchTerm;
        return { ...val };
      });
    }
    setMachineriesWithDocuments((machineriesWithDocuments) =>
      machineriesWithDocuments.map((machineryWithDocuments) => {
        const displayMachineryWithDocuments =
          hasSelectedProperty(machineryWithDocuments.modelName, machineryFilter.models) &&
          hasSelectedProperty(machineryWithDocuments.modelType, machineryFilter.types) &&
          isNumberInRange(machineryWithDocuments.numHeads, machineryFilter.numHeads) &&
          isNumberInRange(machineryWithDocuments.documents.length, machineryFilter.numDocuments) &&
          foundSearchTerm(machineryWithDocuments);
        return {
          ...machineryWithDocuments,
          active: displayMachineryWithDocuments,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineryFilter, machinerySearch.doSearch]);

  // LOAD MACHINERIES & CORRESPONDING DOCUMENTS
  useEffect(() => {
    if (machinerySort !== "none" || machineriesWithDocuments.length !== 0) return;

    async function getMachineriesAndDocuments() {
      setLoadingMachineries(true);

      try {
        const machineriesMap = await machineryService.getMachineriesByCompanyID(
          props.companyID ? props.companyID : principal!.companyID,
        );
        const machineriesArray: Machinery[] = [];
        machineriesMap.forEach((val) => {
          machineriesArray.push(...val);
        });

        const machineriesWithDocumentsArray: MachineryWithDocuments[] = [];
        for (const machinery of machineriesArray) {
          if (permissionChecker.hasMachineryPermission(principal, machinery.uid, "documentsRead")) {
            let fileMap: FileMap = {};
            let documents: FileMapEntry[] = [];
            try {
              fileMap = (await documentsService.getMachineryDocuments(machinery.uid)).fileMap as FileMap;
              Object.values(fileMap).forEach((fileMapEntry: FileMapEntry) => {
                if (!fileMapEntry.isDir) documents.push(fileMapEntry);
              });
            } catch (e) {
              axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                "Documents for machinery with id " + machinery.uid + " could not be fetched",
              );
            }

            machineriesWithDocumentsArray.push({
              ...machinery,
              active: true,
              documents: documents.sort((a, b) => (a.id > b.id ? 1 : -1)),
            });
          }
        }
        if (machineriesWithDocuments.length > 0) {
          setMachineriesWithDocuments(machineriesWithDocumentsArray);
          setMachinerySearch((val) => {
            val.doSearch = true;
            return { ...val };
          });
          setLoadingMachineries(false);
          return;
        } else setMachineriesWithDocuments(machineriesWithDocumentsArray);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Documents could not be fetched");
      }

      setLoadingMachineries(false);
    }
    getMachineriesAndDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineriesWithDocuments.length, machinerySort, principal, props.companyID]);

  // LOAD MACHINERY CATALOGUE
  useEffect(() => {
    if (loadingMachineries) return;
    async function getMachineryDetails() {
      try {
        const results = await Promise.all(
          machineriesWithDocuments.map((machinery) => machineryService.getMachineryDetails(machinery.modelID)),
        );
        const { mTypes, mModels, maxHead, maxDocs } = results.reduce(
          (acc, machineryCatalogue, index) => {
            if (!acc.mModels.includes(machineryCatalogue.name)) {
              acc.mModels.push(machineryCatalogue.name);
            }
            if (!acc.mTypes.includes(machineryCatalogue.type)) {
              acc.mTypes.push(machineryCatalogue.type);
            }
            acc.maxHead = Math.max(acc.maxHead, machineriesWithDocuments[index].numHeads);
            acc.maxDocs = Math.max(acc.maxDocs, machineriesWithDocuments[index].documents.length);
            return acc;
          },
          { mTypes: [], mModels: [], maxHead: 0, maxDocs: 0 },
        );
        setMaxNumDocuments(maxDocs === 0 ? 1 : maxDocs);
        setMaxNumHeads(maxHead === 0 ? 1 : maxHead);
        setMachineryModels(mModels);
        setMachineryTypes(mTypes);
      } catch (e) {
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Machinery catalogue could not be fetched");
      }
    }
    getMachineryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMachineries, machineriesWithDocuments.length]);

  // HANDLE SORT
  useEffect(() => {
    if (machinerySort === "none") return;

    setMachineriesWithDocuments((machineries) => {
      machineries.sort((a, b) => {
        switch (machinerySort) {
          case "uid": {
            return a.uid > b.uid ? 1 : -1;
          }
          case "modelName": {
            return a.modelName > b.modelName ? 1 : -1;
          }
          case "type": {
            return a.modelType > b.modelType ? 1 : -1;
          }
          case "location": {
            return a.locationCluster > b.locationCluster ? 1 : -1;
          }
          case "num-documents": {
            return b.documents.length - a.documents.length;
          }
          default: {
            console.error("Unknown sort term");
            return 0;
          }
        }
      });

      return [...machineries];
    });

    ToastHelper.makeToast(toast, "Sorting applied", "info");
  }, [machinerySort, toast]);

  return (
    <VStack w={"full"} h={"full"}>
      <VStack p={6} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
        <HStack w={"full"}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<FiSearch />} />
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="Search machinery or document"
              value={machinerySearch.searchTerm}
              onChange={(e) =>
                setMachinerySearch((val) => {
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
                  setMachinerySearch({
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
                  setMachinerySearch((val) => {
                    val.doSearch = true;
                    val.searchTerm = val.searchTerm.trim();
                    return { ...val };
                  })
                }
              >
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
          <Select w={"350px"} value={machinerySort} onChange={(e) => setMachinerySort(e.target.value)}>
            <option value="none">Sort by default order</option>
            <option value="uid">Sort by machinery ID</option>
            <option value="modelName">Sort by machinery model</option>
            <option value="type">Sort by machinery type</option>
            <option value="location">Sort by production plant</option>
            <option value="num-documents">Sort by number of documents</option>
          </Select>
        </HStack>
        {machineriesWithDocuments.length > 0 && !loadingMachineries && machineryModels.length > 0 && machineryTypes.length > 0 && (
          <MachineryFilter
            machineryModels={machineryModels}
            machineryTypes={machineryTypes}
            setMachineryFilter={setMachineryFilter}
            onPopoverChange={(popoverId) => setOpenPopoverId(popoverId)}
            callerType="documents"
            maxDashboards={1}
            maxDocuments={maxNumDocuments}
            maxHeads={maxNumHeads}
            companyID={props.companyID!}
          />
        )}
      </VStack>
      {loadingMachineries ? (
        <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"xl"} />
        </VStack>
      ) : (
        <>
          {machineriesWithDocuments
            .filter((machineriesWithDocuments) => machineriesWithDocuments.active)
            .map((machineryWithDocuments) => (
              <MachineryWithDocumentsCard
                key={machineryWithDocuments.uid}
                machineryWithDocuments={machineryWithDocuments}
                highlightTerm={machinerySearch.highlightTerm}
                openPopoverId={openPopoverId}
              />
            ))}
          {machineriesWithDocuments.filter((machineriesWithDocuments) => machineriesWithDocuments.active).length ===
            0 && (
            <HStack w={"full"} h={"200px"} justifyContent={"center"} alignItems={"center"}>
              {machinerySearch.highlightTerm ||
              machineryFilter.models ||
              machineryFilter.types ||
              machineryFilter.numHeads ||
              machineryFilter.numDocuments ? (
                <Text>No matches found</Text>
              ) : (
                <Text>No machineries available</Text>
              )}
            </HStack>
          )}
        </>
      )}
    </VStack>
  );
}
