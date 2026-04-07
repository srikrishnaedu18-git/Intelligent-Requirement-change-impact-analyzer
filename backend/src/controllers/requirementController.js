import Requirement from "../models/Requirement.js";
import { createAuditLog } from "../utils/audit.js";

export const getRequirements = async (_req, res) => {
  const requirements = await Requirement.find().sort({ createdAt: -1 });
  res.json(requirements);
};

export const createRequirement = async (req, res) => {
  const { reqId, title, description, priority, status, tags } = req.body;

  const requirement = await Requirement.create({
    reqId,
    title,
    description,
    priority,
    status,
    tags: Array.isArray(tags) ? tags : []
  });

  await createAuditLog({
    action: "CREATE",
    entityType: "Requirement",
    entityId: requirement._id.toString(),
    details: `Requirement ${requirement.reqId} created`
  });

  res.status(201).json(requirement);
};
