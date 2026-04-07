import TraceabilityLink from "../models/TraceabilityLink.js";
import { createAuditLog } from "../utils/audit.js";

export const getTraceabilityLinks = async (_req, res) => {
  const links = await TraceabilityLink.find()
    .populate("requirement", "reqId title priority status")
    .sort({ createdAt: -1 });

  res.json(links);
};

export const createTraceabilityLink = async (req, res) => {
  const { requirement, codeModule, testCase, coverageStatus } = req.body;

  const link = await TraceabilityLink.create({
    requirement,
    codeModule,
    testCase,
    coverageStatus
  });

  await createAuditLog({
    action: "LINK_CREATED",
    entityType: "TraceabilityLink",
    entityId: link._id.toString(),
    details: `Traceability link created for requirement ${requirement}`
  });

  const populatedLink = await link.populate(
    "requirement",
    "reqId title priority status"
  );

  res.status(201).json(populatedLink);
};

export const updateTraceabilityLink = async (req, res) => {
  const { id } = req.params;
  const { requirement, codeModule, testCase, coverageStatus } = req.body;

  const link = await TraceabilityLink.findById(id);

  if (!link) {
    return res.status(404).json({ message: "Traceability link not found" });
  }

  link.requirement = requirement;
  link.codeModule = codeModule;
  link.testCase = testCase;
  link.coverageStatus = coverageStatus;

  await link.save();

  await createAuditLog({
    action: "LINK_UPDATED",
    entityType: "TraceabilityLink",
    entityId: link._id.toString(),
    details: `Traceability link ${link._id.toString()} updated`
  });

  const populatedLink = await link.populate(
    "requirement",
    "reqId title priority status"
  );

  return res.json(populatedLink);
};

export const deleteTraceabilityLink = async (req, res) => {
  const { id } = req.params;

  const link = await TraceabilityLink.findById(id).populate(
    "requirement",
    "reqId"
  );

  if (!link) {
    return res.status(404).json({ message: "Traceability link not found" });
  }

  await TraceabilityLink.findByIdAndDelete(id);

  await createAuditLog({
    action: "LINK_DELETED",
    entityType: "TraceabilityLink",
    entityId: link._id.toString(),
    details: `Traceability link deleted for ${link.requirement?.reqId || "requirement"}`
  });

  return res.json({ message: "Traceability link deleted successfully" });
};
