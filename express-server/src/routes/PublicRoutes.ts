import express from "express";
import controller from "../controllers/PublicController";
import { body, query } from "express-validator";

const router = express.Router();

/* GET */

router.get("/logout", query("id").isInt(), query("token").notEmpty(), controller.logout);

router.get("/refreshtoken/", query("id").isInt(), query("token").notEmpty(), controller.refreshToken);

router.get("/status", controller.status);

/* POST */

router.post("/login", body("email").notEmpty().isEmail(), body("password").notEmpty(), controller.login);

export default router;
