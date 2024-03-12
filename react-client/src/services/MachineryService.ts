import axios from "../utils/AxiosInterceptor";
import Machinery from "../machinery-management/interfaces/Machinery";
import Sensor from "../machinery/dashboard/models/Sensor";
import SensorDataFilters from "../machinery/dashboard/interfaces/SensorDataFilters";
import SensorDataContainer from "../machinery/dashboard/interfaces/SensorDataContainer";

interface NewMachinery {
  uid: string;
  companyID: number;
  modelID: string;
  geoLocation: { x: number; y: number };
  locationCluster: string;
  numHeads: number;
}

/* RETRIVE */

// [CLIENT] -- Retrive all machineries
async function getAllMachineries(): Promise<Map<string, Machinery[]>> {
  const response = await axios.get<Map<string, Machinery[]>>("/machinery/all");
  if (response.status === 200) return new Map(Object.entries(response.data));

  throw response.data;
}

// [CLIENT] -- Retrive all machineries belonging to a specific company
async function getMachineriesByCompanyID(companyID: number | null): Promise<Map<string, Machinery[]>> {
  const response = await axios.get<Map<string, Machinery[]>>("/machinery/all/" + companyID);
  if (response.status === 200) return new Map(Object.entries(response.data));

  throw response.data;
}

// [CLIENT] -- Retrive a specific machinery by its UID
async function getMachineryByUID(machineryUID: string): Promise<Machinery> {
  const response = await axios.get<Machinery>("/machinery/" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Retrive the details of a specific machinery by its UID
async function getMachineryDetails(model_id: string): Promise<any> {
  const response = await axios.get<any>("/machinery/details/" + model_id);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Retrive all the sensors
async function getSensorsCatalogue(): Promise<Sensor[]> {
  const response = await axios.get<Sensor[]>("/machinery/sensors/all");
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Retrive the sensors of a specific machinery
async function getMachinerySensors(machineryUID: string): Promise<Sensor[]> {
  const response = await axios.get<Sensor[]>("/machinery/sensors/" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Retrive the sensors data of a specific machinery
async function getMachinerySensorsData(
  machineryUID: string,
  sensorFilters: SensorDataFilters,
): Promise<SensorDataContainer> {
  const response = await axios.post<SensorDataContainer>("/machinery/sensors/data/?machineryUID=" + machineryUID, {
    sensorFilters: sensorFilters,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* CREATE */

// [CLIENT] -- Insert a new machinery
async function insertMachinery(newMachinery: NewMachinery): Promise<Machinery> {
  const response = await axios.post("/machinery/insert", {
    uid: newMachinery.uid.toUpperCase(),
    modelID: newMachinery.modelID,
    companyID: newMachinery.companyID,
    geoLocation: {
      x: newMachinery.geoLocation.x,
      y: newMachinery.geoLocation.y,
    },
    locationCluster: newMachinery.locationCluster,
    numHeads: newMachinery.numHeads,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Insert a new sensor
async function insertSensor(sensor: Sensor): Promise<boolean> {
  const response = await axios.post("/machinery/sensors/insert/", {
    ...sensor,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* UPDATE */

// [CLIENT] -- Modify an existing machinery
async function modifyMachinery(editedMachinery: NewMachinery): Promise<Machinery> {
  const response = await axios.post("/machinery/modify", {
    uid: editedMachinery.uid.toUpperCase(),
    modelID: editedMachinery.modelID,
    companyID: editedMachinery.companyID,
    geoLocation: {
      x: editedMachinery.geoLocation ? editedMachinery.geoLocation.x : null,
      y: editedMachinery.geoLocation ? editedMachinery.geoLocation.y : null,
    },
    locationCluster: editedMachinery.locationCluster,
    numHeads: editedMachinery.numHeads,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Modify the sensors of a specific machinery
async function modifyMachinerySensors(
  machineryUID: string,
  sensorsToBeAdded: Sensor[],
  sensorsToBeDeleted: Sensor[],
): Promise<boolean> {
  const response = await axios.post<boolean>("/machinery/sensors/modify", {
    machineryUID: machineryUID,
    sensorsToBeAdded: sensorsToBeAdded,
    sensorsToBeDeleted: sensorsToBeDeleted,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Reassign all machineries to a specific AROL
async function reassignMachineriesToAROL(companyID: number): Promise<boolean> {
  const response = await axios.put<boolean>("/machinery/reassign", {
    companyID,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Modify a single sensor in sensor catalogue
async function updateSensor(
  internalName: string,
  category: string,
  name: string,
  description: string,
  unit: string,
  thresholdLow: number | null,
  thresholdHigh: number | null,
  type: string,
  bucketingType: string,
): Promise<boolean> {
  const response = await axios.post<boolean>("/machinery/sensor/update", {
    internalName,
    category,
    name,
    description,
    unit,
    thresholdLow,
    thresholdHigh,
    type,
    bucketingType,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* DELETE */

// [CLIENT] -- Delete all machineries belonging to a specific company
async function deleteAllMachineries(companyID: number): Promise<boolean> {
  const response = await axios.delete<boolean>("/machinery/delete/all/" + companyID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Delete a specific machinery by its UID
async function deleteMachineryByUID(machineryUID: string): Promise<Machinery> {
  const response = await axios.delete("/machinery/delete/" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

const machineryService = {
  getAllMachineries,
  getMachineriesByCompanyID,
  getMachineryByUID,
  getMachineryDetails,
  getSensorsCatalogue,
  getMachinerySensors,
  getMachinerySensorsData,
  insertMachinery,
  insertSensor,
  modifyMachinery,
  modifyMachinerySensors,
  updateSensor,
  reassignMachineriesToAROL,
  deleteAllMachineries,
  deleteMachineryByUID,
};

export default machineryService;
