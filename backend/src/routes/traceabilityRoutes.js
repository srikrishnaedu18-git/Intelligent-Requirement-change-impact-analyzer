import express from "express";

import {
  createTraceabilityLink,
  getTraceabilityLinks
} from "../controllers/traceabilityController.js";

const router = express.Router();

router.route("/").get(getTraceabilityLinks).post(createTraceabilityLink);

export default router;
