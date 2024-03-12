import Machinery from "../../machinery-management/interfaces/Machinery";
import FileMapEntry from "../../machinery/documents/interfaces/FileMapEntry";

export default interface MachineryWithDocuments extends Machinery {
  documents: FileMapEntry[];
  active: boolean;
}
