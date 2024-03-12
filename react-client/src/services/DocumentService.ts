import axios from "../utils/AxiosInterceptor";
import { FileData } from "chonky";
import Document from "../machinery/documents/models/Document";

/* RETRIVE */

// [CLIENT] -- Get a document from a machinery by its UID and machinery UID
async function getDocument(machineryUID: string, documentUID: string): Promise<Buffer> {
  const response = await axios.get(
    "/documents/document/?machineryUID=" + machineryUID + "&documentUID=" + documentUID,
    {
      responseType: "arraybuffer",
    },
  );
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Get all documents from a machinery by its UID
async function getMachineryDocuments(machineryUID: string) {
  const response = await axios.get("/documents/all/?machineryUID=" + machineryUID);
  if (response.status === 200) return response.data;

  throw response.data;
}

/* CREATE */

// [CLIENT] -- Create a new folder in a machinery
async function createMachineryFolder(machineryUID: string, folderPath: string) {
  const response = await axios.put("/documents/folder/?machineryUID=" + machineryUID, {
    folderPath: folderPath,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

// [CLIENT] -- Upload a file or folder to a machinery
async function uploadMachineryDocuments(machineryUID: string, formData: FormData, isPrivate: boolean): Promise<Document[]> {
  const response = await axios.put("/documents/files/?machineryUID=" + machineryUID + "&isPrivate=" + isPrivate, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* UPDATE */

// [CLIENT] -- Rename a file or folder associated with a machinery
async function renameMachineryFileOrFolder(
  machineryUID: string,
  oldFileID: string,
  documentUID: string,
  newFileName: string,
  oldFileName: string,
  type: string,
): Promise<Document[]> {
  const response = await axios.post("/documents/rename/?machineryUID=" + machineryUID, {
    oldFileID: oldFileID,
    documentUID: documentUID,
    newFileName: newFileName,
    oldFileName: oldFileName,
    type: type,
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

/* DELETE */

// [CLIENT] -- Delete one or more files or folders from a machinery
async function deleteMachineryDocuments(machineryUID: string, documentsList: FileData[]) {
  const response = await axios.delete("/documents/?machineryUID=" + machineryUID, {
    data: {
      documentsList: documentsList,
    },
  });
  if (response.status === 200) return response.data;

  throw response.data;
}

const documentsService = {
  getDocument,
  getMachineryDocuments,
  createMachineryFolder,
  uploadMachineryDocuments,
  renameMachineryFileOrFolder,
  deleteMachineryDocuments,
};

export default documentsService;
