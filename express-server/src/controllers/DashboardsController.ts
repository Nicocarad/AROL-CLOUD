import express from "express";
import dashboardService from "../services/DashboardsService";
import { validationResult } from "express-validator";

/* RETRIVE */

const getDashboards = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.getDashboards(req, res);
};

const getDashboardTemplates = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.getDashboardTemplates(req, res);
};

const loadDashboard = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.loadDashboard(req, res);
};

const loadDefaultDashboard = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.loadDefaultDashboard(req, res);
};

/* CREATE */

const saveAsDashboard = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.saveAsDashboard(req, res);
};

/* UPDATE */

const saveDashboard = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.saveDashboard(req, res);
};

/* DELETE */

const deleteDashboard = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await dashboardService.deleteDashboard(req, res);
};

export default {
  getDashboards,
  getDashboardTemplates,
  loadDashboard,
  loadDefaultDashboard,
  saveDashboard,
  saveAsDashboard,
  deleteDashboard,
};
