import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Box } from "@chakra-ui/react";
import Machinery from "../../machinery-management/interfaces/Machinery";
import React, { useEffect, useState, useContext } from "react";
import { LatLngTuple } from "leaflet";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import Navigator from "../interfaces/Navigator";

interface MapPanelProps {
  machineries: Map<string, Machinery[]>;
  setMachineries: React.Dispatch<React.SetStateAction<Map<string, Machinery[]>>>;
  navigator: Navigator;
  setNavigator: React.Dispatch<React.SetStateAction<Navigator>>;
}

interface MapMarker {
  position: LatLngTuple;
  label: string;
}

export default function MapPanel(props: MapPanelProps) {
  return (
    <Box w={"full"}>
      <MapContainer
        style={{ width: "100%", height: "500px" }}
        center={[44.729519, 8.296058]}
        zoom={13}
        scrollWheelZoom={false}
      >
        <MapRenderer {...props} />
      </MapContainer>
    </Box>
  );
}

function MapRenderer(props: MapPanelProps) {
  const { principal } = useContext(PrincipalContext);
  const map = useMap();
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  const calculateAverageCoordinates = (machineries: Machinery[]): LatLngTuple => {
    let avgX = 0,
      avgY = 0;
    machineries.forEach((machinery) => {
      avgX += machinery.geoLocation.x;
      avgY += machinery.geoLocation.y;
    });
    return [avgX / machineries.length, avgY / machineries.length];
  };

  const createMarkers = (machineriesMap: Map<string, Machinery[]>): MapMarker[] => {
    let markersArray: MapMarker[] = [];
    machineriesMap.forEach((value, key) => {
      markersArray.push({
        position: calculateAverageCoordinates(value),
        label: key,
      });
    });
    return markersArray;
  };

  // Update markers when machineries get updated
  useEffect(() => {
    let markersArray: MapMarker[] = [];
    switch (props.navigator.stage) {
      case "Company Panel": {
        markersArray = createMarkers(props.machineries);
        break;
      }
      case "Cluster Panel": {
        let filteredMachineries: Map<string, Machinery[]> = new Map();
        if (Number(principal?.companyID) === 0) {
          props.machineries.forEach((value, key) => {
            let machineryValues = value.filter((el) => el.companyID === props.navigator.companyID);
            if (machineryValues.length > 0) {
              filteredMachineries.set(key, machineryValues);
            }
          });
        } else filteredMachineries = props.machineries;
        markersArray = createMarkers(filteredMachineries);
        break;
      }
      case "Machinery List Panel": {
        props.machineries.get(props.navigator.clusterLocation)!!.forEach((entry) => {
          markersArray.push({
            position: [entry.geoLocation.x, entry.geoLocation.y],
            label: entry.uid,
          });
        });
        break;
      }
      case "Machinery Panel": {
        let machinery = props.machineries
          .get(props.navigator.clusterLocation)!!
          .find((el) => el.uid === props.navigator.machineryUID)!!;
        map.setView([machinery.geoLocation.x, machinery.geoLocation.y]);
        markersArray.push({
          position: [machinery.geoLocation.x, machinery.geoLocation.y],
          label: machinery.uid,
        });
        break;
      }
      default:
        console.error("Bad data");
        return;
    }

    setMarkers(markersArray);
    if (markersArray.length > 1) {
      map.flyToBounds(
        markersArray.map((el) => el.position),
        { padding: [100, 100], duration: 1.5 },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, principal?.companyID, props.machineries, props.navigator]);

  function handleMarkerClick(markerValue: string) {
    if (props.navigator.stage === "Cluster Panel") {
      props.setNavigator((val) => {
        val.stage = "Machinery List Panel";
        val.clusterLocation = markerValue;
        return { ...val };
      });
    } else if (props.navigator.stage === "Machinery List Panel") {
      props.setNavigator((val) => {
        val.stage = "Machinery Panel";
        val.machineryUID = markerValue;
        return { ...val };
      });
    }
  }

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.label}
          position={marker.position}
          eventHandlers={{
            click: () => handleMarkerClick(marker.label),
          }}
        >
          <Tooltip permanent>{marker.label}</Tooltip>
        </Marker>
      ))}
    </>
  );
}
