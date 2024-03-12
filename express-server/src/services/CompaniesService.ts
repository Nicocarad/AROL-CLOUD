import express from "express";
import companyRepository from "../repositories/CompaniesRepository";

/* RETRIVE */

// [SERVER] -- Get all companies
async function getCompanies(req: express.Request, res: express.Response) {
  const result = await companyRepository.getCompanies();
  if (result) return res.status(200).json(result);

  return res.status(400).json();
}

// [SERVER] -- Get a company by ID
async function getCompanyByID(req: express.Request, res: express.Response) {
  const result = await companyRepository.getCompanyByID(Number(req.params.id));
  if (result) return res.status(200).json(result);

  return res.status(400).json();
}

/* CREATE */

// [SERVER] -- Create a new company
async function createCompany(req: express.Request, res: express.Response) {
  const result = await companyRepository.createCompany(req.body.name, req.body.city);
  if (result) return res.status(200).json(result);

  return res.status(400).json();
}

/* UPDATE */

// [SERVER] -- Update a company given its ID
async function updateCompany(req: express.Request, res: express.Response) {
  const id = req.body.id as number;
  if (id === 0) return res.status(500).json({ msg: "Cannot update AROL company" });

  const result = await companyRepository.updateCompany(id, req.body.name, req.body.city);
  if (result) return res.status(200).json(result);

  return res.status(400).json();
}

/* DELETE */

// [SERVER] -- Delete a company given its ID
async function deleteCompany(req: express.Request, res: express.Response) {
  const id = parseInt(req.params.id as string);
  if (id === 0) return res.status(500).json({ msg: "Cannot delete AROL company" });

  const result = await companyRepository.deleteCompany(id);
  if (result) return res.status(200).json(result);

  return res.status(400).json();
}

export default {
  getCompanies,
  getCompanyByID,
  createCompany,
  updateCompany,
  deleteCompany,
};
