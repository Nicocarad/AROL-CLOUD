import Machinery from "./Machinery";
import SavedDashboard from "../../machinery/dashboard/interfaces/SavedDashboard";
import FileMapEntry from "../../machinery/documents/interfaces/FileMapEntry";

export default interface MachineryWithDashsAndDocs extends Machinery {
  dashboards: SavedDashboard[];
  documents: FileMapEntry[];
  active: boolean;
}
