import Requirement from "../models/Requirement.js";
import ChangeRequest from "../models/ChangeRequest.js";
import TraceabilityLink from "../models/TraceabilityLink.js";
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

export const updateRequirement = async (req, res) => {
  const { id } = req.params;
  const { reqId, title, description, priority, status, tags } = req.body;

  const requirement = await Requirement.findById(id);

  if (!requirement) {
    return res.status(404).json({ message: "Requirement not found" });
  }

  requirement.reqId = reqId;
  requirement.title = title;
  requirement.description = description;
  requirement.priority = priority;
  requirement.status = status;
  requirement.tags = Array.isArray(tags) ? tags : [];

  await requirement.save();

  await createAuditLog({
    action: "UPDATE",
    entityType: "Requirement",
    entityId: requirement._id.toString(),
    details: `Requirement ${requirement.reqId} updated`
  });

  return res.json(requirement);
};

export const deleteRequirement = async (req, res) => {
  const { id } = req.params;

  const requirement = await Requirement.findById(id);

  if (!requirement) {
    return res.status(404).json({ message: "Requirement not found" });
  }

  await Promise.all([
    TraceabilityLink.deleteMany({ requirement: requirement._id }),
    ChangeRequest.deleteMany({ requirement: requirement._id }),
    Requirement.findByIdAndDelete(id)
  ]);

  await createAuditLog({
    action: "DELETE",
    entityType: "Requirement",
    entityId: requirement._id.toString(),
    details: `Requirement ${requirement.reqId} deleted with related records`
  });

  return res.json({ message: "Requirement deleted successfully" });
};
