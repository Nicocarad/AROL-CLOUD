import express from "express";

require("dotenv").config({ path: __dirname + "/./../.env" });

const CMP_WKR = "COMPANY_ROLE_WORKER";
const CMP_ADMIN = "COMPANY_ROLE_ADMIN";
const CMP_MGR = "COMPANY_ROLE_MANAGER";
const AROL_CHIEF = "AROL_ROLE_CHIEF";
const AROL_SPVR = "AROL_ROLE_SUPERVISOR";
const AROL_OFF = "AROL_ROLE_OFFICER";

const rolePermissions = {
  "/machinery/all": [AROL_OFF, AROL_SPVR, AROL_CHIEF],
  "/machinery/insert": [AROL_SPVR, AROL_CHIEF],
  "/machinery/modify": [AROL_SPVR, AROL_CHIEF],
  "/machinery/sensors/all": [AROL_SPVR, AROL_CHIEF],
  "/machinery/sensors/insert": [AROL_SPVR, AROL_CHIEF],
  "/machinery/sensor/modify": [AROL_SPVR, AROL_CHIEF],
  "/machinery/reassign": [AROL_SPVR, AROL_CHIEF],
  "/machinery/sensors/data": [AROL_SPVR, AROL_CHIEF],
  "/machinery/delete/all/:companyID": [AROL_SPVR, AROL_CHIEF],
  "/machinery/delete/:machineryUID": [AROL_SPVR, AROL_CHIEF],
  "/company/create": [AROL_CHIEF, AROL_SPVR],
  "/company/update": [AROL_CHIEF, AROL_SPVR],
  "/company/delete": [AROL_CHIEF, AROL_SPVR],
  "/users/create": [CMP_MGR, CMP_ADMIN, AROL_CHIEF, AROL_SPVR],
  "/users/details/update": [CMP_ADMIN, AROL_SPVR, AROL_CHIEF],
  "/users/permissions": [CMP_MGR, CMP_ADMIN, AROL_CHIEF, AROL_SPVR],
  "/users/delete": [CMP_ADMIN, AROL_CHIEF, AROL_SPVR],
};

function authorizeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  for (const [url, roles] of Object.entries(rolePermissions))
    if (req.url.startsWith(url) && !req.principal.roles.some((role) => roles.includes(role)))
      return res.sendStatus(403);
  next();
}

export default {
  authorizeRequest,
};
