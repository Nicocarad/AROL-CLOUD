import { Spinner, VStack } from "@chakra-ui/react";
import Machinery from "../../machinery-management/interfaces/Machinery";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import { useState, useEffect } from "react";
import ToastContext from "../../utils/contexts/ToastContext";
import Company from "../../companies/interfaces/Company";
import companyService from "../../services/CompanyService";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import Navigator from "../interfaces/Navigator";
import { ClusterPanel } from "./NavigatorStages/ClusterPanel";
import { CompanyPanel } from "./NavigatorStages/CompanyPanel";
import { MachineryListPanel } from "./NavigatorStages/MachineryListPanel";
import { MachineryPanel } from "./NavigatorStages/MachineryPanel";

interface NavigatorPanelProps {
  machineries: Map<string, Machinery[]>;
  setMachineries: React.Dispatch<
    React.SetStateAction<Map<string, Machinery[]>>
  >;
  machineriesLoading: boolean;
  navigator: Navigator;
  setNavigator: React.Dispatch<React.SetStateAction<Navigator>>;
}

export default function NavigatorPanel(props: NavigatorPanelProps) {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [filteredMachines, setFilteredMachines] = useState<
    Map<string, Machinery[]>
  >(props.machineries);
  const { principal } = useContext(PrincipalContext);

  // Retrive all companies
  useEffect(() => {
    async function getCompanies() {
      if (Number(principal?.companyID) !== 0) return;
      setLoadingCompanies(true);

      try {
        const result: Company[] = await companyService.getCompanies();
        result.sort((a, b) => a.name.localeCompare(b.name));
        const index = result.findIndex((company) => Number(company.id) === 0);
        if (index !== -1) result.splice(index, 1);

        setCompanies(result);
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionWithToast(
          e,
          toast,
          "Companies could not be fetched"
        );
      }
      setLoadingCompanies(false);
    }
    getCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principal]);

  // STAGE CHANGES
  function handleCompanyClicked(companyID: number) {
    const filteredMap = new Map<string, Machinery[]>();
    props.machineries.forEach((value, key) => {
      if (value.filter((el) => el.companyID === companyID).length > 0) {
        filteredMap.set(
          key,
          value.filter((el) => el.companyID === companyID)
        );
      }
    });

    setFilteredMachines(filteredMap);

    props.setNavigator((val) => {
      val.stage = "Cluster Panel";
      val.companyID = companyID;
      return { ...val };
    });
  }

  function handleClusterLocationClicked(clusterLocation: string) {
    props.setNavigator((val) => {
      val.stage = "Machinery List Panel";
      val.clusterLocation = clusterLocation;
      return { ...val };
    });
  }

  function handleMachineryClicked(machineryUID: string) {
    props.setNavigator((val) => {
      val.stage = "Machinery Panel";
      val.machineryUID = machineryUID;
      return { ...val };
    });
  }

  function handleDashboardButtonClicked() {
    if (props.navigator.stage !== "Machinery Panel") return;

    navigate("/machinery/" + props.navigator.machineryUID + "/dashboard", {
      state: {
        companyID: props.navigator.companyID,
        companyName:
          Number(principal!.companyID) === 0
            ? companies.filter(
                (el) => el.id === (props.navigator.companyID || "0")
              )[0].name
            : "",
        machinery: props.machineries
          .get(props.navigator.clusterLocation)!!
          .find((el) => el.uid === props.navigator.machineryUID)!!,
        dashboardName: null,
      },
    });
  }

  function handleDocumentsButtonClicked() {
    if (props.navigator.stage !== "Machinery Panel") return;

    navigate("/machinery/" + props.navigator.machineryUID + "/documents", {
      state: {
        companyID: props.navigator.companyID,
        companyName:
          Number(principal!.companyID) === 0
            ? companies.filter(
                (el) => el.id === (props.navigator.companyID || "0")
              )[0].name
            : "",
        machinery: props.machineries
          .get(props.navigator.clusterLocation)!!
          .find((el) => el.uid === props.navigator.machineryUID)!!,
      },
    });
  }

  function handleBackClicked(stage: string) {
    switch (stage) {
      case "Cluster Panel":
        props.setNavigator((val) => {
          val.stage = "Company Panel";
          return { ...val };
        });
        break;
      case "Machinery List Panel":
        props.setNavigator((val) => {
          val.stage = "Cluster Panel";
          return { ...val };
        });
        break;
      case "Machinery Panel":
        props.setNavigator((val) => {
          val.stage = "Machinery List Panel";
          return { ...val };
        });
        break;
      default:
        props.setNavigator((val) => {
          val.stage = "Company Panel";
          return { ...val };
        });
        break;
    }
  }

  return (
    <VStack
      minW={"300px"}
      maxW={"300px"}
      h={"500px"}
      overflowY={"auto"}
      overflowX={"hidden"}
      justifyContent={"flex-start"}
    >
      {props.navigator.stage === "Company Panel" &&
        Number(principal?.companyID) === 0 &&
        companies.length > 0 &&
        !loadingCompanies && (
          <CompanyPanel
            companies={companies}
            handleCompanyClicked={handleCompanyClicked}
          />
        )}
      {props.machineriesLoading ? (
        <VStack
          w={"full"}
          h={"full"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Spinner size={"xl"} />
        </VStack>
      ) : props.navigator.stage === "Cluster Panel" &&
        props.machineries.size > 0 ? (
        <ClusterPanel
          companyID={props.navigator.companyID}
          machineries={
            Number(principal!.companyID) === 0
              ? filteredMachines
              : props.machineries
          }
          handleBackClicked={handleBackClicked}
          handleClusterLocationClicked={handleClusterLocationClicked}
        />
      ) : props.navigator.stage === "Machinery List Panel" ? (
        <MachineryListPanel
          machineries={
            Number(principal?.companyID) === 0
              ? filteredMachines
              : props.machineries
          }
          navigator={props.navigator}
          handleBackClicked={handleBackClicked}
          handleMachineryClicked={handleMachineryClicked}
        />
      ) : props.navigator.stage === "Machinery Panel" ? (
        <MachineryPanel
          machineries={
            Number(principal!.companyID) === 0
              ? filteredMachines
              : props.machineries
          }
          navigator={props.navigator}
          handleBackClicked={handleBackClicked}
          handleDashboardButtonClicked={handleDashboardButtonClicked}
          handleDocumentsButtonClicked={handleDocumentsButtonClicked}
        />
      ) : (
        <></>
      )}
      {/* {!props.machineriesLoading && props.navigator.stage === "Cluster Panel" && props.machineries.size > 0 && (
        <ClusterPanel
          companyID={props.navigator.companyID}
          machineries={Number(principal!.companyID) === 0 ? filteredMachines : props.machineries}
          handleBackClicked={handleBackClicked}
          handleClusterLocationClicked={handleClusterLocationClicked}
        />
      )}
      {!props.machineriesLoading && props.navigator.stage === "Machinery List Panel" && (
        <MachineryListPanel
          machineries={Number(principal?.companyID) === 0 ? filteredMachines : props.machineries}
          navigator={props.navigator}
          handleBackClicked={handleBackClicked}
          handleMachineryClicked={handleMachineryClicked}
        />
      )}
      {!props.machineriesLoading && props.navigator.stage === "Machinery Panel" && (
        <MachineryPanel
          machineries={Number(principal!.companyID) === 0 ? filteredMachines : props.machineries}
          navigator={props.navigator}
          handleBackClicked={handleBackClicked}
          handleDashboardButtonClicked={handleDashboardButtonClicked}
          handleDocumentsButtonClicked={handleDocumentsButtonClicked}
        />
      )}
      {props.machineriesLoading && (
        <VStack w={"full"} h={"full"} justifyContent={"center"} alignItems={"center"}>
          <Spinner size={"xl"} />
        </VStack>
      )} */}
    </VStack>
  );
}
