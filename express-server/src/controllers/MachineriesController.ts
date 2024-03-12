import express from "express";
import machineriesService from "../services/MachineriesService";
import { validationResult } from "express-validator";

/* RETRIVE */

const getAllMachineries = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getAllMachineries(req, res);
};

const getMachineriesByCompanyID = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getMachineriesByCompanyID(req, res);
};

const getMachineryByUID = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getMachineryByUID(req, res);
};

const getMachineryDetails = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getMachineryDetails(req, res);
};

const getSensorsCatalogue = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getSensorsCatalogue(req, res);
};

const getMachinerySensors = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getMachinerySensors(req, res);
};

const getMachinerySensorsData = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.getMachinerySensorsData(req, res);
};

/* CREATE */

const insertMachinery = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.insertMachinery(req, res);
};

const insertSensor = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.insertSensor(req, res);
};

/* UPDATE */

const modifyMachinery = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.modifyMachinery(req, res);
};

const modifyMachinerySensors = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.modifyMachinerySensors(req, res);
};

const updateSensor = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.updateSensor(req, res);
};

const reassignMachineriesToAROL = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.reassignMachineriesToAROL(req, res);
};
/* DELETE */

const deleteAllMachineries = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.deleteAllMachineries(req, res);
};

const deleteMachineryByUID = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await machineriesService.deleteMachineryByUID(req, res);
};

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
