import express from "express";
import controller from "../controllers/CompaniesController";
import jwtAuthentication from "../middlewares/JwtAuthentication";
import authorization from "../middlewares/Authorization";
import { body, param } from "express-validator";

const router = express.Router();

/* GET */

router.get("/all", jwtAuthentication.authenticateToken, controller.getCompanies);

router.get("/:id", param("id").notEmpty().isInt(), jwtAuthentication.authenticateToken, controller.getCompanyByID);

/* POST */

router.post(
  "/create",
  body("name").notEmpty(),
  body("city").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.createCompany,
);

router.post(
  "/update",
  body("id").notEmpty().isInt(),
  body("name").notEmpty(),
  body("city").notEmpty(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.updateCompany,
);

/* DELETE */

router.delete(
  "/:id",
  param("id").notEmpty().isInt(),
  jwtAuthentication.authenticateToken,
  authorization.authorizeRequest,
  controller.deleteCompany,
);

export default router;
