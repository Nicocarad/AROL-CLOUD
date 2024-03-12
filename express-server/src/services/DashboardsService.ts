import express from "express";
import machineryRepository from "../repositories/MachineriesRepository";
import dashboardRepository from "../repositories/DashboardsRepository";
import userRepository from "../repositories/UserRepository";
import Dashboard from "../entities/Dashboard";

/* RETRIVE */

// [SERVER] -- Get all dashboards for a given machinery
async function getDashboards(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.dashboardsRead) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await dashboardRepository.getDashboards(machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Oops! Could not retrieve dashboards" });
}

// [SERVER] -- Get all dashboard templates for a given machinery
async function getDashboardTemplates(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = parseInt(req.query.companyID as string);
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await dashboardRepository.getDashboardTemplates(machineryUID, companyID, userID, roles);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Oops! Could not retrieve dashboard templates" });
}

// [SERVER] -- Load a dashboard with a given name for a given machinery
async function loadDashboard(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await dashboardRepository.loadDashboard(req.query.dashboardName!!.toString(), machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(404).json({ msg: "Oops! Could not find dashboard to delete" });
}

// [SERVER] -- Load the default dashboard for a given machinery
async function loadDefaultDashboard(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!req.principal.roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await dashboardRepository.loadDefaultDashboard(machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(404).json({ msg: "No default dashboard found" });
}

/* CREATE */

// [SERVER] -- Create a new dashboard
async function saveAsDashboard(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const dashboard = req.body.dashboard as Dashboard;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, dashboard.machineryUID);
    if (!userPermissions) return res.sendStatus(403);

    const dashboardExists = await dashboardRepository.loadDashboard(dashboard.name, dashboard.machineryUID);
    if (dashboardExists && !userPermissions.dashboardsModify) return res.sendStatus(403);
    else if (!dashboardExists && !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(dashboard.machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  dashboard.lastSave = Date.now();
  dashboard.numUnsavedChanges = 0;

  const result = await dashboardRepository.saveAsDashboard(dashboard, userID);
  if (result === true) return res.sendStatus(200);
  else if (result === false) return res.sendStatus(409);
  else return res.status(500).json({ msg: "Oops! Could not save dashboard" });
}

// [SERVER] -- Update dashboard
async function saveDashboard(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const dashboard = req.body.dashboard as Dashboard;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, dashboard.machineryUID);
    if (!userPermissions) return res.sendStatus(403);

    const dashboardExists = await dashboardRepository.loadDashboard(dashboard.name, dashboard.machineryUID);
    if (dashboardExists && !userPermissions.dashboardsModify) return res.sendStatus(403);
    else if (!dashboardExists && !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(dashboard.machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  dashboard.lastSave = Date.now();
  dashboard.numUnsavedChanges = 0;

  const result = await dashboardRepository.saveDashboard(dashboard, userID);
  if (result === true) return res.sendStatus(200);
  else if (result === false) return res.sendStatus(404);
  else return res.status(500).json({ msg: "Oops! Could not save dashboard" });
}

/* DELETE */

// [SERVER] -- Delete a dashboard given its name for a given machinery
async function deleteDashboard(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.dashboardsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await dashboardRepository.deleteDashboard(req.query.dashboardName!!.toString(), machineryUID);
  if (!result) return res.status(500).json({ msg: "Oops! Could not delete the dashboard" });
  else if (result) return res.sendStatus(200);

  return res.status(404).json({ msg: "Oops! Could not find dashboard to delete" });
}

export default {
  getDashboards,
  getDashboardTemplates,
  loadDashboard,
  loadDefaultDashboard,
  saveDashboard,
  saveAsDashboard,
  deleteDashboard,
};
