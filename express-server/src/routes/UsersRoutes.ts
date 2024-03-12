import express from "express";
import controller from "../controllers/UsersController";
import jwtAuthentication from "../middlewares/JwtAuthentication";
import authorization from "../middlewares/Authorization";
import { param, body } from "express-validator";

const router = express.Router();

/* GET */

router.get(
  "/company/:companyID",
  param("companyID").isInt(),
  jwtAuthentication.authenticateToken,
  controller.getCompanyUsers,
);

router.get(
  "/permissions/:userID",
  param("userID").isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.getAllUserPermissions,
);

router.get(
  "/permissions/:userID/:machineryUID",
  param("userID").isInt(),
  param("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.getUserPermissionsForMachinery,
);

/* POST */

router.post(
  "/create",
  body("email").notEmpty().isEmail(),
  body("password").notEmpty(),
  body("name").notEmpty(),
  body("surname").notEmpty(),
  body("roles").isArray({ min: 1 }),
  body("active").isBoolean(),
  body("companyID").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.createAccount,
);

router.post(
  "/details/update",
  body("id").notEmpty().isNumeric(),
  body("email").notEmpty().isEmail(),
  body("name").notEmpty(),
  body("surname").notEmpty(),
  body("roles").isArray({ min: 1 }),
  body("active").notEmpty().isBoolean(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.updateAccountDetails,
);

router.post(
  "/permissions/update",
  body("userID").isInt(),
  body("machineryUID").notEmpty(),
  body("machineryAccess").isBoolean(),
  body("dashboardsWrite").isBoolean(),
  body("dashboardsModify").isBoolean(),
  body("dashboardsRead").isBoolean(),
  body("documentsWrite").isBoolean(),
  body("documentsModify").isBoolean(),
  body("documentsRead").isBoolean(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.updateUserPermissions,
);

router.post(
  "/password/reset",
  body("id").isInt(),
  body("password").notEmpty(),
  body("isTemp").notEmpty().isBoolean(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.resetAccountPassword,
);

/* DELETE */

router.delete(
  "/delete/:userID",
  param("userID").isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.deleteUser,
);

router.delete(
  "/delete/permissions/:userID",
  param("userID").isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.deleteAllUserPermissions,
);

export default router;
