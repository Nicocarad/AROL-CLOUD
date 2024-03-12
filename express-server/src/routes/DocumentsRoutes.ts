import express from "express";
import jwtAuthentication from "../middlewares/JwtAuthentication";
import controller from "../controllers/DocumentsController";
import multer from "multer";
import { query, body } from "express-validator";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

/* GET */

router.get(
  "/document/",
  query("machineryUID").notEmpty(),
  query("documentUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getDocument,
);

router.get(
  "/all/",
  query("machineryUID").notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.getMachineryDocuments,
);

/* PUT */

router.put(
  "/folder/",
  query("machineryUID").notEmpty(),
  body("folderPath").exists().notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.createMachineryFolder,
);

router.put(
  "/files/",
  query("machineryUID").notEmpty(),
  query("isPrivate").isBoolean(),
  jwtAuthentication.authenticateToken,
  upload.array("files"),
  controller.uploadMachineryDocuments,
);

/* POST */

router.post(
  "/rename/",
  query("machineryUID").exists().notEmpty(),
  body("oldFileID").exists().notEmpty(),
  body("documentUID").exists(),
  body("newFileName").exists().notEmpty(),
  body("oldFileName").exists().notEmpty(),
  body("type").exists().notEmpty(),
  jwtAuthentication.authenticateToken,
  controller.renameMachineryFileOrFolder,
);

/* DELETE */

router.delete(
  "/",
  query("machineryUID").notEmpty(),
  body("documentsList").exists(),
  jwtAuthentication.authenticateToken,
  controller.deleteMachineryDocuments,
);

export default router;
