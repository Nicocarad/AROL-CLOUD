import express from "express";
import companiesService from "../services/CompaniesService";
import { validationResult } from "express-validator";

/* RETRIVE */

const getCompanies = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await companiesService.getCompanies(req, res);
};

const getCompanyByID = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await companiesService.getCompanyByID(req, res);
};

/* CREATE */

const createCompany = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await companiesService.createCompany(req, res);
};

/* UPDATE */

const updateCompany = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await companiesService.updateCompany(req, res);
};

/* DELETE */

const deleteCompany = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await companiesService.deleteCompany(req, res);
};

export default {
  getCompanies,
  getCompanyByID,
  createCompany,
  updateCompany,
  deleteCompany,
};
