import dotenv from "dotenv";

import { connectDatabase } from "../config/db.js";
import AuditLog from "../models/AuditLog.js";
import ChangeRequest from "../models/ChangeRequest.js";
import Project from "../models/Project.js";
import Requirement from "../models/Requirement.js";
import TraceabilityLink from "../models/TraceabilityLink.js";
import { createAuditLog } from "../utils/audit.js";

dotenv.config();

const projectSeeds = [
  {
    name: "Project Alpha",
    description: "Access control and audit governance workspace.",
    status: "Active",
    isDefault: true,
    requirements: [
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
        title: "Password reset with email verification",
        description:
          "Password reset must require secure token validation and email-based verification before credential changes.",
        priority: "Medium",
        status: "Approved",
        tags: ["security", "email", "recovery"]
      }
    ],
    traceability: [
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
      }
    ],
    changeRequests: [
      {
        reqId: "REQ-001",
        description: "Expand admin roles to support release coordinators.",
        proposedChange:
          "Introduce a release-coordinator role with limited configuration approval privileges."
      }
    ]
  },
  {
    name: "Project Beta",
    description: "Payment and reporting workflow workspace.",
    status: "Active",
    isDefault: false,
    requirements: [
      {
        reqId: "REQ-001",
        title: "Payment workflow confirmation",
        description:
          "Users must receive a visible confirmation after payment submission and transaction verification.",
        priority: "High",
        status: "Draft",
        tags: ["payment", "workflow", "notification"]
      },
      {
        reqId: "REQ-002",
        title: "Manager dashboard export",
        description:
          "Managers should be able to export dashboard metrics for weekly reporting and governance reviews.",
        priority: "Low",
        status: "Draft",
        tags: ["reporting", "dashboard", "export"]
      },
      {
        reqId: "REQ-003",
        title: "Payment retry guidance",
        description:
          "The system must provide retry guidance when a payment confirmation fails.",
        priority: "Medium",
        status: "Approved",
        tags: ["payment", "support", "retry"]
      }
    ],
    traceability: [
      {
        reqId: "REQ-001",
        codeModule: "payment-confirmation-service.js",
        testCase: "payment-confirmation.spec.js"
      },
      {
        reqId: "REQ-003",
        codeModule: "retry-guidance-handler.js",
        testCase: "payment-retry-flow.spec.js"
      }
    ],
    changeRequests: [
      {
        reqId: "REQ-001",
        description: "Add payment rollback visibility for failed confirmations.",
        proposedChange:
          "Display rollback status and support retry instructions for failed settlement events."
      }
    ]
  },
  {
    name: "Project Gamma",
    description: "Issue-code traceability and delivery assurance workspace.",
    status: "Planning",
    isDefault: false,
    requirements: [
      {
        reqId: "REQ-001",
        title: "Code issue traceability mapping",
        description:
          "Each critical issue must be linked to its impacted module and verification artifact.",
        priority: "High",
        status: "Approved",
        tags: ["traceability", "issues", "mapping"]
      },
      {
        reqId: "REQ-002",
        title: "Release blocker classification",
        description:
          "The system should identify whether an issue blocks release readiness based on linked components.",
        priority: "Medium",
        status: "Draft",
        tags: ["release", "classification", "issues"]
      },
      {
        reqId: "REQ-003",
        title: "Issue audit summary export",
        description:
          "Auditors should be able to review issue-to-code linkage history in a summarized form.",
        priority: "Low",
        status: "Draft",
        tags: ["audit", "export", "issues"]
      }
    ],
    traceability: [
      {
        reqId: "REQ-001",
        codeModule: "issue-link-resolver.js",
        testCase: "issue-link-resolver.spec.js"
      }
    ],
    changeRequests: [
      {
        reqId: "REQ-002",
        description: "Refine release blocker scoring for unresolved code issues.",
        proposedChange:
          "Increase visibility for unresolved issue links in release-readiness review."
      }
    ]
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

const syncProjectAwareIndexes = async () => {
  const requirementCollection = Requirement.collection;

  try {
    const existingIndexes = await requirementCollection.indexes();
    const hasLegacyReqIdIndex = existingIndexes.some(
      (index) => index.name === "reqId_1"
    );

    if (hasLegacyReqIdIndex) {
      await requirementCollection.dropIndex("reqId_1");
      console.log("Dropped legacy reqId_1 index from requirements.");
    }
  } catch (error) {
    console.warn("Could not inspect/drop legacy requirement indexes:", error.message);
  }

  await Requirement.syncIndexes();
  await TraceabilityLink.syncIndexes();
  await ChangeRequest.syncIndexes();
  await AuditLog.syncIndexes();
  await Project.syncIndexes();
};

const seedProjectWorkspace = async (projectSeed) => {
  const project = await Project.create({
    name: projectSeed.name,
    description: projectSeed.description,
    status: projectSeed.status,
    isDefault: projectSeed.isDefault
  });

  const requirementsByReqId = new Map();

  for (const requirementSeed of projectSeed.requirements) {
    const requirement = await Requirement.create({
      ...requirementSeed,
      project: project._id
    });

    requirementsByReqId.set(requirement.reqId, requirement);

    await createAuditLog({
      project: project._id,
      action: "CREATE",
      entityType: "Requirement",
      entityId: requirement._id.toString(),
      details: `Seeded requirement ${requirement.reqId} in ${project.name}`
    });
  }

  for (const traceabilitySeed of projectSeed.traceability) {
    const requirement = requirementsByReqId.get(traceabilitySeed.reqId);

    if (!requirement) {
      continue;
    }

    const link = await TraceabilityLink.create({
      project: project._id,
      requirement: requirement._id,
      codeModule: traceabilitySeed.codeModule,
      testCase: traceabilitySeed.testCase,
      coverageStatus: "Covered"
    });

    await createAuditLog({
      project: project._id,
      action: "LINK_CREATED",
      entityType: "TraceabilityLink",
      entityId: link._id.toString(),
      details: `Seeded traceability link for ${requirement.reqId} in ${project.name}`
    });
  }

  for (const changeRequestSeed of projectSeed.changeRequests) {
    const requirement = requirementsByReqId.get(changeRequestSeed.reqId);

    if (!requirement) {
      continue;
    }

    const links = await TraceabilityLink.find({
      project: project._id,
      requirement: requirement._id
    });

    const impactScore =
      10 +
      links.filter((link) => Boolean(link.codeModule)).length * 20 +
      (requirement.priority === "High" ? 15 : 0);

    const changeRequest = await ChangeRequest.create({
      project: project._id,
      requirement: requirement._id,
      description: changeRequestSeed.description,
      proposedChange: changeRequestSeed.proposedChange,
      impactScore,
      riskLevel: getRiskLevel(impactScore),
      status: "Pending"
    });

    await createAuditLog({
      project: project._id,
      action: "CR_CREATED",
      entityType: "ChangeRequest",
      entityId: changeRequest._id.toString(),
      details: `Seeded change request for ${requirement.reqId} in ${project.name}`
    });
  }

  return project;
};

const main = async () => {
  await connectDatabase();
  await syncProjectAwareIndexes();

  await Promise.all([
    AuditLog.deleteMany({}),
    ChangeRequest.deleteMany({}),
    TraceabilityLink.deleteMany({}),
    Requirement.deleteMany({}),
    Project.deleteMany({})
  ]);

  const seededProjects = [];

  for (const projectSeed of projectSeeds) {
    const project = await seedProjectWorkspace(projectSeed);
    seededProjects.push(project);
  }

  console.log("Demo data seeded successfully.");
  console.log(
    `Projects: ${seededProjects.map((project) => project.name).join(", ")}`
  );
  console.log(`Project Count: ${await Project.countDocuments()}`);
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
