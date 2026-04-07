import express from "express";

import {
  createTraceabilityLink,
  deleteTraceabilityLink,
  getTraceabilityLinks,
  updateTraceabilityLink
} from "../controllers/traceabilityController.js";

const router = express.Router();

router.route("/").get(getTraceabilityLinks).post(createTraceabilityLink);
router.route("/:id").put(updateTraceabilityLink).delete(deleteTraceabilityLink);

export default router;
