import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({ action, entityType, entityId, details }) =>
  AuditLog.create({
    action,
    entityType,
    entityId,
    details
  });
