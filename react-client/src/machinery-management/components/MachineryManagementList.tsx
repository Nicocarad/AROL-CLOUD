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
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import MachineryWithDashsAndDocs from "../interfaces/MachineryWithDashsAndDocs";
import machineryService from "../../services/MachineryService";
import Machinery from "../interfaces/Machinery";
import dashboardService from "../../services/DashboardService";
import ToastContext from "../../utils/contexts/ToastContext";
import { FiSearch, FiX } from "react-icons/fi";
import SavedDashboard from "../../machinery/dashboard/interfaces/SavedDashboard";
import permissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import AxiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import FileMap from "../../machinery/documents/interfaces/FileMap";
import documentsService from "../../services/DocumentService";
import FileMapEntry from "../../machinery/documents/interfaces/FileMapEntry";
import MachineryManagementCard from "./MachineryManagementCard";
import MachineryFilters from "../../filters/interfaces/MachineryFilters";
import MachineryFilter from "../../filters/components/MachineryFilter";
import MachineryForm from "./MachineryForm";
import PermissionChecker from "../../utils/PermissionChecker";

interface MachineryDashboardsPanelProps {
  companyID: number;
  companyName: string;
}

export default function MachineryDashboardsPanel(props: MachineryDashboardsPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);
  // Loading state
  const [loadingMachineries, setLoadingMachineries] = useState<boolean>(true);
  // Machinery data
  const [machineriesWithDashsAndDocs, setMachineriesWithDashsAndDocs] = useState<MachineryWithDashsAndDocs[]>([]);
  const [machineryModels, setMachineryModels] = useState<string[]>([]);
  const [machineryTypes, setMachineryTypes] = useState<string[]>([]);
  // Machinery search and sort
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
  // Machinery filters
  const [machineryFilter, setMachineryFilter] = useState<MachineryFilters>({});
  // Maximum values
  const [maxNumDashboards, setMaxNumDashboards] = useState<number>(1);
  const [maxNumDocuments, setMaxNumDocuments] = useState<number>(1);
  const [maxNumHeads, setMaxNumHeads] = useState<number>(1);
  // UI state
  const [openIndex, setOpenIndex] = useState<any>(undefined);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [fetchData, setFetchData] = useState<boolean>(true);

  /* FILTERING  FUNCTIONS */

  function hasSelectedProperty(machineryProp: string, filter: { [key: string]: boolean } | undefined): boolean {
    return !filter || Object.keys(filter).some((key) => filter[key] && machineryProp.includes(key));
  }

  function isNumberInRange(numToCheck: number, filter: { min: number; max: number } | undefined): boolean {
    if (!filter) return true;
    const { min = -Infinity, max = Infinity } = filter;
    return numToCheck >= min && numToCheck <= max;
  }

  function foundSearchTerm(machinery: MachineryWithDashsAndDocs): boolean {
    if (!machinerySearch.searchTerm) return true;

    const searchTermLower = machinerySearch.searchTerm.toLowerCase();

    const dashboardNames = machinery.dashboards.map((dash) => dash.name.toLowerCase());
    const documentNames = machinery.documents.map((doc) => doc.name.toLowerCase());

    const dashboardFound = dashboardNames.some((name) => name.includes(searchTermLower));
    const documentFound = documentNames.some((name) => name.includes(searchTermLower));

    if (dashboardFound || documentFound)
      setOpenIndex(
        dashboardFound && documentFound
          ? [0, 1]
          : dashboardFound
          ? [0, undefined]
          : documentFound
          ? [undefined, 1]
          : undefined,
      );

    return [
      machinery.uid?.toLowerCase(),
      machinery.modelName?.toLowerCase(),
      machinery.modelType?.toLowerCase(),
      machinery.locationCluster?.toLowerCase(),
      ...dashboardNames,
      ...documentNames,
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

    setMachineriesWithDashsAndDocs((machineriesWithDashsAndDocs) =>
      machineriesWithDashsAndDocs.map((machineryWithDashsAndDocs) => {
        const isModel = hasSelectedProperty(machineryWithDashsAndDocs.modelName, machineryFilter.models);
        const isType = hasSelectedProperty(machineryWithDashsAndDocs.modelType, machineryFilter.types);
        const hasNumHeads = isNumberInRange(machineryWithDashsAndDocs.numHeads, machineryFilter.numHeads);
        const hasNumDashs = isNumberInRange(machineryWithDashsAndDocs.dashboards.length, machineryFilter.numDashboards);
        const hasNumDocs = isNumberInRange(machineryWithDashsAndDocs.documents.length, machineryFilter.numDocuments);
        const foundTerm = foundSearchTerm(machineryWithDashsAndDocs);

        return {
          ...machineryWithDashsAndDocs,
          active: isModel && isType && hasNumHeads && hasNumDashs && hasNumDocs && foundTerm,
        };
      }),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineryFilter, machinerySearch.doSearch]);

  // LOAD MACHINERIES & CORRESPONDING DASHBOARDS AND DOCUMENTS
  useEffect(() => {
    if (machinerySort !== "none" || !fetchData) return;

    async function getMachineriesAndDashboards() {
      setLoadingMachineries(true);

      try {
        const machineriesMap = await machineryService.getMachineriesByCompanyID(
          props.companyID ? props.companyID : principal!.companyID,
        );
        const machineriesArray: Machinery[] = [];
        machineriesMap.forEach((val) => {
          machineriesArray.push(...val);
        });

        const machineriesWithDashsAndDocsArray: MachineryWithDashsAndDocs[] = [];
        for (const machinery of machineriesArray) {
          let dashboards: SavedDashboard[] = [];
          let documents: FileMapEntry[] = [];
          if (permissionChecker.hasMachineryPermission(principal, machinery.uid, "dashboardsRead")) {
            try {
              dashboards = await dashboardService.getDashboards(machinery.uid);
            } catch (e) {
              console.log(e);
              AxiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                "Dashboards for machinery with id " + machinery.uid + " could not be fetched",
              );
            }
          }
          if (permissionChecker.hasMachineryPermission(principal, machinery.uid, "documentsRead")) {
            let fileMap: FileMap = {};

            try {
              fileMap = (await documentsService.getMachineryDocuments(machinery.uid)).fileMap as FileMap;
              Object.values(fileMap).forEach((fileMapEntry: FileMapEntry) => {
                if (!fileMapEntry.isDir) documents.push(fileMapEntry);
              });
            } catch (e) {
              console.log(e);
              AxiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                "Documents for machinery with id " + machinery.uid + " could not be fetched",
              );
            }
          }
          machineriesWithDashsAndDocsArray.push({
            ...machinery,
            active: true,
            dashboards: dashboards,
            documents: documents.sort((a, b) => (a.id > b.id ? 1 : -1)),
          });
        }

        if (machineriesWithDashsAndDocs.length > 0) {
          setMachineriesWithDashsAndDocs(machineriesWithDashsAndDocsArray);
          setMachinerySearch((val) => {
            val.doSearch = true;
            return { ...val };
          });
          setLoadingMachineries(false);
        } else setMachineriesWithDashsAndDocs(machineriesWithDashsAndDocsArray);
      } catch (e) {
        console.log(e);
        AxiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          "Dashboards and/or documents could not be fetched",
        );
      }

      setLoadingMachineries(false);
      setFetchData(false);
    }
    getMachineriesAndDashboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineriesWithDashsAndDocs, machinerySort, principal, props.companyID, fetchData]);

  // LOAD MACHINERY CATALOGUE
  useEffect(() => {
    if (loadingMachineries) return;
    async function getMachineryDetails() {
      try {
        const results = await Promise.all(
          machineriesWithDashsAndDocs.map((machinery) => machineryService.getMachineryDetails(machinery.modelID)),
        );
        const { mTypes, mModels, maxHead, maxDash, maxDocs } = results.reduce(
          (acc, machineryCatalogue, index) => {
            if (!acc.mModels.includes(machineryCatalogue.name)) {
              acc.mModels.push(machineryCatalogue.name);
            }
            if (!acc.mTypes.includes(machineryCatalogue.type)) {
              acc.mTypes.push(machineryCatalogue.type);
            }
            acc.maxHead = Math.max(acc.maxHead, machineriesWithDashsAndDocs[index].numHeads);
            acc.maxDash = Math.max(acc.maxDash, machineriesWithDashsAndDocs[index].dashboards.length);
            acc.maxDocs = Math.max(acc.maxDocs, machineriesWithDashsAndDocs[index].documents.length);
            return acc;
          },
          { mTypes: [], mModels: [], maxHead: 0, maxDash: 0, maxDocs: 0 },
        );
        setMaxNumDashboards(maxDash === 0 ? 1 : maxDash);
        setMaxNumDocuments(maxDocs === 0 ? 1 : maxDocs);
        setMaxNumHeads(maxHead === 0 ? 1 : maxHead);
        setMachineryModels(mModels);
        setMachineryTypes(mTypes);
      } catch (e) {
        AxiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Machinery catalogue could not be fetched");
      }
    }
    getMachineryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMachineries, machineriesWithDashsAndDocs.length]);

  // HANDLE SORT
  useEffect(() => {
    if (machinerySort === "none") return;

    setMachineriesWithDashsAndDocs((machineries) => {
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
          case "num-dashboards": {
            return b.dashboards.length - a.dashboards.length;
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
      {PermissionChecker.isArolSupervisorOrAbove(principal) && (
        <>
          <VStack px={6} py={2} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
            <HStack w={"full"} justifyContent={"space-between"}>
              <Text>Looking to create a new machinery?</Text>
              <MachineryForm
                setFetchData={setFetchData}
                operationType="create"
                machinery={{
                  uid: "",
                  companyID: props.companyID!,
                  modelID: "",
                  modelName: "",
                  modelType: "",
                  geoLocation: { x: Number(""), y: Number("") },
                  locationCluster: "",
                  numHeads: Number(""),
                }}
              />
            </HStack>
          </VStack>
        </>
      )}
      <VStack p={6} w={"full"} borderWidth={1} borderColor={"gray.200"} bgColor={"white"} rounded={"md"}>
        <HStack w={"full"}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<FiSearch />} />
            <Input
              pr="4.5rem"
              type={"text"}
              placeholder="Search machinery, dashboard or document"
              value={machinerySearch.searchTerm}
              onChange={(e) =>
                setMachinerySearch((val) => ({
                  ...val,
                  searchTerm: e.target.value,
                }))
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
                  setOpenIndex(undefined);
                }}
              >
                <FiX size={18} color={"gray"} />
              </Box>
              <Button
                h="1.75rem"
                size="sm"
                colorScheme={"blue"}
                onClick={() =>
                  setMachinerySearch((val) => ({
                    ...val,
                    doSearch: true,
                    highlightTerm: val.highlightTerm.trim(),
                  }))
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
            <option value="num-dashboards">Sort by number of dashboards</option>
            <option value="num-documents">Sort by number of documents</option>
          </Select>
        </HStack>

        {!loadingMachineries && machineryModels.length > 0 && machineryTypes.length > 0 && (
          <MachineryFilter
            machineryModels={machineryModels}
            machineryTypes={machineryTypes}
            setMachineryFilter={setMachineryFilter}
            onPopoverChange={(popoverId) => setOpenPopoverId(popoverId)}
            callerType="both"
            maxDashboards={maxNumDashboards}
            maxDocuments={maxNumDocuments}
            maxHeads={maxNumHeads}
            companyID={props.companyID!}
          />
        )}
      </VStack>
      {props.companyID === 0 ? (
        <HStack w={"full"} mb={2}>
          <Alert status="warning" variant={"left-accent"} rounded={"md"}>
            <AlertIcon />
            <AlertTitle>Important information:</AlertTitle>
            This is a sumup view of AROL machineries, since they are no longer active you cannot create or see any
            dashboard
          </Alert>
        </HStack>
      ) : (
        <HStack w={"full"}>
          <Alert status="info" variant={"left-accent"} rounded={"md"}>
            <AlertIcon />
            <AlertTitle>Important information:</AlertTitle>
            Changes can take up to 5 minute to fully propagate.
          </Alert>
        </HStack>
      )}

      {loadingMachineries ? (
        <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"xl"} />
        </VStack>
      ) : (
        <>
          {machineriesWithDashsAndDocs
            .filter((machineryWithDashsAndDocs) => machineryWithDashsAndDocs.active)
            .map((machineryWithDashsAndDocs) => (
              <MachineryManagementCard
                companyID={props.companyID}
                companyName={props.companyName}
                key={machineryWithDashsAndDocs.uid}
                machinery={machineryWithDashsAndDocs}
                highlightTerm={machinerySearch.highlightTerm}
                openPopoverId={openPopoverId}
                setFetchData={setFetchData}
                openIndex={openIndex}
              />
            ))}

          {machineriesWithDashsAndDocs.filter((machineryWithDashsAndDocs) => machineryWithDashsAndDocs.active)
            .length === 0 && (
            <HStack w={"full"} h={"200px"} justifyContent={"center"} alignItems={"center"}>
              {machinerySearch.highlightTerm ||
              machineryFilter.models ||
              machineryFilter.types ||
              machineryFilter.numHeads ||
              machineryFilter.numDashboards ||
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
