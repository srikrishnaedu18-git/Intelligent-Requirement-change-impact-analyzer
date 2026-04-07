import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import auditLogRoutes from "./routes/auditLogRoutes.js";
import changeRequestRoutes from "./routes/changeRequestRoutes.js";
import requirementRoutes from "./routes/requirementRoutes.js";
import traceabilityRoutes from "./routes/traceabilityRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "scm-backend" });
});

app.use("/api/requirements", requirementRoutes);
app.use("/api/traceability-links", traceabilityRoutes);
app.use("/api/change-requests", changeRequestRoutes);
app.use("/api/audit-logs", auditLogRoutes);

export default app;
