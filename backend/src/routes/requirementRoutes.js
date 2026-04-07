import express from "express";

import {
  createRequirement,
  getRequirements
} from "../controllers/requirementController.js";

const router = express.Router();

router.route("/").get(getRequirements).post(createRequirement);

export default router;
