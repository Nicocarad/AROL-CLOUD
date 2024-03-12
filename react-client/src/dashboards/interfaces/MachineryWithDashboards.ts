import Machinery from "../../machinery-management/interfaces/Machinery";
import SavedDashboard from "../../machinery/dashboard/interfaces/SavedDashboard";

export default interface MachineryWithDashboards extends Machinery {
  dashboards: SavedDashboard[];
  active: boolean;
}
