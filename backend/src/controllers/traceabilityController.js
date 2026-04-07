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
