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
import MachineryWithDashboards from "../interfaces/MachineryWithDashboards";
import machineryService from "../../services/MachineryService";
import Machinery from "../../machinery-management/interfaces/Machinery";
import dashboardService from "../../services/DashboardService";
import ToastContext from "../../utils/contexts/ToastContext";
import { FiSearch, FiX } from "react-icons/fi";
import MachineryWithDashboardsCard from "./MachineryWithDashboardsCard";
import SavedDashboard from "../../machinery/dashboard/interfaces/SavedDashboard";
import permissionChecker from "../../utils/PermissionChecker";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";
import MachineryFilters from "../../filters/interfaces/MachineryFilters";
import MachineryFilter from "../../filters/components/MachineryFilter";

interface MachineryDashboardsPanelProps {
  companyID?: number;
}

export default function MachineryDashboardsPanel(props: MachineryDashboardsPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);
  const [machineriesWithDashboards, setMachineriesWithDashboards] = useState<MachineryWithDashboards[]>([]);
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
  const [maxNumDashboards, setMaxNumDashboards] = useState<number>(1);
  const [maxNumHeads, setMaxNumHeads] = useState<number>(1);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  /* FILTERING  FUNCTIONS */

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

  function foundSearchTerm(machinery: MachineryWithDashboards): boolean {
    if (!machinerySearch.searchTerm) return true;
    const searchTermLower = machinerySearch.searchTerm.toLowerCase();
    return [
      machinery.uid?.toLowerCase(),
      machinery.modelName?.toLowerCase(),
      machinery.modelType?.toLowerCase(),
      machinery.locationCluster?.toLowerCase(),
      ...machinery.dashboards.map((dash) => dash.name.toLowerCase()),
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
    setMachineriesWithDashboards((machineriesWithDashboards) =>
      machineriesWithDashboards.map((machineryWithDashboards) => {
        const displayMachineryWithDashboards =
          hasSelectedProperty(machineryWithDashboards.modelName, machineryFilter.models) &&
          hasSelectedProperty(machineryWithDashboards.modelType, machineryFilter.types) &&
          isNumberInRange(machineryWithDashboards.numHeads, machineryFilter.numHeads) &&
          isNumberInRange(machineryWithDashboards.dashboards.length, machineryFilter.numDashboards) &&
          foundSearchTerm(machineryWithDashboards);
        return {
          ...machineryWithDashboards,
          active: displayMachineryWithDashboards,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineryFilter, machinerySearch.doSearch]);

  // LOAD MACHINERIES & CORRESPONDING DASHBOARDS
  useEffect(() => {
    if (machinerySort !== "none" || machineriesWithDashboards.length !== 0) return;

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

        const machineriesWithDashboardsArray: MachineryWithDashboards[] = [];
        for (const machinery of machineriesArray) {
          if (permissionChecker.hasMachineryPermission(principal, machinery.uid, "dashboardsRead")) {
            let dashboards: SavedDashboard[] = [];
            try {
              dashboards = await dashboardService.getDashboards(machinery.uid);
            } catch (e) {
              axiosExceptionHandler.handleAxiosExceptionWithToast(
                e,
                toast,
                "Dashboards for machinery with id " + machinery.uid + " could not be fetched",
              );
            }

            machineriesWithDashboardsArray.push({
              ...machinery,
              active: true,
              dashboards: dashboards,
            });
          }
        }
        if (machineriesWithDashboards.length > 0) {
          setMachineriesWithDashboards(machineriesWithDashboardsArray);
          setMachinerySearch((val) => {
            val.doSearch = true;
            return { ...val };
          });
          setLoadingMachineries(false);
        } else setMachineriesWithDashboards(machineriesWithDashboardsArray);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Dashboards could not be fetched");
      }

      setLoadingMachineries(false);
    }
    getMachineriesAndDashboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [machineriesWithDashboards.length, machinerySort, principal, props.companyID]);

  // LOAD MACHINERY CATALOGUE
  useEffect(() => {
    if (loadingMachineries) return;
    async function getMachineryDetails() {
      try {
        const results = await Promise.all(
          machineriesWithDashboards.map((machinery) => machineryService.getMachineryDetails(machinery.modelID)),
        );
        const { mTypes, mModels, maxHead, maxDash } = results.reduce(
          (acc, machineryCatalogue, index) => {
            if (!acc.mModels.includes(machineryCatalogue.name)) {
              acc.mModels.push(machineryCatalogue.name);
            }
            if (!acc.mTypes.includes(machineryCatalogue.type)) {
              acc.mTypes.push(machineryCatalogue.type);
            }
            acc.maxHead = Math.max(acc.maxHead, machineriesWithDashboards[index].numHeads);
            acc.maxDash = Math.max(acc.maxDash, machineriesWithDashboards[index].dashboards.length);
            return acc;
          },
          { mTypes: [], mModels: [], maxHead: 0, maxDash: 0 },
        );
        setMaxNumDashboards(maxDash === 0 ? 1 : maxDash);
        setMaxNumHeads(maxHead === 0 ? 1 : maxHead);
        setMachineryModels(mModels);
        setMachineryTypes(mTypes);
      } catch (e) {
        axiosExceptionHandler.handleAxiosExceptionWithToast(e, toast, "Machinery catalogue could not be fetched");
      }
    }
    getMachineryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMachineries, machineriesWithDashboards.length]);

  // HANDLE SORT
  useEffect(() => {
    if (machinerySort === "none") return;

    setMachineriesWithDashboards((machineries) => {
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
              placeholder="Search machinery or dashboard"
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
            <option value="num-dashboards">Sort by number of dashboards</option>
          </Select>
        </HStack>

        {machineriesWithDashboards.length > 0 && !loadingMachineries && machineryModels.length > 0 && machineryTypes.length > 0 && (
          <MachineryFilter
            machineryModels={machineryModels}
            machineryTypes={machineryTypes}
            setMachineryFilter={setMachineryFilter}
            onPopoverChange={(popoverId) => setOpenPopoverId(popoverId)}
            callerType="dashboards"
            maxDashboards={maxNumDashboards}
            maxDocuments={1}
            maxHeads={maxNumHeads}
            companyID={props.companyID!}
          />
        )}
      </VStack>
      {props.companyID === 0 && (
        <HStack w={"full"} mb={5}>
          <Alert status="warning" variant={"left-accent"} rounded={"md"}>
            <AlertIcon />
            <AlertTitle>Important information:</AlertTitle>
            This is a sumup view of AROL machineries, since they are no longer active you cannot create or see any
            dashboard
          </Alert>
        </HStack>
      )}
      {loadingMachineries ? (
        <VStack w={"full"} h={"300px"} justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"xl"} />
        </VStack>
      ) : (
        <>
          {machineriesWithDashboards
            .filter((machineryWithDashboards) => machineryWithDashboards.active)
            .map((machineryWithDashboards) => (
              <MachineryWithDashboardsCard
                companyID={props.companyID}
                key={machineryWithDashboards.uid}
                machineryWithDashboards={machineryWithDashboards}
                highlightTerm={machinerySearch.highlightTerm}
                openPopoverId={openPopoverId}
              />
            ))}

          {machineriesWithDashboards.filter((machineryWithDashboards) => machineryWithDashboards.active).length ===
            0 && (
            <HStack w={"full"} h={"200px"} justifyContent={"center"} alignItems={"center"}>
              {machinerySearch.highlightTerm ||
              machineryFilter.models ||
              machineryFilter.types ||
              machineryFilter.numHeads ||
              machineryFilter.numDashboards ? (
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
