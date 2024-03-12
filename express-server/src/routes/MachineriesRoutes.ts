import express from "express";
import controller from "../controllers/MachineriesController";
import jwtAuthentication from "../middlewares/JwtAuthentication";
import authorization from "../middlewares/Authorization";
import { body, param, query } from "express-validator";

const router = express.Router();

/* GET */

router.get("/all", jwtAuthentication.authenticateToken, authorization.authorizeRequest, controller.getAllMachineries);

router.get(
  "/all/:companyID",
  param("companyID").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  controller.getMachineriesByCompanyID,
);

router.get(
  "/:machineryUID",
  param("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getMachineryByUID,
);

router.get(
  "/details/:model_id",
  param("model_id").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getMachineryDetails,
);

router.get(
  "/sensors/all",
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.getSensorsCatalogue,
);

router.get(
  "/sensors/:machineryUID",
  param("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getMachinerySensors,
);

/* POST */

router.post(
  "/sensors/data/",
  query("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getMachinerySensorsData,
);

router.post(
  "/insert",
  body("uid").notEmpty(),
  body("modelID").notEmpty(),
  body("companyID").notEmpty().isInt(),
  body("geoLocation.x").notEmpty().isNumeric(),
  body("geoLocation.y").notEmpty().isNumeric(),
  body("locationCluster").notEmpty(),
  body("numHeads").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.insertMachinery,
);

router.post(
  "/sensors/insert",
  body("name").notEmpty(),
  body("description").notEmpty(),
  body("unit").notEmpty(),
  body("thresholdLow").exists(),
  body("thresholdHigh").exists(),
  body("internalName").notEmpty(),
  body("category").notEmpty(),
  body("type").notEmpty(),
  body("bucketingType").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.insertSensor,
);

router.post(
  "/modify",
  body("uid").notEmpty(),
  body("locationCluster").notEmpty().not().equals("unassigned"),
  body("geoLocation.x").notEmpty().isNumeric(),
  body("geoLocation.y").notEmpty().isNumeric(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.modifyMachinery,
);

router.post(
  "/sensors/modify/",
  body("machineryUID").notEmpty(),
  body("sensorsToBeAdded").exists(),
  body("sensorsToBeDeleted").exists(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.modifyMachinerySensors,
);

router.post(
  "/sensor/update/",
  body("internalName").notEmpty(),
  body("category").notEmpty(),
  body("name").notEmpty(),
  body("description").notEmpty(),
  body("unit").notEmpty(),
  body("thresholdLow").exists(),
  body("thresholdHigh").exists(),
  body("type").notEmpty(),
  body("bucketingType").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.updateSensor,
);

/* PUT */

router.put(
  "/reassign",
  body("companyID").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.reassignMachineriesToAROL,
);

/* DELETE */

router.delete(
  "/delete/all/:companyID",
  param("companyID").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.deleteAllMachineries,
);

router.delete(
  "/delete/:machineryUID",
  param("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.deleteMachineryByUID,
);

export default router;
