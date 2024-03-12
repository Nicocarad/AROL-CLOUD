import pgClient from "../configs/PgClient";
import Document from "../entities/Document";
import FileMapEntry from "../interfaces/FileMapEntry";
import UserRepository from "./UserRepository";

const fs = require("fs/promises");

/* RETRIVE */

async function getDocument(machineryUID: string, documentUID: string, companyID: number) {
  try {
    const fileDB = await getFileFromDatabase(machineryUID, documentUID, companyID);
    if (!fileDB) return null;

    const document: Buffer = fs.readFile(`./../../documents/${fileDB.documentUID!}`);
    return document;
  } catch (e) {
    console.error(e);

    return null;
  }
}

async function getMachineryDocuments(machineryUID: string, companyID: number) {
  try {
    const filesDB = await getFilesFromDatabase(machineryUID, companyID);

    const fileMap: { [key: string]: any } = {};
    for (const file of filesDB) {
      let childrenIds: string[] = [];
      if (file.isDir) {
        const childrenParentID = `${file.location}\\${file.name}`;
        childrenIds = filesDB
          .filter((el) => el.location === childrenParentID)
          .map((el) => `${el.location}\\${el.name}`);
      }

      const ownerCompanyIDresult = await pgClient.oneOrNone(
        "SELECT company_id FROM public.users WHERE id=$1",
        file.createdBy,
      );
      if (!ownerCompanyIDresult) return null;

      fileMap[`${file.location}\\${file.name}`] = {
        id: `${file.location}\\${file.name}`,
        name: file.name,
        documentUID: file.documentUID,
        isDir: file.isDir,
        isDocument: file.isDocument,
        isModifiable: file.isModifiable,
        childrenIds: childrenIds,
        childrenCount: childrenIds.length,
        parentId: file.location,
        modDate: new Date(Number(file.modificationTimestamp)),
        size: file.isDocument ? file.sizeBytes : 0,
        isPrivate: file.isPrivate,
        isArol: Number(ownerCompanyIDresult.company_id) === 0,
      };
    }

    const rootParentID = `\\${machineryUID}`;
    const rootChildrenIds = filesDB
      .filter((el) => el.location === rootParentID)
      .map((el) => `${el.location}\\${el.name}`);

    fileMap[rootParentID] = {
      id: rootParentID,
      name: machineryUID,
      isDir: true,
      childrenIds: rootChildrenIds,
      childrenCount: rootChildrenIds.length,
      parentId: "",
    };

    return {
      rootFolderId: rootParentID,
      childrenIds: rootChildrenIds,
      fileMap: fileMap,
    };
  } catch (e) {
    console.error(e);

    return null;
  }
}

/* CREATE */

async function createMachineryFolder(
  folderPath: string,
  machineryUID: string,
  userID: number,
  companyID: number,
): Promise<boolean | null> {
  if (folderPath.split("\\").length === 0) return null;

  const user = await UserRepository.getUserByID(userID);
  if (!user) return null;

  try {
    const folder = new Document(
      machineryUID,
      null,
      folderPath.split("\\").pop()!,
      folderPath.split("\\").slice(0, -1).join("\\"),
      0,
      true,
      false,
      true,
      Date.now(),
      Date.now(),
      userID,
      userID,
      Number(companyID) === 0 ? false : true,
    );

    await insertFileOrFolderInDatabase(folder);
  } catch (e) {
    console.error(e);

    return null;
  }

  return true;
}

async function uploadMachineryDocuments(
  userID: number,
  machineryUID: string,
  parentFolderPath: string,
  files: Express.Multer.File[],
  companyID: number,
  isPrivate: boolean,
): Promise<Document[] | null> {
  const uploadedFiles: Document[] = [];

  try {
    for (const file of files) {
      if (!file.originalname.endsWith(".pdf")) file.originalname += ".pdf";

      const dbFile = await getFileByNameAndLocationFromDatabase(
        parentFolderPath,
        file.originalname,
        machineryUID,
        companyID,
      );
      if (file.originalname.trim().length > 0 && file.mimetype === "application/pdf" && !dbFile) {
        const multerFile = await fs.readFile(file.path);

        const user = await UserRepository.getUserByID(userID);
        if (!user) return null;

        const document = new Document(
          machineryUID,
          file.filename,
          file.originalname,
          parentFolderPath,
          file.size,
          false,
          true,
          true,
          Date.now(),
          Date.now(),
          userID,
          userID,
          Number(companyID) === 0 ? false : isPrivate,
        );

        await insertFileOrFolderInDatabase(document);

        try {
          const res = await fs.access("./../../documents");
          if (!res) await fs.mkdir("./../../documents", { recursive: true });
        } catch (e: any) {
          try {
            await fs.mkdir("./../../documents", { recursive: true });
          } catch (err) {
            console.error(err);
            continue;
          }
        }

        try {
          await fs.writeFile(`./../../documents/${file.filename}`, multerFile);
        } catch (e) {
          await deleteFileFromDatabase(machineryUID, file.filename, parentFolderPath);
          continue;
        }

        uploadedFiles.push(document);
      }
      await fs.rm(file.path);
    }
  } catch (e) {
    console.error(e);

    return null;
  }

  return uploadedFiles;
}

/* UPDATE */

async function renameFileOrFolder(
  oldFileID: string,
  documentUID: string,
  newFileName: string,
  type: string,
  machineryUID: string,
  companyID: number,
) {
  if (!["file", "folder"].includes(type)) {
    console.error(`Unknown type ${type}`);
    return null;
  }

  try {
    const parentFolderPath = oldFileID.split("\\").slice(0, -1).join("\\");
    if (type === "file") {
      if (!documentUID) {
        console.error("Empty documentID");
        return null;
      }

      if (!newFileName.endsWith(".pdf")) newFileName += ".pdf";

      const fileLocationDB = await getFileByNameAndLocationFromDatabase(
        parentFolderPath,
        newFileName,
        machineryUID,
        companyID,
      );
      if (fileLocationDB) return null;

      await renameFileInDatabase(documentUID, newFileName);
    } else {
      const newFolderID = `${parentFolderPath}\\${newFileName}`;

      await renameFolderInDatabase(oldFileID, newFolderID, machineryUID);
    }

    return true;
  } catch (e) {
    console.error(e);

    return null;
  }
}

/* DELETE */

async function deleteMachineryDocuments(
  machineryUID: string,
  documentsList: FileMapEntry[],
  companyID: number,
): Promise<any[] | null> {
  const deletedDocuments = [];
  for (const document of documentsList)
    try {
      const splitDocumentID = document.id.split("\\");

      if (splitDocumentID.length > 0) {
        const documentName = splitDocumentID[splitDocumentID.length - 1];
        const documentLocation = splitDocumentID.slice(0, splitDocumentID.length - 1).join("\\");

        const result = await getFileByNameAndLocationFromDatabase(
          documentLocation,
          documentName,
          machineryUID,
          companyID,
        );

        if (result)
          if (result.isDir) {
            const deletedDocsAndFolders = await deleteFolderFromDatabase(machineryUID, documentLocation, documentName);
            const deletedDocs = deletedDocsAndFolders.filter((el) => el.isDocument && el.documentUID);
            for (const deletedDocument of deletedDocs) await fs.rm(`./../../documents/${deletedDocument.documentUID!}`);

            deletedDocuments.push(document);
          } else if (document.documentUID) {
            await deleteFileFromDatabase(machineryUID, document.documentUID, documentLocation);
            await fs.rm(`./../../documents/${document.documentUID!}`);

            deletedDocuments.push(document);
          }
      }
    } catch (e) {
      console.error(e);
    }

  return deletedDocuments;
}

/* UTILITY */

async function getFileFromDatabase(
  machineryUID: string,
  documentUID: string,
  companyID: number,
): Promise<Document | null> {
  try {
    const result = await pgClient.oneOrNone(
      "SELECT * FROM public.machinery_documents WHERE machinery_uid=$1 AND document_uid=$2",
      [machineryUID, documentUID],
    );

    if (!result) return null;
    if (result.is_private && Number(companyID) === 0) return null;

    return new Document(
      result.machinery_uid,
      result.document_uid,
      result.name,
      result.location,
      result.size_bytes,
      result.is_dir,
      result.is_document,
      result.is_modifiable,
      result.creation_timestamp,
      result.modification_timestamp,
      result.created_by,
      result.modified_by,
      result.is_private,
    );
  } catch (e) {
    console.error(e);

    return null;
  }
}

async function getFileByNameAndLocationFromDatabase(
  location: string,
  filename: string,
  machineryUID: string,
  companyID: number,
) {
  try {
    const result = await pgClient.oneOrNone(
      "SELECT * FROM public.machinery_documents WHERE location=$1 AND name=$2 AND machinery_uid=$3",
      [location, filename, machineryUID],
    );

    if (!result) return null;
    if (result.is_private && Number(companyID) === 0) return null;
    return new Document(
      result.machinery_uid,
      result.document_uid,
      result.name,
      result.location,
      result.size_bytes,
      result.is_dir,
      result.is_document,
      result.is_modifiable,
      result.creation_timestamp,
      result.modification_timestamp,
      result.created_by,
      result.modified_byresult,
      result.is_private,
    );
  } catch (e) {
    console.error(e);

    return null;
  }
}

async function getFilesFromDatabase(machineryUID: string, companyID: number): Promise<Document[]> {
  const result = await pgClient.result("SELECT * FROM public.machinery_documents WHERE machinery_uid=$1", machineryUID);

  const ret = result.rows
    .filter((row: any) => !(row.is_private && Number(companyID) === 0))
    .map(
      (row: any) =>
        new Document(
          row.machinery_uid,
          row.document_uid,
          row.name,
          row.location,
          row.size_bytes,
          row.is_dir,
          row.is_document,
          row.is_modifiable,
          row.creation_timestamp,
          row.modification_timestamp,
          row.created_by,
          row.modified_by,
          row.is_private,
        ),
    );

  return ret;
}

async function insertFileOrFolderInDatabase(document: Document) {
  const result = await pgClient.query(
    "INSERT INTO public.machinery_documents(machinery_uid, name, location, is_dir, is_document, is_modifiable, size_bytes, document_uid, creation_timestamp, modification_timestamp, created_by, modified_by, is_private) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
    [
      document.machineryUID,
      document.name,
      document.location,
      document.isDir,
      document.isDocument,
      document.isModifiable,
      document.sizeBytes,
      document.documentUID,
      document.creationTimestamp,
      document.modificationTimestamp,
      document.createdBy,
      document.modifiedBy,
      document.isPrivate,
    ],
  );

  if (!result || result.length === 0) throw "File insertion in DB failed";
}

async function renameFileInDatabase(documentUID: string, newFileName: string) {
  const result = await pgClient.query(
    "UPDATE public.machinery_documents SET name=$1 WHERE document_uid=$2 RETURNING *",
    [newFileName, documentUID],
  );

  if (!result || result.length === 0) throw `File rename in DB failed for file with UID ${documentUID}`;
}

async function renameFolderInDatabase(oldFolderID: string, newFolderID: string, machineryUID: string) {
  const oldFolderLocation = oldFolderID.split("\\").slice(0, -1).join("\\");
  const oldFolderName = oldFolderID.split("\\").slice(-1)[0];
  const newFolderLocation = newFolderID.split("\\").slice(0, -1).join("\\");
  const newFolderName = newFolderID.split("\\").slice(-1)[0];

  const modifiedFolder = await pgClient.query(
    "UPDATE public.machinery_documents SET location=$1, name=$2 WHERE location=$3 AND name=$4 AND machinery_uid=$5 RETURNING *",
    [newFolderLocation, newFolderName, oldFolderLocation, oldFolderName, machineryUID],
  );

  if (!modifiedFolder.length) throw `Failed update for folder ${oldFolderLocation}\\${oldFolderName}`;

  const escapedOldFolderLocation = oldFolderLocation.split("\\").join("\\\\");

  const entriesToModify = await pgClient.manyOrNone(
    "SELECT * FROM public.machinery_documents WHERE location LIKE $1 AND machinery_uid=$2",
    [`${escapedOldFolderLocation}\\\\${oldFolderName}%`, machineryUID],
  );

  for (const row of entriesToModify) {
    const oldLocation: string = row.location;
    const newLocation: string = newFolderID + oldLocation.slice(`${oldFolderLocation}\\${oldFolderName}`.length);

    const result = await pgClient.query(
      "UPDATE public.machinery_documents SET location=$1 WHERE location=$2 AND machinery_uid=$3 RETURNING *",
      [newLocation, oldLocation, row.machinery_uid],
    );
    if (!result || result.length === 0) throw `Failed update for document ${row.document_uid}`;
  }
}

async function deleteFileFromDatabase(machineryUID: string, documentUID: string, fileLocation: string) {
  const result = await pgClient.result(
    "DELETE FROM public.machinery_documents WHERE machinery_uid=$1 AND document_uid=$2 AND location=$3",
    [machineryUID, documentUID, fileLocation],
  );
  if (result.rowCount > 0) return true;

  throw `File ${documentUID} not found in DB`;
}

async function deleteFolderFromDatabase(
  machineryUID: string,
  folderLocation: string,
  folderName: string,
): Promise<Document[]> {
  const escapedFolderID = `${folderLocation}\\${folderName}`.split("\\").join("\\\\");

  const deletionResult = await pgClient.query(
    "DELETE FROM public.machinery_documents WHERE ((location LIKE $1) OR (location=$2 AND name=$3)) AND machinery_uid=$4 RETURNING *",
    [`${escapedFolderID}%`, folderLocation, folderName, machineryUID],
  );

  return deletionResult.map(
    (file: any) =>
      new Document(
        file.machinery_uid,
        file.document_uid,
        file.name,
        file.location,
        file.size_bytes,
        file.is_dir,
        file.is_document,
        file.is_modifiable,
        file.creation_timestamp,
        file.modification_timestamp,
        file.created_by,
        file.modified_by,
        file.is_private,
      ),
  );
}

async function getDocumentOwnershipAndPrivacyDetails(documentUID: string, machineryUID: string) {
  const result = await pgClient.oneOrNone(
    `SELECT u.company_id, md.is_private
     FROM public.machinery_documents md
     JOIN public.users u ON md.created_by = u.id
     WHERE md.document_uid=$1 AND md.machinery_uid=$2`,
    [documentUID, machineryUID],
  );

  if (!result) return null;

  return result;
}

async function isDocumentPrivate(documentName: string, machineryUID: string) {
  const result = await pgClient.oneOrNone(
    `SELECT is_private
     FROM public.machinery_documents
     WHERE name=$1 AND machinery_uid=$2`,
    [documentName, machineryUID],
  );

  if (!result) return null;

  return result.is_private;
}

export default {
  getDocument,
  getMachineryDocuments,
  createMachineryFolder,
  uploadMachineryDocuments,
  renameFileOrFolder,
  deleteMachineryDocuments,
  getDocumentOwnershipAndPrivacyDetails,
  isDocumentPrivate,
};
