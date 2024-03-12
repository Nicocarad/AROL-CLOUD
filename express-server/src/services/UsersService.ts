import express from "express";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/UserRepository";
import MachineryPermissions from "../entities/MachineryPermissions";
import MachineryRepository from "../repositories/MachineriesRepository";
import User from "../entities/User";

require("dotenv").config({ path: __dirname + "/./../.env" });

const jwtSecret = process.env.JWT_SECRET_KEY!!;
const jwtExpiration = Number(process.env.JWT_EXPIRATION!!);
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET_KEY!!;
const refreshTokenExpiration = Number(process.env.REFRESH_TOKEN_EXPIRATION!!);

interface UserCredentials {
  email: string;
  password: string;
}

interface UserPermissions {
  [key: string]: {
    [key: string]: boolean;
  };
}

interface AccountUpdateDetails {
  id: number;
  email: string;
  name: string;
  surname: string;
  roles: string[];
  active: boolean;
  isTemp: boolean;
}

interface PasswordResetDetails {
  id: number;
  password: string;
  isTemp: boolean;
}

/*** PUBLIC ***/

async function login(req: express.Request, res: express.Response) {
  const userCredentials = req.body as UserCredentials;

  const existingUser = await userRepository.authenticateAndGetUser(userCredentials.email, userCredentials.password);
  if (!existingUser) return res.status(403).json({ msg: "Bad credentials" });
  if (!existingUser.active) return res.status(403).json({ msg: "Account disabled" });

  const refreshTokenExpiry = Date.now() + refreshTokenExpiration;
  const refreshToken = jwt.sign({ id: existingUser.id, exp: refreshTokenExpiry }, refreshTokenSecret);

  const refreshTokenInsertedInDB = await userRepository.insertRefreshToken(
    existingUser.id,
    refreshToken,
    refreshTokenExpiry,
  );
  if (!refreshTokenInsertedInDB)
    return res.status(500).json({ msg: "Oops! Failed to create a refresh token, please ty again later" });

  const tokenExpiration = Math.floor(Date.now()) + jwtExpiration;
  let jwtToken;

  try {
    jwtToken = jwt.sign(
      {
        id: existingUser.id,
        companyID: existingUser.companyID,
        email: existingUser.email,
        name: existingUser.name,
        surname: existingUser.surname,
        roles: existingUser.roles,
        exp: tokenExpiration,
      },
      jwtSecret,
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Oops! Failed to generate the JWT" });
  }

  const userPermissionsArray = await userRepository.getAllUserPermissions(existingUser.id);
  if (!userPermissionsArray) return res.status(500).json({ msg: "Oops! Failed to get user permissions" });

  let userPermissionsObject: UserPermissions = {};
  userPermissionsArray.forEach((permissions) => {
    userPermissionsObject[permissions.machineryUID] = {
      dashboardsWrite: permissions.dashboardsWrite,
      dashboardsModify: permissions.dashboardsModify,
      dashboardsRead: permissions.dashboardsRead,
      documentsWrite: permissions.documentsWrite,
      documentsModify: permissions.documentsModify,
      documentsRead: permissions.documentsRead,
    };
  });

  return res.status(200).json({
    id: existingUser.id,
    companyID: existingUser.companyID,
    name: existingUser.name,
    surname: existingUser.surname,
    email: existingUser.email,
    roles: existingUser.roles,
    authToken: jwtToken,
    authTokenExpiration: tokenExpiration,
    refreshToken: refreshToken,
    refreshTokenExpiry: refreshTokenExpiry,
    permissions: userPermissionsObject,
    isTemp: existingUser.isTemp,
  });
}

async function logout(req: express.Request, res: express.Response) {
  const userID = parseInt(req.query.id as string);
  const token = req.query.token as string;

  const result = await userRepository.getRefreshToken(userID, token);
  if (result) {
    await userRepository.deleteRefreshToken(result.refreshToken);
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
}

async function refreshToken(req: express.Request, res: express.Response) {
  const userID = parseInt(req.query.id as string);
  const refToken = req.query.token as string;

  const result = await userRepository.getRefreshToken(userID, refToken);
  if (!result) return res.status(400).json({ msg: "Invalid refresh token" });

  const userDetails = await userRepository.getUserByID(userID);
  if (!userDetails) return res.status(400).json({ msg: "Invalid refresh token" });
  if (!userDetails.active) return res.status(403).json({ msg: "Account disabled" });

  try {
    jwt.verify(refToken, refreshTokenSecret, (err: any, claims: any) => {
      if (err) throw err;
      if (claims.exp < Date.now()) throw "Invalid refresh token - token expired";
    });
  } catch (e) {
    console.log(e);
    return res.status(401).json({ msg: "Invalid refresh token" });
  }

  const refreshTokenExpiry = Date.now() + refreshTokenExpiration;
  let refreshToken = jwt.sign({ id: userID, exp: refreshTokenExpiry }, refreshTokenSecret);

  const refreshTokenInsertedInDB = await userRepository.insertRefreshToken(userID, refreshToken, refreshTokenExpiry);
  if (!refreshTokenInsertedInDB)
    return res.status(500).json({ msg: "Oops! Failed to create a refresh token, please ty again later" });

  const companyID = userDetails.companyID ? userDetails.companyID : null;
  const tokenExpiration = Math.floor(Date.now()) + jwtExpiration;
  let newJwtToken;

  try {
    newJwtToken = jwt.sign(
      {
        id: userDetails.id,
        companyID: companyID,
        email: userDetails.email,
        name: userDetails.name,
        surname: userDetails.surname,
        roles: userDetails.roles,
        exp: tokenExpiration,
      },
      jwtSecret,
    );
  } catch (e) {
    console.log(e);
    return res.status(500).json({ msg: "Oops! Failed to generate the JWT" });
  }

  const userPermissionsArray = await userRepository.getAllUserPermissions(userDetails.id);
  if (!userPermissionsArray) return res.status(500).json({ msg: "Oops! Failed to get user permissions" });

  const userPermissionsObject: UserPermissions = {};
  userPermissionsArray.forEach((permissions) => {
    userPermissionsObject[permissions.machineryUID] = {
      dashboardsWrite: permissions.dashboardsWrite,
      dashboardsModify: permissions.dashboardsModify,
      dashboardsRead: permissions.dashboardsRead,
      documentsWrite: permissions.documentsWrite,
      documentsModify: permissions.documentsModify,
      documentsRead: permissions.documentsRead,
    };
  });

  return res.status(200).json({
    id: userDetails.id,
    companyID: companyID,
    email: userDetails.email,
    name: userDetails.name,
    surname: userDetails.surname,
    roles: userDetails.roles,
    refreshToken: refreshToken,
    refreshTokenExpiry: refreshTokenExpiry,
    authToken: newJwtToken,
    authTokenExpiration: tokenExpiration,
    permissions: userPermissionsObject,
  });
}

/*** USERS ***/

/* RETRIVE */

// [SERVER] -- Get all users from a company
async function getCompanyUsers(req: express.Request, res: express.Response) {
  const companyUsers = await userRepository.getCompanyUsers(parseInt(req.params.companyID as string));
  if (companyUsers) return res.status(200).json(companyUsers);

  return res.status(500).json({ msg: "Failed to fetch company users" });
}

// [SERVER] -- Get all permissions for a user
async function getAllUserPermissions(req: express.Request, res: express.Response) {
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const userID = parseInt(req.params.userID as string);

  if (!companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF", "AROL_ROLE_SUPERVISOR"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userToGetPermissions = await userRepository.getUserByID(userID);
    if (!userToGetPermissions || userToGetPermissions.companyID !== companyID) return res.sendStatus(403);
  }

  const result = await userRepository.getAllUserPermissions(userID);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Failed to find user permissions" });
}

// [SERVER] -- Get permissions for a user for a specific machinery
async function getUserPermissionsForMachinery(req: express.Request, res: express.Response) {
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const userID = parseInt(req.params.userID as string);
  const machineryUID = req.params.machineryUID as string;

  if (!companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userToResetPassword = await userRepository.getUserByID(userID);
    if (!userToResetPassword || userToResetPassword.companyID !== companyID) return res.sendStatus(403);
  }

  const result = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Failed to find user permissions for machinery " + machineryUID });
}

/* CREATE */

// [SERVER] -- Create a new user account
async function createAccount(req: express.Request, res: express.Response) {
  const createdBy = req.principal.id as number;
  if (!createdBy) return res.status(400).json({ msg: "Missing user details" });

  const result = await userRepository.createAccount(
    req.body.email,
    req.body.password,
    req.body.name,
    req.body.surname,
    req.body.roles,
    req.body.companyID,
    createdBy,
  );
  if (result) return res.status(200).json(result);

  return res.status(400).json({ msg: "Bad user data" });
}

/* UPDATE */

// [SERVER] -- Update user account details
async function updateAccountDetails(req: express.Request, res: express.Response) {
  const newAccountDetails = req.body as AccountUpdateDetails;
  const loggedUser = req.principal as User;

  const userToUpdate = await userRepository.getUserByID(newAccountDetails.id);
  if (!userToUpdate) return res.sendStatus(403);

  if (Number(loggedUser.id) === Number(newAccountDetails.id))
    return res.status(403).json({ msg: "Cannot update your own account" });

  const updateResult = await userRepository.updateAccountDetails(
    newAccountDetails.id,
    newAccountDetails.email,
    newAccountDetails.name,
    newAccountDetails.surname,
    newAccountDetails.roles,
    newAccountDetails.active,
    newAccountDetails.isTemp,
  );
  if (updateResult) return res.status(200).json(updateResult);

  return res.status(500).json({ msg: "Oops! Account update failed" });
}

// [SERVER] -- Update user permissions
async function updateUserPermissions(req: express.Request, res: express.Response) {
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const userPermissions = req.body as MachineryPermissions;

  if (!companyID || !roles) return res.status(400).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF", "AROL_ROLE_SUPERVISOR"];
  const isAdmin = roles.some((role) => rolesToCheck.includes(role));

  if (!isAdmin) {
    const userToUpdatePermissions = await userRepository.getUserByID(userPermissions.userID);
    if (!userToUpdatePermissions) return res.sendStatus(403);
    if (companyID !== 0 && userToUpdatePermissions.companyID !== companyID) return res.sendStatus(403);
  }

  const result = await userRepository.updateUserPermissions(req.principal, isAdmin, userPermissions);
  if (result) return res.status(200).json(result);

  return res.status(500).json({ msg: "Failed to update user" });
}

// [SERVER] -- Reset user account password
async function resetAccountPassword(req: express.Request, res: express.Response) {
  const resetPasswordDetails = req.body as PasswordResetDetails;

  const userToResetPassword = await userRepository.getUserByID(resetPasswordDetails.id);
  if (!userToResetPassword) return res.sendStatus(403);

  const updateResult = await userRepository.resetAccountPassword(
    resetPasswordDetails.id,
    resetPasswordDetails.password,
    resetPasswordDetails.isTemp,
  );
  if (updateResult) return res.status(200).json(updateResult);

  return res.status(500).json({ msg: "Oops! Password reset failed" });
}

/* DELETE */

// [SERVER] -- Delete user account
async function deleteUser(req: express.Request, res: express.Response) {
  const userID = parseInt(req.params.userID as string);
  const loggedUser = req.principal as User;

  if (Number(loggedUser.id) === Number(req.params.userID))
    return res.status(403).json({ msg: "Cannot delete your own account" });

  try {
    const hasMachineries = await MachineryRepository.verifyMachineryUserPermission(userID);
    if (hasMachineries) return res.status(403).send("User cannot be deleted because still manages some machinery");
    else {
      const result = await userRepository.deleteUser(userID);
      if (result) return res.status(200).json(result);
      
      return res.status(400).json({ msg: "Failed to delete user" });
    }
  } catch (e) {
    console.error(e);
  }
}

// [SERVER] -- Delete all user permissions
async function deleteAllUserPermissions(req: express.Request, res: express.Response) {
  try {
    await userRepository.deleteAllUserPermissions(parseInt(req.params.userID as string));
    return res.status(200).json({ message: "User permissions deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "An error occurred while deleting user permissions" });
  }
}

export default {
  login,
  logout,
  refreshToken,
  getCompanyUsers,
  getAllUserPermissions,
  getUserPermissionsForMachinery,
  createAccount,
  updateAccountDetails,
  resetAccountPassword,
  deleteUser,
  updateUserPermissions,
  deleteAllUserPermissions,
};
