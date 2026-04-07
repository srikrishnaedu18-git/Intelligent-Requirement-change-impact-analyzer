import express from "express";

import {
  analyzeImpact,
  createChangeRequest,
  deleteChangeRequest,
  getChangeRequests,
  updateChangeRequest
} from "../controllers/changeRequestController.js";

const router = express.Router();

router.get("/analyze-impact/:reqId", analyzeImpact);
router.route("/").get(getChangeRequests).post(createChangeRequest);
router.route("/:id").put(updateChangeRequest).delete(deleteChangeRequest);

export default router;
