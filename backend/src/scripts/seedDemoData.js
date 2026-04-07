import dotenv from "dotenv";

import { connectDatabase } from "../config/db.js";
import AuditLog from "../models/AuditLog.js";
import ChangeRequest from "../models/ChangeRequest.js";
import Requirement from "../models/Requirement.js";
import TraceabilityLink from "../models/TraceabilityLink.js";
import { createAuditLog } from "../utils/audit.js";

dotenv.config();

const requirementSeeds = [
  {
    reqId: "REQ-001",
    title: "Role-based access control for admin operations",
    description:
      "Administrative functions must be restricted by role to protect configuration changes and privileged actions.",
    priority: "High",
    status: "Approved",
    tags: ["security", "admin", "access-control"]
  },
  {
    reqId: "REQ-002",
    title: "User login audit trail",
    description:
      "The system should record successful and failed login attempts for compliance and forensic tracking.",
    priority: "Medium",
    status: "Implemented",
    tags: ["audit", "login", "compliance"]
  },
  {
    reqId: "REQ-003",
    title: "Payment workflow confirmation",
    description:
      "Users must receive a visible confirmation after payment submission and transaction verification.",
    priority: "High",
    status: "Draft",
    tags: ["payment", "workflow", "notification"]
  },
  {
    reqId: "REQ-004",
    title: "Password reset with email verification",
    description:
      "Password reset must require secure token validation and email-based verification before credential changes.",
    priority: "Medium",
    status: "Approved",
    tags: ["security", "email", "recovery"]
  },
  {
    reqId: "REQ-005",
    title: "Manager dashboard export",
    description:
      "Managers should be able to export dashboard metrics for weekly reporting and governance reviews.",
    priority: "Low",
    status: "Draft",
    tags: ["reporting", "dashboard", "export"]
  }
];

const traceabilitySeeds = [
  {
    reqId: "REQ-001",
    codeModule: "admin-access-controller.js",
    testCase: "rbac-admin.spec.js"
  },
  {
    reqId: "REQ-001",
    codeModule: "permissions-policy.js",
    testCase: "permission-guard.spec.js"
  },
  {
    reqId: "REQ-002",
    codeModule: "login-audit-service.js",
    testCase: "login-audit.integration.test.js"
  },
  {
    reqId: "REQ-004",
    codeModule: "password-reset-service.js",
    testCase: "password-reset-flow.spec.js"
  }
];

const changeRequestSeeds = [
  {
    reqId: "REQ-001",
    description: "Expand admin roles to support release coordinators.",
    proposedChange:
      "Introduce a release-coordinator role with limited configuration approval privileges."
  },
  {
    reqId: "REQ-003",
    description: "Add payment rollback visibility for failed confirmations.",
    proposedChange:
      "Display rollback status and support retry instructions for failed settlement events."
  }
];

const getRiskLevel = (score) => {
  if (score > 60) {
    return "Emergency";
  }

  if (score >= 30) {
    return "Normal";
  }

  return "Standard";
};

const main = async () => {
  await connectDatabase();

  await Promise.all([
    AuditLog.deleteMany({}),
    ChangeRequest.deleteMany({}),
    TraceabilityLink.deleteMany({}),
    Requirement.deleteMany({})
  ]);

  const requirementsByReqId = new Map();

  for (const requirementSeed of requirementSeeds) {
    const requirement = await Requirement.create(requirementSeed);
    requirementsByReqId.set(requirement.reqId, requirement);

    await createAuditLog({
      action: "CREATE",
      entityType: "Requirement",
      entityId: requirement._id.toString(),
      details: `Seeded requirement ${requirement.reqId}`
    });
  }

  for (const traceabilitySeed of traceabilitySeeds) {
    const requirement = requirementsByReqId.get(traceabilitySeed.reqId);

    if (!requirement) {
      continue;
    }

    const link = await TraceabilityLink.create({
      requirement: requirement._id,
      codeModule: traceabilitySeed.codeModule,
      testCase: traceabilitySeed.testCase,
      coverageStatus: "Covered"
    });

    await createAuditLog({
      action: "LINK_CREATED",
      entityType: "TraceabilityLink",
      entityId: link._id.toString(),
      details: `Seeded traceability link for ${requirement.reqId}`
    });
  }

  for (const changeRequestSeed of changeRequestSeeds) {
    const requirement = requirementsByReqId.get(changeRequestSeed.reqId);

    if (!requirement) {
      continue;
    }

    const links = await TraceabilityLink.find({ requirement: requirement._id });
    const impactScore =
      10 +
      links.filter((link) => Boolean(link.codeModule)).length * 20 +
      (requirement.priority === "High" ? 15 : 0);

    const changeRequest = await ChangeRequest.create({
      requirement: requirement._id,
      description: changeRequestSeed.description,
      proposedChange: changeRequestSeed.proposedChange,
      impactScore,
      riskLevel: getRiskLevel(impactScore),
      status: "Pending"
    });

    await createAuditLog({
      action: "CR_CREATED",
      entityType: "ChangeRequest",
      entityId: changeRequest._id.toString(),
      details: `Seeded change request for ${requirement.reqId}`
    });
  }

  console.log("Demo data seeded successfully.");
  console.log(`Requirements: ${await Requirement.countDocuments()}`);
  console.log(`Traceability Links: ${await TraceabilityLink.countDocuments()}`);
  console.log(`Change Requests: ${await ChangeRequest.countDocuments()}`);
  console.log(`Audit Logs: ${await AuditLog.countDocuments()}`);
};

main()
  .catch((error) => {
    console.error("Failed to seed demo data", error);
    process.exit(1);
  })
  .finally(async () => {
    await Requirement.db.close();
  });
