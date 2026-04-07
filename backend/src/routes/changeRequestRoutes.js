import express from "express";

import {
  analyzeImpact,
  createChangeRequest,
  getChangeRequests
} from "../controllers/changeRequestController.js";

const router = express.Router();

router.get("/analyze-impact/:reqId", analyzeImpact);
router.route("/").get(getChangeRequests).post(createChangeRequest);

export default router;
