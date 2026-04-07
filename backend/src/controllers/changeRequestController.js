import ChangeRequest from "../models/ChangeRequest.js";
import Requirement from "../models/Requirement.js";
import TraceabilityLink from "../models/TraceabilityLink.js";
import { createAuditLog } from "../utils/audit.js";

const getRiskLevel = (score) => {
  if (score > 60) {
    return "Emergency";
  }

  if (score >= 30) {
    return "Normal";
  }

  return "Standard";
};

export const getChangeRequests = async (_req, res) => {
  const requests = await ChangeRequest.find()
    .populate("requirement", "reqId title priority status")
    .sort({ createdAt: -1 });

  res.json(requests);
};

export const analyzeImpact = async (req, res) => {
  const { reqId } = req.params;

  const requirement = await Requirement.findById(reqId);

  if (!requirement) {
    return res.status(404).json({ message: "Requirement not found" });
  }

  const links = await TraceabilityLink.find({ requirement: requirement._id });

  const moduleCount = links.filter((link) => Boolean(link.codeModule)).length;
  const impactScore =
    10 + moduleCount * 20 + (requirement.priority === "High" ? 15 : 0);

  return res.json({
    requirement,
    linkedModules: moduleCount,
    linkedTests: links.filter((link) => Boolean(link.testCase)).length,
    impactScore,
    riskLevel: getRiskLevel(impactScore)
  });
};

export const createChangeRequest = async (req, res) => {
  const { requirement, description, proposedChange } = req.body;

  const existingRequirement = await Requirement.findById(requirement);

  if (!existingRequirement) {
    return res.status(404).json({ message: "Requirement not found" });
  }

  const links = await TraceabilityLink.find({ requirement });
  const impactScore =
    10 +
    links.filter((link) => Boolean(link.codeModule)).length * 20 +
    (existingRequirement.priority === "High" ? 15 : 0);

  const changeRequest = await ChangeRequest.create({
    requirement,
    description,
    proposedChange,
    impactScore,
    riskLevel: getRiskLevel(impactScore)
  });

  await createAuditLog({
    action: "CR_CREATED",
    entityType: "ChangeRequest",
    entityId: changeRequest._id.toString(),
    details: `Change request raised for ${existingRequirement.reqId}`
  });

  const populatedRequest = await changeRequest.populate(
    "requirement",
    "reqId title priority status"
  );

  res.status(201).json(populatedRequest);
};
