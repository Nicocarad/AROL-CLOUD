import {
  Box,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState, useContext } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { type LatLngTuple } from "leaflet";
import Machinery from "../machinery-management/interfaces/Machinery";
import machineryService from "../services/MachineryService";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { useResizeDetector } from "react-resize-detector";
import PrincipalContext from "../utils/contexts/PrincipalContext";

const ReactGridLayout = WidthProvider(RGL);

interface MapMarker {
  position: LatLngTuple;
  label: string;
}

export default function Home() {
  const { principal } = useContext(PrincipalContext);
  const [machineriesLoading, setMachineriesLoading] = useState(false);
  const [machineriesMap, setMachineriesMap] = useState<
    Map<string, Machinery[]>
  >(new Map());
  const [machineriesArray, setMachineriesArray] = useState<Machinery[]>([]);
  const homeGridContainerRef = useRef<HTMLDivElement>(null);
  const { width } = useResizeDetector({
    targetRef: homeGridContainerRef,
    refreshMode: "debounce",
    refreshRate: 500,
  });

  // FETCH HOME DATA
  useEffect(() => {
    async function getHomeData() {
      setMachineriesLoading(true);

      try {
        const machineriesMap = await machineryService.getMachineriesByCompanyID(
          principal!.companyID
        );
        const machineriesArray: Machinery[] = [];
        machineriesMap.forEach((val) => {
          machineriesArray.push(...val);
        });

        setMachineriesArray(machineriesArray);
        setMachineriesMap(machineriesMap);
      } catch (e) {
        console.error(e);
      }

      setMachineriesLoading(false);
    }

    getHomeData();
  }, [principal]);

  // GRID WIDTH
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [width]);

  return (
    <Box ref={homeGridContainerRef} w="full">
      <Heading mb={6}>Home</Heading>
      <ReactGridLayout
        width={1200}
        cols={12}
        rowHeight={Number(principal?.companyID) !== 0 ? 100 : 135}
        autoSize
        useCSSTransforms
      >
        <VStack
          key="plants-map"
          data-grid={{ x: 0, y: 0, w: 12, h: 4, static: true }}
          w="full"
          h="full"
          borderWidth={1}
          borderColor="gray.200"
          bgColor="white"
          rounded="xl"
        >
          <HStack w="full" justifyContent="left" px={3} pt={3}>
            <Heading size="md">
              {Number(principal?.companyID) === 0
                ? "Locations"
                : "Your Machineries"}
            </Heading>
          </HStack>
          <Divider />
          <Box px={2} pb={2} w="full" h="full">
            <MapContainer
              style={{ width: "100%", height: "100%" }}
              center={[44.729519, 8.296058]}
              zoom={13}
              scrollWheelZoom={false}
            >
              {<MapRenderer machineriesMap={machineriesMap} />}
            </MapContainer>
          </Box>
        </VStack>
        {machineriesArray.length > 0 && (
          <VStack
            key="machinery-carousel"
            data-grid={{ x: 0, y: 4, w: 6, h: 3.5, static: true }}
            w="full"
            h="full"
            borderWidth={1}
            borderColor="gray.200"
            bgColor="white"
            rounded="xl"
          >
            <HStack w="full" justifyContent="left" px={3} pt={3}>
              <Heading size="md">Your machineries</Heading>
            </HStack>
            <Divider />
            {machineriesLoading ? (
              <HStack
                w="full"
                h="full"
                justifyContent="center"
                alignItems="center"
              >
                <Spinner size="xl" />
              </HStack>
            ) : machineriesArray.length > 0 ? (
              <Box w="full" h="full">
                <Carousel
                  dynamicHeight={false}
                  interval={5000}
                  autoPlay
                  infiniteLoop
                  showArrows
                >
                  {machineriesArray.map((machinery) => (
                    <MachineryCard key={machinery.uid} machinery={machinery} />
                  ))}
                </Carousel>
              </Box>
            ) : (
              <Box>
                <Text>No machineries available</Text>
              </Box>
            )}
          </VStack>
        )}
      </ReactGridLayout>
    </Box>
  );
}

interface MapPanelProps {
  machineriesMap: Map<string, Machinery[]>;
}

function MapRenderer(props: MapPanelProps) {
  const { machineriesMap } = props;

  const map = useMap();
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  // Update markers when machineries get updated
  // FitBounds of marker
  useEffect(() => {
    const markersArray: MapMarker[] = [];
    machineriesMap.forEach((value, key) => {
      let avgX = 0,
        avgY = 0;
      value.forEach((machinery) => {
        avgX += machinery.geoLocation.x;
        avgY += machinery.geoLocation.y;
      });
      markersArray.push({
        position: [avgX / value.length, avgY / value.length],
        label: `${key} - ${value.length} machineries`,
      });
    });

    setMarkers(markersArray);

    if (markersArray.length > 1)
      map.flyToBounds(
        markersArray.map((el) => el.position),
        { padding: [100, 100], duration: 1.25 }
      );
  }, [machineriesMap, map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker key={marker.label} position={marker.position}>
          <Tooltip permanent>{marker.label}</Tooltip>
        </Marker>
      ))}
    </>
  );
}

interface MachineryCardProps {
  machinery: Machinery;
}

function MachineryCard(props: MachineryCardProps) {
  const { machinery } = props;
  const navigate = useNavigate();

  function navigateToMachinery() {
    navigate(`/machinery/${machinery.uid}`, {
      state: {
        machinery: machinery,
      },
    });
  }

  return (
    <HStack w="full" h="full" justifyContent="center" alignItems="center">
      <Flex>
        <Box
          boxSize="230px"
          mr={12}
          _hover={{
            cursor: "pointer",
          }}
          onClick={navigateToMachinery}
        >
          <Image
            mr={12}
            objectFit="cover"
            boxSize="100%"
            src={require(`./../assets/machineries/${machinery.modelID}.png`)}
          />
        </Box>
      </Flex>
      <Divider orientation="vertical" h="auto" />
      <VStack
        w="max-content"
        h="full"
        justifyContent="left"
        alignItems="start"
        flexWrap="nowrap"
        p={1}
      >
        <Heading
          fontSize="md"
          fontFamily="body"
          color="gray.400"
          whiteSpace="nowrap"
          mx="0!important"
        >
          {machinery.uid}
        </Heading>
        <Heading
          fontSize="2xl"
          fontFamily="body"
          whiteSpace="nowrap"
          mt="0!important"
        >
          {machinery.modelName}
        </Heading>
        <Text
          fontWeight={300}
          color="gray.400"
          whiteSpace="nowrap"
          fontSize="sm"
        >
          Machinery type
        </Text>
        <Text
          color="black"
          fontSize="md"
          whiteSpace="nowrap"
          mt="0!important"
          mb={1}
        >
          {machinery.modelType}
        </Text>
        <Text
          fontWeight={300}
          color="gray.400"
          whiteSpace="nowrap"
          fontSize="sm"
        >
          Number of heads
        </Text>
        <Text
          color="black"
          fontSize="md"
          whiteSpace="nowrap"
          mt="0!important"
          mb={1}
        >
          {machinery.numHeads} heads
        </Text>
        <Text
          fontWeight={300}
          color="gray.400"
          whiteSpace="nowrap"
          fontSize="sm"
        >
          Machinery location
        </Text>
        <Text color="black" whiteSpace="nowrap" mt="0!important" mb={1}>
          {machinery.locationCluster}
        </Text>
      </VStack>
    </HStack>
  );
}
