import express from "express";
import machineryRepository from "../repositories/MachineriesRepository";
import documentsRepository from "../repositories/DocumentsRepository";
import userRepository from "../repositories/UserRepository";

interface RenameFileDetails {
  oldFileID: string;
  documentUID: string;
  newFileName: string;
  oldFileName: string;
  type: string;
}

/* RETRIVE */

// [SERVER] -- Get a document from a machinery by its UID and machinery UID
async function getDocument(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(401).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsRead) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.getDocument(machineryUID, req.query.documentUID!.toString(), companyID);
  if (result) return res.contentType("application/pdf").status(200).send(result);

  return res.status(404).json();
}

// [SERVER] -- Get all documents from a machinery by its UID
async function getMachineryDocuments(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(401).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsRead) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.getMachineryDocuments(machineryUID, companyID);
  if (result) return res.status(200).json(result);

  return res.status(404).json();
}

/* CREATE */

// [SERVER] -- Create a new folder in a machinery
async function createMachineryFolder(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;

  if (!userID || !companyID || !roles) return res.status(401).json({ msg: "Missing user details" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.createMachineryFolder(req.body.folderPath, machineryUID, userID, companyID);
  if (result) return res.status(200).json(result);

  return res.status(500).json();
}

// [SERVER] -- Upload a file or folder to a machinery
async function uploadMachineryDocuments(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;
  const parentFolderPath = req.body.parentFolderPath;

  if (!parentFolderPath.startsWith("\\" + machineryUID)) return res.status(401).json({ msg: "Bad parent folder path" });

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.uploadMachineryDocuments(
    userID,
    machineryUID,
    parentFolderPath,
    req.files as Express.Multer.File[],
    companyID,
    req.query.isPrivate === "true",
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json();
}

/* UPDATE */

// [SERVER] -- Rename a file or folder associated with a machinery
async function renameMachineryFileOrFolder(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;
  const renameDetails = req.body as RenameFileDetails;

  if (!renameDetails.oldFileID.startsWith("\\" + machineryUID)) return res.status(401).json({ msg: "Bad file path" });

  if (renameDetails.documentUID) {
    // if documentUID is null, it means that item to rename is a folder
    const documentAccess = await documentsRepository.getDocumentOwnershipAndPrivacyDetails(
      renameDetails.documentUID,
      machineryUID,
    );
    if (Number(companyID) !== 0 ? Number(documentAccess.company_id) === 0 : documentAccess.is_private) {
      return res.status(403).json({ msg: `Cannot rename ${Number(companyID) !== 0 ? "AROL" : "private"} documents` });
    }
  } else {
    const isPrivate = await documentsRepository.isDocumentPrivate(renameDetails.oldFileName, machineryUID);
    if ((isPrivate && Number(companyID) === 0) || (!isPrivate && Number(companyID) !== 0)) {
      const errorMsg = isPrivate ? "Cannot rename private folders" : "Cannot rename AROL folders";
      return res.status(403).json({ msg: errorMsg });
    }
  }

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsModify) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.renameFileOrFolder(
    renameDetails.oldFileID,
    renameDetails.documentUID,
    renameDetails.newFileName,
    renameDetails.type,
    machineryUID,
    companyID,
  );
  if (result) return res.status(200).json(result);

  return res.status(500).json();
}

/* DELETE */

// [SERVER] -- Delete a list of documents from a machinery by its UID
async function deleteMachineryDocuments(req: express.Request, res: express.Response) {
  const userID = req.principal.id as number;
  const companyID = req.principal.companyID as number;
  const roles = req.principal.roles as string[];
  const machineryUID = req.query.machineryUID as string;
  const documentsList = req.body.documentsList;

  for (const document of documentsList) {
    if (!document.id.startsWith("\\" + machineryUID)) return res.status(401).json({ msg: "Bad file path" });

    if (document.documentUID) {
      // if documentUID is null, it means that item to rename is a folder
      const documentAccess = await documentsRepository.getDocumentOwnershipAndPrivacyDetails(
        document.documentUID,
        machineryUID,
      );
      if (Number(companyID) !== 0 ? Number(documentAccess.company_id) === 0 : documentAccess.is_private) {
        return res.status(403).json({ msg: `Cannot delete ${Number(companyID) !== 0 ? "AROL" : "private"} documents` });
      }
    } else {
      const isPrivate = await documentsRepository.isDocumentPrivate(document.name, machineryUID);
      if ((isPrivate && Number(companyID) === 0) || (!isPrivate && Number(companyID) !== 0)) {
        const errorMsg = isPrivate ? "Cannot rename private folders" : "Cannot rename AROL folders";
        return res.status(403).json({ msg: errorMsg });
      }
    }
  }

  const rolesToCheck = ["COMPANY_ROLE_ADMIN", "AROL_ROLE_CHIEF"];
  if (!roles.some((role) => rolesToCheck.includes(role))) {
    const userPermissions = await userRepository.getUserPermissionsForMachinery(userID, machineryUID);
    if (!userPermissions || !userPermissions.documentsWrite) return res.sendStatus(403);
  }

  const machineryOwnership = await machineryRepository.verifyMachineryOwnershipByUID(machineryUID, companyID);
  if (!machineryOwnership) return res.status(403).json({ msg: "Machinery not owned" });

  const result = await documentsRepository.deleteMachineryDocuments(machineryUID, documentsList, companyID);
  if (result) return res.status(200).json(result);

  return res.status(500).json();
}

export default {
  getDocument,
  getMachineryDocuments,
  createMachineryFolder,
  uploadMachineryDocuments,
  renameMachineryFileOrFolder,
  deleteMachineryDocuments,
};
