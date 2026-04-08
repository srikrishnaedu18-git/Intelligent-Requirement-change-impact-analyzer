import AuditLog from "../models/AuditLog.js";
import { resolveProject } from "../utils/projectContext.js";

export const getAuditLogs = async (req, res) => {
  const project = await resolveProject({ projectId: req.query.projectId });
  const logs = await AuditLog.find({ project: project._id })
    .sort({ timestamp: -1 })
    .limit(100);
  res.json(logs);
};
