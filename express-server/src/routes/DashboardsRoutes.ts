import express from "express";
import controller from "../controllers/DashboardsController";
import jwtAuthentication from "../middlewares/JwtAuthentication";
import { body, query } from "express-validator";

const router = express.Router();

/* GET */

router.get("/saved/", query("machineryUID").notEmpty(), jwtAuthentication.authenticateToken, controller.getDashboards);

router.get(
  "/templates/",
  query("machineryUID").notEmpty(),
  query("companyID").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  controller.getDashboardTemplates,
);

router.get(
  "/load/",
  query("machineryUID").notEmpty(),
  query("dashboardName").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.loadDashboard,
);

router.get(
  "/load/default/",
  query("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.loadDefaultDashboard,
);

/* POST */

router.post("/saveas", body("dashboard").exists(), jwtAuthentication.authenticateToken, controller.saveAsDashboard);

router.post("/save", body("dashboard").exists(), jwtAuthentication.authenticateToken, controller.saveDashboard);

/* DELETE */

router.delete(
  "/delete/",
  query("machineryUID").notEmpty(),
  query("dashboardName").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.deleteDashboard,
);

export default router;
