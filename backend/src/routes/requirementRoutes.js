import express from "express";

import {
  createRequirement,
  deleteRequirement,
  getRequirements,
  updateRequirement
} from "../controllers/requirementController.js";

const router = express.Router();

router.route("/").get(getRequirements).post(createRequirement);
router.route("/:id").put(updateRequirement).delete(deleteRequirement);

export default router;
