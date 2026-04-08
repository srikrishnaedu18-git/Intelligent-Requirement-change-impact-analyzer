import express from "express";

import {
  createProject,
  getProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.route("/").get(getProjects).post(createProject);

export default router;
