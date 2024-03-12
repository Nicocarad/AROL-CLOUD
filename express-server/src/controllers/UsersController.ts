import express from "express";
import { validationResult } from "express-validator";
import usersService from "../services/UsersService";

/* RETRIVE */

const getCompanyUsers = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.getCompanyUsers(req, res);
};

const getUserPermissionsForMachinery = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.getUserPermissionsForMachinery(req, res);
};

const getAllUserPermissions = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.getAllUserPermissions(req, res);
};

/* CREATE */

const createAccount = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.createAccount(req, res);
};

/* UPDATE */

const updateAccountDetails = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.updateAccountDetails(req, res);
};

const updateUserPermissions = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.updateUserPermissions(req, res);
};

const resetAccountPassword = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.resetAccountPassword(req, res);
};

/* DELETE */

const deleteUser = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.deleteUser(req, res);
};

const deleteAllUserPermissions = async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors);
    return res.status(400).json({
      msg: "Bad request body",
    });
  }

  await usersService.deleteAllUserPermissions(req, res);
};

export default {
  getCompanyUsers,
  getUserPermissionsForMachinery,
  getAllUserPermissions,
  createAccount,
  updateAccountDetails,
  updateUserPermissions,
  resetAccountPassword,
  deleteUser,
  deleteAllUserPermissions,
};
