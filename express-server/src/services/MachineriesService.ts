import express from "express";
import machineryRepository from "../repositories/MachineriesRepository";
import SensorDataFilters from "../interfaces/SensorDataFilters";
import userRepository from "../repositories/UserRepository";
import Machinery from "../entities/Machinery";
import sensorDataProcessor from "../utils/SensorDataProcessor";
import SensorDataResponse from "../entities/SensorDataResponse";
import sensorDataQueryBuilder from "../utils/SensorDataQueryBuilder";

/* RETRIVE */

async function getAllMachineries(req: express.Request, res: express.Response) {
  const result = await machineryRepository.getAllMachineries();
  if (result) {
    let machineriesMappedByCluster = new Map<string, Machinery[]>();
    result.forEach((machinery) => {
      if (machineriesMappedByCluster.has(machinery.locationCluster))
        machineriesMappedByCluster.get(machinery.locationCluster)!!.push(machinery);
      else machineriesMappedByCluster.set(machinery.locationCluster, [machinery]);
    });
    return res.status(200).json(Object.fromEntries(machineriesMappedByCluster));
  }

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not retrieve machineries",
  });
}

async function getMachineriesByCompanyID(req: express.Request, res: express.Response) {
  const companyID = parseInt(req.params.companyID as string);

  let result = await machineryRepository.getMachineriesByCompanyID(companyID);
  if (result) {
    const roles = req.principal.roles as string[];
    if (!roles) return res.status(400).json({ msg: "Missing user details" });

    const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF", "AROL_ROLE_SUPERVISOR", "AROL_ROLE_OFFICER"];
    if (!roles.some((role) => rolesToCheck.includes(role))) {
      const userMachineries = await userRepository.getAllUserPermissions(req.principal.id);
      if (userMachineries)
        result = result.filter((machinery) => userMachineries.some((el) => el.machineryUID === machinery.uid));
      else return res.status(200).json(new Map());
    }

    let machineriesMappedByCluster = new Map<string, Machinery[]>();
    result.forEach((machinery) => {
      if (machineriesMappedByCluster.has(machinery.locationCluster))
        machineriesMappedByCluster.get(machinery.locationCluster)!!.push(machinery);
      else machineriesMappedByCluster.set(machinery.locationCluster, [machinery]);
    });
    return res.status(200).json(Object.fromEntries(machineriesMappedByCluster));
  }

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not retrieve machineries",
  });
}

async function getMachineryByUID(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.params.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
  if (!roles.some((role) => rolesToCheck.includes(role)) && !userPermissions) return res.sendStatus(403);

  const machineryOwnersip = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnersip) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await machineryRepository.getMachineryByUID(companyID, machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(404).json();
}

async function getMachineryDetails(req: express.Request, res: express.Response) {
  const model_id = req.params.model_id as string;

  const result = await machineryRepository.getMachineryDetails(model_id);
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not retrieve machinery catalogue",
  });
}

async function getSensorsCatalogue(req: express.Request, res: express.Response) {
  const result = await machineryRepository.getSensorsCatalogue();
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not retrieve sensors",
  });
}

async function getMachinerySensors(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.params.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
  if (!roles.some((role) => rolesToCheck.includes(role)) && !userPermissions) return res.sendStatus(403);

  const machineryOwnersip = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnersip) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await machineryRepository.getMachinerySensors(machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not retrieve machinery sensors",
  });
}

async function getMachinerySensorsData(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;
  const sensorFilters = req.body.sensorFilters as SensorDataFilters;

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
  if (!roles.some((role) => rolesToCheck.includes(role)) && !userPermissions) return res.sendStatus(403);

  const machineryOwnersip = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnersip) return res.status(403).json({ msg: "Machinery not owned" });

  const machinery = await machineryRepository.getMachineryByUID(companyID, machineryUID);
  if (!machinery) return res.sendStatus(404);

  const filteredSensorData = await machineryRepository.getMachinerySensorsData(
    machineryUID,
    machinery!!.modelID,
    sensorFilters,
  );
  if (!filteredSensorData)
    return res.status(500).json({
      msg: "Oops! Something went wrong and could not retrieve machinery sensor data",
    });

  const sensors = await machineryRepository.getMachinerySensors(machineryUID);
  if (!sensors)
    return res.status(500).json({
      msg: "Oops! Something went wrong and could not retrieve machinery sensor data",
    });

  try {
    const { numSamplesRequiredPerSensor, displayMinTime, displayMaxTime } =
      sensorDataQueryBuilder.getMinMaxDisplayTimesAndLimits(sensorFilters);

    // Bucket sensor data samples by corresponding sensor name
    const { sensorDataMap, sensorInfoMap, preliminaryCheckForEndOfData, minSampleTime } =
      sensorDataProcessor.groupBySensorName(filteredSensorData, numSamplesRequiredPerSensor, sensors);

    // HORIZONTAL SAMPLE MERGING - bucket samples of same sensor using the corresponding merging strategy (min, max, sum, avg, majority...)
    const binnedSensorDataMap = sensorDataProcessor.binSamples(sensorDataMap, sensorInfoMap);

    // Transform map of sensor data samples indexed by sensor name to array of sensor data
    const sensorDataArray = Array.from(binnedSensorDataMap.entries());

    // VERTICAL BUCKETING + eventual (only for multi-value widgets) AGGREGATIONS
    let sensorData = sensorDataProcessor.bucketVerticallyAndAggregateMultiValue(sensorDataArray, sensorFilters);
    // AGGREGATION FOR SINGLE-VALUE widgets (aggregation for multi-value is done in vertical bucketing)
    sensorData = sensorDataProcessor.aggregateSingleValue(sensorData, sensorFilters, displayMinTime);

    // INSERT MACHINERY OFF PADDING FOR EDGE CASES (in the newest of cache data OR in the beginning of new data)
    //sensorData = sensorDataProcessor.insertMachineryOffPadding(sensorData, sensorFilters)

    // FORMAT SENSOR DATA for OUTPUT to client
    const { cacheSensorData, displaySensorData, newSensorData } = sensorDataProcessor.formatForResponse(
      sensorData,
      sensorFilters,
    );

    let lastBatchOfSensorData: boolean;
    if (preliminaryCheckForEndOfData === "indefinite")
      lastBatchOfSensorData = await machineryRepository.getSingleSensorDataForMachineryBeforeTime(
        sensorFilters,
        minSampleTime,
      );
    else lastBatchOfSensorData = preliminaryCheckForEndOfData === "true";

    const sensorDataResponse = new SensorDataResponse(
      sensorFilters.requestType,
      cacheSensorData,
      displaySensorData,
      newSensorData,
      cacheSensorData.length + displaySensorData.length + newSensorData.length,
      minSampleTime,
      lastBatchOfSensorData,
    );

    return res.status(200).json(sensorDataResponse);
  } catch (e) {
    return res.status(500).json({
      msg: "Oops! Something went wrong and could not retrieve machinery sensor data",
    });
  }
}

/* CREATE */

async function insertMachinery(req: express.Request, res: express.Response) {
  const result = await machineryRepository.insertMachinery(
    req.body.uid,
    req.body.modelID,
    req.body.companyID,
    req.body.geoLocation.x,
    req.body.geoLocation.y,
    req.body.locationCluster,
    req.body.numHeads,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not insert new machinery",
  });
}

async function insertSensor(req: express.Request, res: express.Response) {
  const result = await machineryRepository.insertSensor(
    req.body.name as string,
    req.body.description as string,
    req.body.unit as string,
    req.body.thresholdLow as number,
    req.body.thresholdHigh as number,
    req.body.internalName as string,
    req.body.category as string,
    req.body.type as string,
    req.body.imgFilename === "" ? null : (req.body.imgFilename as string),
    req.body.imgPointerLocation.x === "" ? null : (req.body.imgPointerLocation.x as string),
    req.body.imgPointerLocation.y === "" ? null : (req.body.imgPointerLocation.y as string),
    req.body.bucketingType as string,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not insert new sensor",
  });
}

/* UPDATE */

async function modifyMachinery(req: express.Request, res: express.Response) {
  const result = await machineryRepository.modifyMachinery(
    req.body.uid,
    req.body.companyID,
    req.body.geoLocation.x,
    req.body.geoLocation.y,
    req.body.locationCluster,
    req.body.numHeads,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Oops! Something went wrong and could not modify machinery" });
}

async function modifyMachinerySensors(req: express.Request, res: express.Response) {
  const result = await machineryRepository.modifyMachinerySensors(
    req.body.machineryUID,
    req.body.sensorsToBeAdded,
    req.body.sensorsToBeDeleted,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not update machinery sensors",
  });
}

async function updateSensor(req: express.Request, res: express.Response) {
  const result = await machineryRepository.updateSensor(
    req.body.internalName as string,
    req.body.category as string,
    req.body.name as string,
    req.body.description as string,
    req.body.unit as string,
    req.body.thresholdLow as number,
    req.body.thresholdHigh as number,
    req.body.type as string,
    req.body.bucketingType as string,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not update machinery sensor",
  });
}

async function reassignMachineriesToAROL(req: express.Request, res: express.Response) {
  const result = await machineryRepository.reassignMachineriesToAROL(parseInt(req.body.companyID));
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not reassign machineries",
  });
}

/* DELETE */

async function deleteAllMachineries(req: express.Request, res: express.Response) {
  const result = await machineryRepository.deleteAllMachineries(parseInt(req.params.companyID));
  if (result) return res.status(200).json(result);

  return res.status(500).json({
    msg: "Oops! Something went wrong and could not delete machineries",
  });
}

async function deleteMachineryByUID(req: express.Request, res: express.Response) {
  const result = await machineryRepository.deleteMachineryByUID(req.params.machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Oops! Something went wrong and could not delete machinery" });
}

export default {
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
