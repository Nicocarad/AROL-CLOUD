import Machinery from "../entities/Machinery";
import pgClient from "../configs/PgClient";
import Sensor from "../entities/Sensor";
import SensorDataFilters from "../interfaces/SensorDataFilters";
import sensorDataQueryBuilder from "../utils/SensorDataQueryBuilder";
import SensorDataSample from "../interfaces/SensorDataSample";
import mongoClient from "../configs/MongoClient";
import { Document } from "mongodb";
import constants from "../utils/Constants";

/* RETRIVE */

async function getAllMachineries(): Promise<Machinery[] | null> {
  try {
    const result = await pgClient.result(
      "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE CM.machinery_model_id=MC.model_id",
    );

    if (result)
      return result.rows.map(
        (row: any) =>
          new Machinery(
            row.machinery_uid,
            row.company_id,
            row.machinery_model_id,
            row.name,
            row.type,
            row.geo_location,
            row.location_cluster,
            row.num_heads,
          ),
      );

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getMachineriesByCompanyID(companyID: number): Promise<Machinery[] | null> {
  try {
    const result = await pgClient.result(
      "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE company_id=$1 AND CM.machinery_model_id=MC.model_id",
      companyID,
    );

    if (result)
      return result.rows.map(
        (row: any) =>
          new Machinery(
            row.machinery_uid,
            row.company_id,
            row.machinery_model_id,
            row.name,
            row.type,
            row.geo_location,
            row.location_cluster,
            row.num_heads,
          ),
      );

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getMachineryByUID(companyID: number, machineryUID: string): Promise<Machinery | null> {
  try {
    let result;
    if (Number(companyID) === 0)
      result = await pgClient.oneOrNone(
        "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE machinery_uid=$1 AND CM.machinery_model_id=MC.model_id",
        [machineryUID, companyID],
      );
    else
      result = await pgClient.oneOrNone(
        "SELECT * FROM public.company_machineries as CM, public.machineries_catalogue as MC WHERE machinery_uid=$1 AND company_id=$2 AND CM.machinery_model_id=MC.model_id",
        [machineryUID, companyID],
      );
    if (result) {
      return new Machinery(
        result.machinery_uid,
        result.company_id,
        result.machinery_model_id,
        result.name,
        result.type,
        result.geo_location,
        result.location_cluster,
        result.num_heads,
      );
    }

    return null;
  } catch (e) {
    return null;
  }
}

async function getMachineryDetails(model_id: string): Promise<any> {
  try {
    const result = await pgClient.oneOrNone("SELECT * FROM public.machineries_catalogue WHERE model_id=$1", model_id);
    if (!result) return null;

    return result;
  } catch (e) {
    console.error(e);
    throw null;
  }
}

async function getSensorsCatalogue(): Promise<Sensor[] | null> {
  try {
    const result = await pgClient.result("SELECT * FROM public.sensors_catalogue");

    if (result)
      return result.rows.map(
        (row: any) =>
          new Sensor(
            row.sensor_name,
            row.sensor_description,
            row.sensor_unit,
            row.sensor_threshold_low,
            row.sensor_threshold_high,
            row.sensor_internal_name,
            row.sensor_category,
            row.sensor_type,
            row.sensor_bucketing_type,
            row.sensor_img_filename,
            row.sensor_img_pointer_location,
          ),
      );

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getMachinerySensors(machineryUID: string): Promise<Sensor[] | null> {
  try {
    const result = await pgClient.result(
      "SELECT * FROM public.machinery_sensors M JOIN public.sensors_catalogue C ON M.sensor_category = C.sensor_category AND M.sensor_internal_name = C.sensor_internal_name WHERE M.machinery_uid = $1",
      [machineryUID],
    );

    return result.rows.map(
      (row: any) =>
        new Sensor(
          row.sensor_name,
          row.sensor_description,
          row.sensor_unit,
          row.sensor_threshold_low,
          row.sensor_threshold_high,
          row.sensor_internal_name,
          row.sensor_category,
          row.sensor_type,
          row.sensor_bucketing_type,
          row.sensor_img_filename,
          row.sensor_img_pointer_location,
          row.machinery_uid,
          row.sensor_is_head_mounted,
        ),
    );
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getMachinerySensorsData(
  machineryUID: string,
  machineryModelID: string,
  sensorFilters: SensorDataFilters,
): Promise<SensorDataSample[] | null> {
  let { numSamplesRequiredPerSensor, displayMinTime, displayMaxTime } =
    sensorDataQueryBuilder.getMinMaxDisplayTimesAndLimits(sensorFilters);

  let filteredSensorData: SensorDataSample[] = [];

  for (const [key, value] of Object.entries(sensorFilters.sensors)) {
    let singleValueWidgetSensorFoundFlag = false;

    for (const sensorFilter of value) {
      let formattedHeadNumber = String(sensorFilter.headNumber).padStart(2, "0");

      const aggregate = [
        {
          $sort: { first_time: -1 },
        },
        {
          $match: {
            $and: [
              {
                last_time: { $gte: displayMinTime },
              },
              {
                first_time: { $lt: displayMaxTime },
              },
              {
                $or: [
                  {
                    $and: [
                      {
                        folder: { $exists: true },
                      },
                      {
                        folder: "Head_" + formattedHeadNumber,
                      },
                    ],
                  },
                  {
                    $and: [
                      { variable: { $exists: true } },
                      {
                        variable: {
                          $in: [...sensorFilter.sensorNames.map((el) => el.name)],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        // {
        //   $unwind: "$samples",
        // },
        // {
        //   $sort: { "samples.time": -1 },
        // },
        // {
        //   $group: {
        //     _id: "$_id",

        //     samples: { $push: "$samples" },
        //   },
        // },
        {
          $project: {
            _id: 0,
            folder: 1,
            variable: 1,
            samples: {
              $filter: {
                input: "$samples",
                as: "sample",
                cond: {
                  $and: [
                    {
                      $ne: ["$$sample.time", null],
                    },
                    {
                      $gte: ["$$sample.time", displayMinTime],
                    },
                    {
                      $lt: ["$$sample.time", displayMaxTime],
                    },
                    sensorFilter.headNumber > 0
                      ? {
                          $or: [
                            ...sensorFilter.sensorNames.map((sensorName) => ({
                              $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name],
                            })),
                          ],
                        }
                      : {},
                    // {
                    //     $or: [
                    //         {
                    //             $and: [
                    //                 {
                    //                     $ne: ["$folder", undefined]
                    //                 },
                    //                 {
                    //                     $or: [
                    //                         ...sensorFilter.sensorNames.map((sensorName) => ({
                    //                             $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                    //                         }))
                    //                     ]
                    //                 }
                    //             ]
                    //         },
                    //         {
                    //             $ne: ["$variable", undefined]
                    //         }
                    //     ]
                    // }
                  ],
                },
                //limit: limit
              },
            },
          },
        },
      ];

      let queryResults = mongoClient.db("arol").collection(key).aggregate(aggregate);

      await queryResults.forEach((queryResultObject: Document) => {
        if (queryResultObject["folder"]) {
          // if (sensorFilters.dataRange.unit === "sample") {
          //     samplesArray.push(...queryResultObject.samples)
          // } else {
          filteredSensorData.push(...queryResultObject.samples);
          // }
        } else if (queryResultObject["variable"]) {
          // if (sensorFilters.dataRange.unit === "sample") {
          //     samplesArray.push(...queryResultObject.samples.map((el: any) => ({
          //         name: queryResultObject.variable,
          //         value: el.value,
          //         time: el.time
          //     })))
          // } else {
          filteredSensorData.push(
            ...queryResultObject.samples.map((el: any) => ({
              name: queryResultObject.variable,
              value: el.value,
              time: el.time,
            })),
          );
          // }
        }
      });

      // If single value widget, query only sensor data of first sensor
      if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
        singleValueWidgetSensorFoundFlag = true;
        break;
      }
    }

    // If single value widget, query only sensor data of first sensor
    if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE && singleValueWidgetSensorFoundFlag) break;
  }

  return filteredSensorData.map((el) => {
    if (sensorFilters.requestType === constants.REQUESTTYPE_NEW) {
      if (!["OperationState", "Alarm", "OperationMode", "ProductionSpeed", "TotalProduct"].includes(el.name)) {
        el.value =
          el.value +
          el.value *
            /*sign*/ (Math.round(Math.random()) * 2 - 1) *
            /*random between 0.01 and 0.4*/ ((Math.floor(Math.random() * 15) + 1) / 100);
      }
      if (el.name === "Alarm") el.value = 0;
      if (el.name === "ProductionSpeed") el.value = 46800;
      if (el.name === "TotalProduct") el.value = el.value + el.value * ((Math.floor(Math.random() * 10) + 1) / 100);
      el.time = Date.now() - 3944700000 + 43200000;
    }
    el.value = +el.value.toFixed(2);

    return el;
  });
}

/* CREATE */

async function insertMachinery(
  machinery_uid: string,
  machinery_model_id: string,
  company_id: number,
  geo_locationX: number,
  geo_locationY: number,
  location_cluster: string,
  num_heads: number,
): Promise<Machinery | null> {
  try {
    const query =
      "INSERT INTO public.company_machineries (machinery_uid, machinery_model_id, company_id, geo_location, location_cluster, num_heads) VALUES ($1, $2, $3, POINT($4, $5), $6, $7) RETURNING *";
    const values = [
      machinery_uid,
      machinery_model_id,
      company_id,
      geo_locationX,
      geo_locationY,
      location_cluster,
      num_heads,
    ];
    const result = await pgClient.query(query, values);
    if (!result) return null;

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function insertSensor(
  sensor_name: string,
  sensor_description: string,
  sensor_unit: string,
  sensor_threshold_low: number,
  sensor_threshold_high: number,
  sensor_internal_name: string,
  sensor_category: string,
  sensor_type: string,
  sensor_img_filename: string | null,
  sensor_img_pointer_locationX: string | null,
  sensor_img_pointer_locationY: string | null,
  sensor_bucketing_type: string,
): Promise<boolean> {
  try {
    const result = await pgClient.result(
      "INSERT INTO public.sensors_catalogue (sensor_name, sensor_description, sensor_unit, sensor_threshold_low, sensor_threshold_high, sensor_internal_name, sensor_category, sensor_type, sensor_img_filename, sensor_img_pointer_location, sensor_bucketing_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, POINT($10, $11), $12)",
      [
        sensor_name,
        sensor_description,
        sensor_unit,
        sensor_threshold_low,
        sensor_threshold_high,
        sensor_internal_name,
        sensor_category,
        sensor_type,
        sensor_img_filename,
        sensor_img_pointer_locationX,
        sensor_img_pointer_locationY,
        sensor_bucketing_type,
      ],
    );

    return result.rowCount > 0;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/* UPDATE */

async function reassignMachineriesToAROL(companyID: number): Promise<boolean> {
  try {
    const result = await pgClient.result(
      "UPDATE public.company_machineries SET company_id=0, location_cluster='unassigned', geo_location=POINT(NULL, NULL) WHERE company_id=$1",
      [companyID],
    );
    if (!result) throw new Error(`Error in reassignment of ${companyID} machineries to AROL`);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function modifyMachinery(
  machinery_uid: string,
  company_id: number,
  geo_locationX: number,
  geo_locationY: number,
  location_cluster: string,
  num_heads: number,
): Promise<boolean> {
  try {
    const result = await pgClient.query(
      "UPDATE public.company_machineries SET company_id=$1, geo_location=POINT($2, $3), location_cluster=$4, num_heads=$5 WHERE machinery_uid=$6",
      [company_id, geo_locationX, geo_locationY, location_cluster, num_heads, machinery_uid],
    );
    if (!result) throw new Error(`Error in updating machinery ${machinery_uid}`);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function modifyMachinerySensors(
  machineryUID: string,
  sensorsToBeAdded: Sensor[],
  sensorsToBeDeleted: Sensor[],
): Promise<boolean | undefined> {
  try {
    if (sensorsToBeAdded.length > 0)
      sensorsToBeAdded.forEach(async (sensor) => {
        await pgClient.query(
          "INSERT INTO public.machinery_sensors (machinery_uid, sensor_category, sensor_internal_name, is_head_mounted) VALUES ($1, $2, $3, false)",
          [machineryUID, sensor.category, sensor.internalName],
        );
      });

    if (sensorsToBeDeleted.length > 0)
      sensorsToBeDeleted.forEach(async (sensor) => {
        await pgClient.query(
          "DELETE FROM public.machinery_sensors WHERE machinery_uid=$1 AND sensor_internal_name=$2 AND sensor_category=$3",
          [machineryUID, sensor.internalName, sensor.category],
        );
      });

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function updateSensor(
  internalName: string,
  category: string,
  name: string,
  description: string,
  unit: string,
  thresholdLow: number,
  thresholdHigh: number,
  type: string,
  bucketingType: string,
): Promise<boolean> {
  try {
    await pgClient.query(
      "UPDATE public.sensors_catalogue SET sensor_name=$1, sensor_description=$2, sensor_unit=$3, sensor_threshold_low=$4, sensor_threshold_high=$5, sensor_type=$6, sensor_bucketing_type=$7 WHERE sensor_internal_name=$8 AND sensor_category=$9",
      [name, description, unit, thresholdLow, thresholdHigh, type, bucketingType, internalName, category],
    );

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/* DELETE */

async function deleteAllMachineries(company_id: number): Promise<boolean> {
  try {
    const machineryUIDs = await pgClient.map(
      "SELECT machinery_uid FROM public.company_machineries WHERE company_id=$1",
      [company_id],
      (row: { machinery_uid: string }) => row.machinery_uid,
    );

    await pgClient.result("DELETE FROM public.company_machineries WHERE company_id=$1", [company_id]);

    if (machineryUIDs.length > 0)
      await mongoClient
        .db("arol")
        .collection("dashboards")
        .deleteMany({
          machineryUID: { $in: machineryUIDs },
        });

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function deleteMachineryByUID(machineryUID: string): Promise<boolean> {
  try {
    const pgResult = await pgClient.result("DELETE FROM public.company_machineries WHERE machinery_uid=$1", [
      machineryUID,
    ]);

    if (pgResult.rowCount === 0) throw "Company has no machinery with UID " + machineryUID;

    await mongoClient.db("arol").collection("dashboards").deleteMany({ machineryUID: machineryUID });

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

/* UTILITY */

async function verifyMachineryOwnershipByUID(machineryUID: string, companyID: number | null): Promise<Boolean> {
  if (!companyID || companyID === 0) return true;

  try {
    const checkCompany = await pgClient.one(
      "SELECT COUNT(*) FROM public.company_machineries WHERE company_id=$1 AND machinery_uid=$2",
      [companyID, machineryUID],
    );

    if (checkCompany.count === 0) throw "Company " + companyID + " has no machinery with UID " + machineryUID;

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function verifyMachineryUserPermission(userID: number | null): Promise<Boolean> {
  if (!userID) return true;

  try {
    const checkUserPermission = await pgClient.one(
      "SELECT COUNT(*) FROM public.machinery_permissions WHERE user_id=$1",
      userID,
    );
    if (checkUserPermission.count === 0) throw "User " + userID + " has no machinery permissions registered";

    return false;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function verifyMachineryOwnershipByModelID(modelID: string, companyID: number | null): Promise<Boolean> {
  if (!companyID) return true;

  try {
    const checkCompany = await pgClient.one(
      "SELECT COUNT(*) FROM public.company_machineries WHERE company_id=$1 AND machinery_model_id=$2",
      [companyID, modelID],
    );

    if (checkCompany.count === 0) throw "Company " + companyID + " has no machinery with Model ID " + modelID;

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function isEndOfSensorDataForMachinery(
  sensorFilters: SensorDataFilters,
  minSampleTime: number,
): Promise<boolean> {
  let endOfData = true;

  for (const [key, value] of Object.entries(sensorFilters.sensors)) {
    let singleValueWidgetSensorFoundFlag = false;

    for (const sensorFilter of value) {
      const formattedHeadNumber = String(sensorFilter.headNumber).padStart(2, "0");

      const aggregate = [
        {
          $sort: { first_time: -1 },
        },
        {
          $match: {
            $and: [
              {
                first_time: { $lt: minSampleTime },
              },
              {
                $or: [
                  {
                    $and: [
                      {
                        folder: { $exists: true },
                      },
                      {
                        folder: "Head_" + formattedHeadNumber,
                      },
                    ],
                  },
                  {
                    $and: [
                      { variable: { $exists: true } },
                      {
                        variable: {
                          $in: [...sensorFilter.sensorNames.map((el) => el.name)],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        // {
        //   $unwind: "$samples",
        // },
        // {
        //   $sort: { "samples.time": -1 },
        // },
        // {
        //   $group: {
        //     _id: "$_id",

        //     samples: { $push: "$samples" },
        //   },
        // },
        {
          $project: {
            _id: 0,
            folder: 1,
            variable: 1,
            samples: {
              $filter: {
                input: "$samples",
                as: "sample",
                cond: {
                  $and: [
                    {
                      $ne: ["$$sample.time", null],
                    },
                    {
                      $lt: ["$$sample.time", minSampleTime],
                    },
                    sensorFilter.headNumber > 0
                      ? {
                          $or: [
                            ...sensorFilter.sensorNames.map((sensorName) => ({
                              $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name],
                            })),
                          ],
                        }
                      : {},
                    // {
                    //     $or: [
                    //         {
                    //             $and: [
                    //                 {
                    //                     $ne: ["$folder", undefined]
                    //                 },
                    //                 {
                    //                     $or: [
                    //                         ...sensorFilter.sensorNames.map((sensorName) => ({
                    //                             $eq: ["$$sample.name", "H" + formattedHeadNumber + "_" + sensorName.name]
                    //                         }))
                    //                     ]
                    //                 }
                    //             ]
                    //         },
                    //         {
                    //             $ne: ["$variable", undefined]
                    //         }
                    //     ]
                    // }
                  ],
                },
                //limit: limit
              },
            },
          },
        },
        // {
        //     $limit: 1
        // }
      ];

      const queryResults = mongoClient.db("arol").collection(key).aggregate(aggregate);

      await queryResults.forEach((queryResultObject: Document) => {
        endOfData = false;
      });

      //If single value widget, query only sensor data of first sensor
      if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE) {
        singleValueWidgetSensorFoundFlag = true;
        break;
      }

      if (!endOfData) {
        break;
      }
    }

    //If single value widget, query only sensor data of first sensor
    if (sensorFilters.widgetCategory === constants.WIDGETTYPE_SINGLE && singleValueWidgetSensorFoundFlag) {
      break;
    }

    if (!endOfData) {
      break;
    }
  }

  return endOfData;
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
  getSingleSensorDataForMachineryBeforeTime: isEndOfSensorDataForMachinery,
  verifyMachineryOwnershipByModelID,
  verifyMachineryOwnershipByUID,
  verifyMachineryUserPermission,
};
