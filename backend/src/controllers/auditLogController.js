import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (_req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
  res.json(logs);
};
