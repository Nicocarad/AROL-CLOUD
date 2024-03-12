import axios from "../utils/AxiosInterceptor";
import Dashboard from "../machinery/dashboard/models/Dashboard";
import SavedDashboard from "../machinery/dashboard/interfaces/SavedDashboard";
import Machinery from "../machinery-management/interfaces/Machinery";

/* RETRIVE */

// [CLIENT] -- Get all dashboards for a given machinery
async function getDashboards(machineryUID: string) {
  const response = await axios.get<SavedDashboard[]>("/dashboard/saved/?machineryUID=" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Get all dashboard templates for a given machinery
async function getDashboardTemplates(machinery: Machinery) {
  const response = await axios.get<SavedDashboard[]>(
    "/dashboard/templates/?machineryUID=" + machinery.uid + "&companyID=" + machinery.companyID,
  );
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Load a dashboard with a given name for a given machinery
async function loadDashboard(machineryUID: string, dashboardName: string): Promise<Dashboard> {
  const response = await axios.get("/dashboard/load/?machineryUID=" + machineryUID + "&dashboardName=" + dashboardName);
  if (response.status === 200) return response.data;

  return new Dashboard();
}

// [CLIENT] -- Load the default dashboard for a given machinery
async function loadDefaultDashboard(machineryUID: string): Promise<Dashboard> {
  const response = await axios.get("/dashboard/load/default/?machineryUID=" + machineryUID);
  if (response.status === 200) return response.data;

  throw new Dashboard();
}

/* CREATE */

// [CLIENT] -- Save dashboard as a new dashboard
async function saveAsDashboard(dashboard: Dashboard) {
  const response = await axios.post("/dashboard/saveas/", { dashboard: dashboard });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* CREATE */

// [CLIENT] -- Update dashboard
async function saveDashboard(dashboard: Dashboard) {
  const response = await axios.post("/dashboard/save/", { dashboard: dashboard });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* DELETE */

// [CLIENT] -- Delete a dashboard given its name for a given machinery
async function deleteDashboard(machineryUID: string, dashboardName: string): Promise<boolean> {
  const response = await axios.delete(
    "/dashboard/delete/?machineryUID=" + machineryUID + "&dashboardName=" + dashboardName,
  );
  if (response.status === 200) return response.data;

  throw response.data;
}

const dashboardService = {
  getDashboards,
  getDashboardTemplates,
  loadDashboard,
  loadDefaultDashboard,
  saveDashboard,
  saveAsDashboard,
  deleteDashboard,
};

export default dashboardService;
