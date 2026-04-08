import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async ({
  project,
  action,
  entityType,
  entityId,
  details
}) =>
  AuditLog.create({
    project,
    action,
    entityType,
    entityId,
    details
  });
