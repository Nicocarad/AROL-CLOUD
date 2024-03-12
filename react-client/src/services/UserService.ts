import axios from "../utils/AxiosInterceptor";
import User from "../users/interfaces/User";
import MachineryPermissions from "../machinery-users/interfaces/MachineryPermissions";

/* RETRIVE */

// [CLIENT] -- Get all users in a company
async function getCompanyUsers(companyID: number): Promise<User[]> {
  const response = await axios.get("/users/company/" + companyID);
  if (response.status === 200) {
    return response.data.map((user: User) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      roles: user.roles,
      accountActive: user.active,
      companyID: user.companyID,
      createdAt: user.createdAt,
      createdBy: user.createdBy,
      active: true,
      isTemp: user.isTemp,
    }));
  }

  throw response.data;
}

// [CLIENT] -- Get all permissions for a user
async function getAllUserPermissions(userID: number): Promise<MachineryPermissions[]> {
  const response = await axios.get("/users/permissions/" + userID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Get all permissions for a user on a machinery
async function getUserPermissionsForMachinery(
  userID: number,
  machineryUID: string,
): Promise<MachineryPermissions | null> {
  const response = await axios.get("/users/permissions/" + userID + "/" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

/* CREATE */

// [CLIENT] -- Create a new user account
async function createAccount(user: User, password: string): Promise<User> {
  const response = await axios.post("/users/create/", {
    email: user.email,
    password: password,
    name: user.name,
    surname: user.surname,
    roles: user.roles,
    active: user.accountActive,
    companyID: user.companyID,
  });
  if (response.status === 200)
    return {
      id: response.data.id,
      email: response.data.email,
      name: response.data.name,
      surname: response.data.surname,
      roles: response.data.roles,
      accountActive: response.data.active,
      companyID: response.data.companyID,
      createdAt: response.data.createdAt,
      createdBy: response.data.createdBy,
      active: false,
      isTemp: response.data.isTemp,
    };

  throw response.data;
}

/* UPDATE */

// [CLIENT] -- Update account details
async function updateAccountDetails(user: User): Promise<boolean> {
  const response = await axios.post("/users/details/update/", {
    id: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname,
    roles: user.roles,
    active: user.accountActive,
    isTemp: user.isTemp,
  });
  if (response.status === 200) return true;

  throw response.data;
}

// [CLIENT] -- Update user permissions
async function updateUserPermissions(machineryPermissions: MachineryPermissions) {
  const response = await axios.post("/users/permissions/update/", {
    userID: machineryPermissions.userID,
    machineryUID: machineryPermissions.machineryUID,
    machineryAccess: machineryPermissions.machineryAccess,
    dashboardsWrite: machineryPermissions.dashboardsWrite,
    dashboardsModify: machineryPermissions.dashboardsModify,
    dashboardsRead: machineryPermissions.dashboardsRead,
    documentsWrite: machineryPermissions.documentsWrite,
    documentsModify: machineryPermissions.documentsModify,
    documentsRead: machineryPermissions.documentsRead,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Reset account password
async function resetAccountPassword(id: number, password: string, isTemp: boolean): Promise<boolean> {
  const response = await axios.post("/users/password/reset/", { id, password, isTemp });
  if (response.status === 200) return true;

  throw response.data;
}

/* DELETE */

// [CLIENT] -- Delete a user
async function deleteUser(userID: number) {
  const response = await axios.delete("/users/delete/" + userID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Delete all permissions for a user
async function deleteAllUserPermissions(userID: number) {
  const response = await axios.delete("/users/delete/permissions/" + userID);
  if (response.status === 200) return response.data;

  throw response.data;
}

const userService = {
  getCompanyUsers,
  getAllUserPermissions,
  getUserPermissionsForMachinery,
  createAccount,
  updateAccountDetails,
  updateUserPermissions,
  resetAccountPassword,
  deleteUser,
  deleteAllUserPermissions,
};

export default userService;
