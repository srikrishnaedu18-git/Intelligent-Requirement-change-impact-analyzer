import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ClipboardList,
  GitBranch,
  Link2,
  MoreVertical,
  Pencil,
  PlusCircle,
  Search,
  Sparkles,
  ShieldCheck,
  Trash2
} from "lucide-react";

import {
  analyzeImpact,
  createChangeRequest,
  createProject,
  createRequirement,
  createTraceabilityLink,
  deleteChangeRequest,
  deleteRequirement,
  deleteTraceabilityLink,
  getAuditLogs,
  getChangeRequests,
  getProjects,
  getRequirements,
  getTraceabilityLinks,
  updateChangeRequest,
  updateRequirement,
  updateTraceabilityLink
} from "./services/api";

const moduleCards = [
  {
    title: "Requirements Manager",
    summary: "Live in Phase 2",
    icon: ClipboardList,
    tone: "from-blue-700/30 to-blue-500/10 border-blue-600/40"
  },
  {
    title: "Change Request Portal",
    summary: "Live in Phase 4",
    icon: Activity,
    tone: "from-amber-600/30 to-amber-500/10 border-amber-500/40"
  },
  {
    title: "Traceability Matrix",
    summary: "Live in Phase 3",
    icon: GitBranch,
    tone: "from-emerald-700/30 to-emerald-500/10 border-emerald-500/40"
  },
  {
    title: "Audit Log Dashboard",
    summary: "Live in Phase 5",
    icon: ShieldCheck,
    tone: "from-violet-700/30 to-violet-500/10 border-violet-500/40"
  }
];

const quickLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#requirements", label: "Requirements" },
  { href: "#traceability", label: "Traceability" },
  { href: "#changes", label: "Change Requests" },
  { href: "#audit", label: "Audit" }
];

const initialForm = {
  reqId: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Draft"
};

const initialRequirementDetailForm = {
  reqId: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Draft"
};

const initialLinkForm = {
  requirement: "",
  codeModule: "",
  testCase: ""
};

const initialChangeRequestForm = {
  requirement: "",
  description: "",
  proposedChange: "",
  status: "Pending"
};

const initialProjectForm = {
  name: "",
  description: ""
};

const statusStyles = {
  Draft: "bg-slate-700/60 text-slate-100",
  Approved: "bg-blue-600/20 text-blue-200",
  Implemented: "bg-emerald-600/20 text-emerald-200"
};

const priorityStyles = {
  Low: "text-slate-300",
  Medium: "text-amber-200",
  High: "text-rose-200"
};

const App = () => {
  const [formData, setFormData] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [projectFormData, setProjectFormData] = useState(initialProjectForm);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [traceabilityLinks, setTraceabilityLinks] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [crLoading, setCrLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [crSubmitting, setCrSubmitting] = useState(false);
  const [impactLoading, setImpactLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [linkFormData, setLinkFormData] = useState(initialLinkForm);
  const [linkErrorMessage, setLinkErrorMessage] = useState("");
  const [linkSuccessMessage, setLinkSuccessMessage] = useState("");
  const [changeRequestForm, setChangeRequestForm] = useState(
    initialChangeRequestForm
  );
  const [changeRequestError, setChangeRequestError] = useState("");
  const [changeRequestSuccess, setChangeRequestSuccess] = useState("");
  const [impactSummary, setImpactSummary] = useState(null);
  const [editingRequirementId, setEditingRequirementId] = useState("");
  const [editingLinkId, setEditingLinkId] = useState("");
  const [editingChangeRequestId, setEditingChangeRequestId] = useState("");
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isRequirementModalEditing, setIsRequirementModalEditing] = useState(false);
  const [requirementDetailForm, setRequirementDetailForm] = useState(
    initialRequirementDetailForm
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [openProjectMenuId, setOpenProjectMenuId] = useState("");

  const loadAuditLogs = async () => {
    const auditLogData = await getAuditLogs(activeProjectId);
    setAuditLogs(auditLogData);
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectData = await getProjects();
        setProjects(projectData);

        if (!activeProjectId && projectData.length > 0) {
          const defaultProject =
            projectData.find((project) => project.isDefault) || projectData[0];
          setActiveProjectId(defaultProject._id);
        }
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    loadProjects();
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeProjectId) {
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setLinksLoading(true);
        setCrLoading(true);
        setAuditLoading(true);
        const [requirementsData, linksData, changeRequestsData, auditLogData] =
          await Promise.all([
            getRequirements(activeProjectId),
            getTraceabilityLinks(activeProjectId),
            getChangeRequests(activeProjectId),
            getAuditLogs(activeProjectId)
          ]);
        setRequirements(requirementsData);
        setTraceabilityLinks(linksData);
        setChangeRequests(changeRequestsData);
        setAuditLogs(auditLogData);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
        setLinksLoading(false);
        setCrLoading(false);
        setAuditLoading(false);
      }
    };

    loadDashboardData();
  }, [activeProjectId]);

  const filteredRequirements = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return requirements;
    }

    return requirements.filter((requirement) => {
      return (
        requirement.reqId.toLowerCase().includes(term) ||
        requirement.title.toLowerCase().includes(term)
      );
    });
  }, [requirements, searchTerm]);

  const stats = useMemo(() => {
    const total = requirements.length;
    const approved = requirements.filter(
      (requirement) => requirement.status === "Approved"
    ).length;
    const implemented = requirements.filter(
      (requirement) => requirement.status === "Implemented"
    ).length;
    const highPriority = requirements.filter(
      (requirement) => requirement.priority === "High"
    ).length;

    const orphanRequirements = requirements.filter(
      (requirement) =>
        !traceabilityLinks.some((link) => link.requirement?._id === requirement._id)
    ).length;

    return {
      total,
      approved,
      implemented,
      highPriority,
      orphanRequirements
    };
  }, [requirements, traceabilityLinks]);

  const changeRequestStats = useMemo(() => {
    const total = changeRequests.length;
    const emergency = changeRequests.filter(
      (request) => request.riskLevel === "Emergency"
    ).length;
    const normal = changeRequests.filter(
      (request) => request.riskLevel === "Normal"
    ).length;

    return { total, emergency, normal };
  }, [changeRequests]);

  const dashboardMetrics = useMemo(() => {
    const coveredRequirements = stats.total - stats.orphanRequirements;
    const coveragePercent =
      stats.total === 0 ? 0 : Math.round((coveredRequirements / stats.total) * 100);
    const approvedPercent =
      stats.total === 0 ? 0 : Math.round((stats.approved / stats.total) * 100);
    const implementedPercent =
      stats.total === 0 ? 0 : Math.round((stats.implemented / stats.total) * 100);

    return {
      coveredRequirements,
      coveragePercent,
      approvedPercent,
      implementedPercent
    };
  }, [stats]);

  const traceabilityMatrix = useMemo(() => {
    return requirements.map((requirement) => {
      const linkedEntries = traceabilityLinks.filter(
        (link) => link.requirement?._id === requirement._id
      );

      return {
        ...requirement,
        linkedEntries,
        coverageStatus: linkedEntries.length > 0 ? "Covered" : "Orphan"
      };
    });
  }, [requirements, traceabilityLinks]);

  const filteredAuditLogs = useMemo(() => {
    const term = auditSearchTerm.trim().toLowerCase();

    if (!term) {
      return auditLogs;
    }

    return auditLogs.filter((log) => {
      return (
        log.action?.toLowerCase().includes(term) ||
        log.entityType?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
      );
    });
  }, [auditLogs, auditSearchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setProjectFormData((current) => ({ ...current, [name]: value }));
  };

  const handleLinkChange = (event) => {
    const { name, value } = event.target;
    setLinkFormData((current) => ({ ...current, [name]: value }));
  };

  const handleChangeRequestChange = (event) => {
    const { name, value } = event.target;
    setChangeRequestForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        ...formData,
        projectId: activeProjectId,
        tags: []
      };

      if (editingRequirementId) {
        const updatedRequirement = await updateRequirement(editingRequirementId, payload);
        setRequirements((current) =>
          current.map((requirement) =>
            requirement._id === editingRequirementId ? updatedRequirement : requirement
          )
        );
        setSuccessMessage(`Requirement ${updatedRequirement.reqId} updated successfully.`);
      } else {
        const createdRequirement = await createRequirement(payload);
        setRequirements((current) => [createdRequirement, ...current]);
        setSuccessMessage(`Requirement ${createdRequirement.reqId} created successfully.`);
      }

      setFormData(initialForm);
      setEditingRequirementId("");
      await loadAuditLogs();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkSubmit = async (event) => {
    event.preventDefault();
    setLinkSubmitting(true);
    setLinkErrorMessage("");
    setLinkSuccessMessage("");

    try {
      const payload = {
        ...linkFormData,
        projectId: activeProjectId,
        coverageStatus: "Covered"
      };

      if (editingLinkId) {
        const updatedLink = await updateTraceabilityLink(editingLinkId, payload);
        setTraceabilityLinks((current) =>
          current.map((link) => (link._id === editingLinkId ? updatedLink : link))
        );
        setLinkSuccessMessage(
          `Traceability link updated for ${updatedLink.requirement?.reqId || "selected requirement"}.`
        );
      } else {
        const createdLink = await createTraceabilityLink(payload);
        setTraceabilityLinks((current) => [createdLink, ...current]);
        setLinkSuccessMessage(
          `Traceability link created for ${createdLink.requirement?.reqId || "selected requirement"}.`
        );
      }

      setLinkFormData(initialLinkForm);
      setEditingLinkId("");
      await loadAuditLogs();
    } catch (error) {
      setLinkErrorMessage(error.message);
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleAnalyzeImpact = async () => {
    if (!changeRequestForm.requirement) {
      setChangeRequestError("Select a requirement to analyze impact.");
      return;
    }

    setImpactLoading(true);
    setChangeRequestError("");

    try {
      const summary = await analyzeImpact(
        changeRequestForm.requirement,
        activeProjectId
      );
      setImpactSummary(summary);
    } catch (error) {
      setChangeRequestError(error.message);
    } finally {
      setImpactLoading(false);
    }
  };

  const handleChangeRequestSubmit = async (event) => {
    event.preventDefault();
    setCrSubmitting(true);
    setChangeRequestError("");
    setChangeRequestSuccess("");

    try {
      if (!impactSummary || impactSummary.requirement?._id !== changeRequestForm.requirement) {
        const summary = await analyzeImpact(
          changeRequestForm.requirement,
          activeProjectId
        );
        setImpactSummary(summary);
      }

      if (editingChangeRequestId) {
        const updatedRequest = await updateChangeRequest(editingChangeRequestId, {
          ...changeRequestForm,
          status: changeRequestForm.status
        });
        setChangeRequests((current) =>
          current.map((request) =>
            request._id === editingChangeRequestId ? updatedRequest : request
          )
        );
        setChangeRequestSuccess(
          `Change request updated for ${updatedRequest.requirement?.reqId}.`
        );
      } else {
        const createdRequest = await createChangeRequest({
          ...changeRequestForm,
          projectId: activeProjectId
        });
        setChangeRequests((current) => [createdRequest, ...current]);
        setChangeRequestSuccess(
          `Change request created for ${createdRequest.requirement?.reqId}.`
        );
      }

      setChangeRequestForm(initialChangeRequestForm);
      setImpactSummary(null);
      setEditingChangeRequestId("");
      await loadAuditLogs();
    } catch (error) {
      setChangeRequestError(error.message);
    } finally {
      setCrSubmitting(false);
    }
  };

  const startRequirementEdit = (requirement) => {
    setEditingRequirementId(requirement._id);
    setFormData({
      reqId: requirement.reqId,
      title: requirement.title,
      description: requirement.description,
      priority: requirement.priority,
      status: requirement.status
    });
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetRequirementForm = () => {
    setEditingRequirementId("");
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleRequirementDelete = async (requirement) => {
    if (!window.confirm(`Delete requirement ${requirement.reqId}?`)) {
      return;
    }

    setDeletingId(requirement._id);

    try {
      await deleteRequirement(requirement._id);
      setRequirements((current) =>
        current.filter((item) => item._id !== requirement._id)
      );
      setTraceabilityLinks((current) =>
        current.filter((link) => link.requirement?._id !== requirement._id)
      );
      setChangeRequests((current) =>
        current.filter((request) => request.requirement?._id !== requirement._id)
      );

      if (editingRequirementId === requirement._id) {
        resetRequirementForm();
      }

      await loadAuditLogs();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setDeletingId("");
    }
  };

  const openRequirementDetails = (requirement) => {
    setSelectedRequirement(requirement);
    setRequirementDetailForm({
      reqId: requirement.reqId,
      title: requirement.title,
      description: requirement.description,
      priority: requirement.priority,
      status: requirement.status
    });
    setIsRequirementModalEditing(false);
  };

  const closeRequirementDetails = () => {
    setSelectedRequirement(null);
    setIsRequirementModalEditing(false);
    setRequirementDetailForm(initialRequirementDetailForm);
  };

  const handleRequirementDetailChange = (event) => {
    const { name, value } = event.target;
    setRequirementDetailForm((current) => ({ ...current, [name]: value }));
  };

  const handleRequirementDetailSave = async () => {
    if (!selectedRequirement) {
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const updatedRequirement = await updateRequirement(selectedRequirement._id, {
        ...requirementDetailForm,
        tags: selectedRequirement.tags || []
      });

      setRequirements((current) =>
        current.map((requirement) =>
          requirement._id === updatedRequirement._id ? updatedRequirement : requirement
        )
      );
      setSelectedRequirement(updatedRequirement);
      setRequirementDetailForm({
        reqId: updatedRequirement.reqId,
        title: updatedRequirement.title,
        description: updatedRequirement.description,
        priority: updatedRequirement.priority,
        status: updatedRequirement.status
      });
      setIsRequirementModalEditing(false);
      await loadAuditLogs();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setProjectSubmitting(true);

    try {
      const createdProject = await createProject(projectFormData);
      setProjects((current) => [...current, createdProject]);
      setActiveProjectId(createdProject._id);
      setProjectFormData(initialProjectForm);
      setIsProjectModalOpen(false);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setProjectSubmitting(false);
    }
  };

  const activeProject = useMemo(
    () => projects.find((project) => project._id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const startLinkEdit = (link) => {
    setEditingLinkId(link._id);
    setLinkFormData({
      requirement: link.requirement?._id || "",
      codeModule: link.codeModule,
      testCase: link.testCase
    });
    setLinkErrorMessage("");
    setLinkSuccessMessage("");
  };

  const resetLinkForm = () => {
    setEditingLinkId("");
    setLinkFormData(initialLinkForm);
    setLinkErrorMessage("");
    setLinkSuccessMessage("");
  };

  const handleLinkDelete = async (link) => {
    if (!window.confirm("Delete this traceability link?")) {
      return;
    }

    setDeletingId(link._id);

    try {
      await deleteTraceabilityLink(link._id);
      setTraceabilityLinks((current) =>
        current.filter((item) => item._id !== link._id)
      );

      if (editingLinkId === link._id) {
        resetLinkForm();
      }

      await loadAuditLogs();
    } catch (error) {
      setLinkErrorMessage(error.message);
    } finally {
      setDeletingId("");
    }
  };

  const startChangeRequestEdit = (request) => {
    setEditingChangeRequestId(request._id);
    setChangeRequestForm({
      requirement: request.requirement?._id || "",
      description: request.description,
      proposedChange: request.proposedChange,
      status: request.status || "Pending"
    });
    setImpactSummary(null);
    setChangeRequestError("");
    setChangeRequestSuccess("");
  };

  const resetChangeRequestForm = () => {
    setEditingChangeRequestId("");
    setChangeRequestForm(initialChangeRequestForm);
    setImpactSummary(null);
    setChangeRequestError("");
    setChangeRequestSuccess("");
  };

  const handleChangeRequestDelete = async (request) => {
    if (!window.confirm("Delete this change request?")) {
      return;
    }

    setDeletingId(request._id);

    try {
      await deleteChangeRequest(request._id);
      setChangeRequests((current) =>
        current.filter((item) => item._id !== request._id)
      );

      if (editingChangeRequestId === request._id) {
        resetChangeRequestForm();
      }

      await loadAuditLogs();
    } catch (error) {
      setChangeRequestError(error.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="sticky top-4 hidden w-72 shrink-0 rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/20 backdrop-blur lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Projects
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              {activeProject?.name || "Project Workspace"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {activeProject?.description ||
                "Create and switch between project-specific SCM workspaces."}
            </p>
          </div>

          <div className="border-b border-white/10 p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
              Project List
            </p>
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    activeProjectId === project._id
                      ? "border-blue-400/40 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-blue-400/30 hover:bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveProjectId(project._id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-white">{project.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {project.description || "No description"}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenProjectMenuId((current) =>
                          current === project._id ? "" : project._id
                        );
                      }}
                      className="rounded-xl border border-white/10 bg-slate-950/40 p-2 text-slate-300 transition hover:bg-white/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {openProjectMenuId === project._id ? (
                    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                      {quickLinks.map((link) => (
                        <a
                          key={`${project._id}-${link.href}`}
                          href={link.href}
                          onClick={() => {
                            setActiveProjectId(project._id);
                            setOpenProjectMenuId("");
                          }}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10"
                        >
                          <span>{link.label}</span>
                          <span className="text-slate-500">#</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsProjectModalOpen(true)}
              className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Add Project
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-4 z-20 mb-6 rounded-[1.6rem] border border-white/10 bg-slate-950/75 px-4 py-4 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Intelligent Requirement Change Impact Analyzer
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-white">
                  {activeProject?.name || "Requirement Traceability & Change Control System"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {activeProject?.description || "Select or create a project to begin."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <TopBarPill label="Requirements" value={stats.total} tone="blue" />
                <TopBarPill label="Coverage" value={`${dashboardMetrics.coveragePercent}%`} tone="emerald" />
                <TopBarPill label="Audit Entries" value={auditLogs.length} tone="violet" />
              </div>
            </div>
          </div>

          <div className="flex min-h-screen flex-col">
        <header
          id="overview"
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 lg:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]" />
          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white lg:text-5xl">
                  Intelligent Requirement Change Impact Analyzer With Code-Issue
                  Traceability Mapping
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
                  Build, trace, analyze, and audit requirements in one unified workspace.
                  This dashboard turns SCM theory into a practical demonstration of
                  identification, change control, status accounting, and auditability.
                </p>
              </div>

              <div className="grid min-w-[260px] gap-3 sm:grid-cols-2 lg:w-[320px] lg:grid-cols-1">
                <HeroKpi label="Coverage" value={`${dashboardMetrics.coveragePercent}%`} />
                <HeroKpi label="Orphans" value={stats.orphanRequirements} />
                <HeroKpi label="Change Requests" value={changeRequestStats.total} />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Requirements" value={stats.total} />
          <StatCard label="Approved" value={stats.approved} />
          <StatCard label="Implemented" value={stats.implemented} />
          <StatCard label="High Priority" value={stats.highPriority} />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <StatCard label="Traceability Links" value={traceabilityLinks.length} />
          <StatCard
            label="Orphan Requirements"
            value={stats.orphanRequirements}
          />
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <StatCard label="Change Requests" value={changeRequestStats.total} />
          <StatCard label="Normal Risk CRs" value={changeRequestStats.normal} />
          <StatCard
            label="Emergency CRs"
            value={changeRequestStats.emergency}
          />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionHeader
              eyebrow="SCM Metrics"
              title="Status Accounting Dashboard"
              description="A quick operating picture of coverage, lifecycle progress, and current change-control activity."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <MetricPanel
                label="Traceability Coverage"
                value={`${dashboardMetrics.coveragePercent}%`}
                helper={`${dashboardMetrics.coveredRequirements} of ${stats.total} requirements linked`}
                tone="emerald"
                percent={dashboardMetrics.coveragePercent}
              />
              <MetricPanel
                label="Approved Requirements"
                value={`${dashboardMetrics.approvedPercent}%`}
                helper={`${stats.approved} approved records`}
                tone="blue"
                percent={dashboardMetrics.approvedPercent}
              />
              <MetricPanel
                label="Implemented Requirements"
                value={`${dashboardMetrics.implementedPercent}%`}
                helper={`${stats.implemented} implemented records`}
                tone="violet"
                percent={dashboardMetrics.implementedPercent}
              />
              <MetricPanel
                label="Open Change Requests"
                value={changeRequestStats.total}
                helper={`${changeRequestStats.emergency} emergency classifications`}
                tone="amber"
                percent={Math.min(changeRequestStats.total * 20, 100)}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionHeader
              eyebrow="Journal Snapshot"
              title="Audit Summary"
              description="Live roll-up of the latest SCM events captured by the audit log."
            />

            <div className="mt-6 space-y-4">
              <MiniStat
                label="Audit Entries"
                value={auditLogs.length}
                tone="text-violet-200"
              />
              <MiniStat
                label="Latest Action"
                value={auditLogs[0]?.action || "No activity yet"}
                tone="text-slate-100"
              />
              <MiniStat
                label="Latest Entity"
                value={auditLogs[0]?.entityType || "N/A"}
                tone="text-slate-100"
              />
            </div>
          </section>
        </section>

        <main
          id="requirements"
          className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_1.6fr]"
        >
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionTitle
              icon={PlusCircle}
              title={editingRequirementId ? "Edit Requirement" : "Add Requirement"}
              description="Capture requirement identity, business intent, and lifecycle state in one place."
              iconClassName="text-blue-300"
            />

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Requirement ID"
                name="reqId"
                placeholder="REQ-001"
                value={formData.reqId}
                onChange={handleChange}
              />
              <Field
                label="Title"
                name="title"
                placeholder="User authentication must support role-based access"
                value={formData.title}
                onChange={handleChange}
              />
              <TextAreaField
                label="Description"
                name="description"
                placeholder="Describe the requirement in a way that supports traceability and change analysis."
                value={formData.description}
                onChange={handleChange}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={["Low", "Medium", "High"]}
                />
                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={["Draft", "Approved", "Implemented"]}
                />
              </div>

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </p>
              ) : null}

              {successMessage ? (
                <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {successMessage}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? "Saving requirement..."
                    : editingRequirementId
                      ? "Update Requirement"
                      : "Create Requirement"}
                </button>
                {editingRequirementId ? (
                  <button
                    type="button"
                    onClick={resetRequirementForm}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Requirements Register
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Search by requirement ID or title to simulate enterprise
                  requirement lookup.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search REQ-001 or authentication"
                  className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </label>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              {loading ? (
                <div className="px-5 py-8 text-sm text-slate-300">
                  Loading requirements...
                </div>
              ) : filteredRequirements.length === 0 ? (
                <div className="px-5 py-8 text-sm text-slate-300">
                  No requirements found yet. Add your first SCM requirement from
                  the form.
                </div>
              ) : (
                <>
                  <div className="hidden max-h-[31rem] overflow-y-auto overflow-x-hidden md:block">
                    <table className="w-full table-fixed border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          <th className="whitespace-nowrap px-4 py-4 w-[15%]">Req ID</th>
                          <th className="px-4 py-4 w-[38%]">Title</th>
                          <th className="whitespace-nowrap px-4 py-4 pr-8 w-[14%]">Priority</th>
                          <th className="whitespace-nowrap px-6 py-4 pl-8 w-[16%]">Status</th>
                          <th className="whitespace-nowrap px-4 py-4 w-[17%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequirements.map((requirement) => (
                          <tr key={requirement._id} className="align-middle">
                            <td className="px-4 py-3 font-medium text-blue-200">
                              {requirement.reqId}
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  openRequirementDetails(requirement);
                                }}
                                className="text-sm font-medium text-white transition hover:text-blue-300 hover:underline"
                              >
                                {requirement.title}
                              </a>
                            </td>
                            <td
                              className={`px-4 py-3 pr-8 text-sm font-medium ${priorityStyles[requirement.priority]}`}
                            >
                              {requirement.priority}
                            </td>
                            <td className="px-6 py-3 pl-8">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[requirement.status]}`}
                              >
                                {requirement.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <ActionButton
                                  icon={Trash2}
                                  label={deletingId === requirement._id ? "Deleting..." : "Delete"}
                                  onClick={() => handleRequirementDelete(requirement)}
                                  tone="danger"
                                  disabled={deletingId === requirement._id}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="divide-y divide-white/10 md:hidden">
                    {filteredRequirements.map((requirement) => (
                      <div key={requirement._id} className="space-y-3 px-5 py-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Req ID
                          </p>
                          <p className="mt-1 font-medium text-blue-200">
                            {requirement.reqId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Title
                          </p>
                          <a
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              openRequirementDetails(requirement);
                            }}
                            className="mt-1 inline-block text-sm font-medium text-white transition hover:text-blue-300 hover:underline"
                          >
                            {requirement.title}
                          </a>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Priority
                            </p>
                            <p className={`mt-1 text-sm font-medium ${priorityStyles[requirement.priority]}`}>
                              {requirement.priority}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Status
                            </p>
                            <span
                              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[requirement.status]}`}
                            >
                              {requirement.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Actions
                          </p>
                          <div className="mt-2 flex gap-2">
                            <ActionButton
                              icon={Trash2}
                              label={deletingId === requirement._id ? "Deleting..." : "Delete"}
                              onClick={() => handleRequirementDelete(requirement)}
                              tone="danger"
                              disabled={deletingId === requirement._id}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </main>

        <section
          id="traceability"
          className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.4fr]"
        >
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionTitle
              icon={Link2}
              title={editingLinkId ? "Edit Traceability Link" : "Create Traceability Link"}
              description="Connect requirements to code modules and test cases so the RTM exposes coverage strength and orphan gaps."
              iconClassName="text-emerald-300"
            />

            <form className="mt-6 space-y-4" onSubmit={handleLinkSubmit}>
              <SelectField
                label="Requirement"
                name="requirement"
                value={linkFormData.requirement}
                onChange={handleLinkChange}
                options={requirements.map((requirement) => ({
                  label: `${requirement.reqId} - ${requirement.title}`,
                  value: requirement._id
                }))}
                placeholder="Select a requirement"
              />
              <Field
                label="Code Module"
                name="codeModule"
                placeholder="auth-controller.js"
                value={linkFormData.codeModule}
                onChange={handleLinkChange}
              />
              <Field
                label="Test Case"
                name="testCase"
                placeholder="login-test.py"
                value={linkFormData.testCase}
                onChange={handleLinkChange}
              />

              {linkErrorMessage ? (
                <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {linkErrorMessage}
                </p>
              ) : null}

              {linkSuccessMessage ? (
                <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {linkSuccessMessage}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={linkSubmitting || requirements.length === 0}
                  className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {linkSubmitting
                    ? "Saving link..."
                    : editingLinkId
                      ? "Update Link"
                      : "Create Link"}
                </button>
                {editingLinkId ? (
                  <button
                    type="button"
                    onClick={resetLinkForm}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm font-semibold text-white">Manage Existing Links</p>
              <div className="mt-3 max-h-[19rem] space-y-3 overflow-y-auto pr-1">
                {traceabilityLinks.map((link) => (
                  <div
                    key={link._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-200">
                          {link.requirement?.reqId} - {link.codeModule}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Test case: {link.testCase}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <ActionButton
                          icon={Pencil}
                          label="Edit"
                          onClick={() => startLinkEdit(link)}
                        />
                        <ActionButton
                          icon={Trash2}
                          label={deletingId === link._id ? "Deleting..." : "Delete"}
                          onClick={() => handleLinkDelete(link)}
                          tone="danger"
                          disabled={deletingId === link._id}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionHeader
              eyebrow="RTM"
              title="Traceability Matrix View"
              description="Requirements without links are marked as orphan, making SCM coverage gaps immediate and visible."
            />

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <div className="hidden grid-cols-[1fr_1.2fr_1.2fr_0.8fr] gap-4 bg-slate-900/80 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:grid">
                <span>Requirement ID</span>
                <span>Linked Code</span>
                <span>Linked Tests</span>
                <span>Coverage</span>
              </div>

              {linksLoading ? (
                <div className="px-5 py-8 text-sm text-slate-300">
                  Loading traceability matrix...
                </div>
              ) : traceabilityMatrix.length === 0 ? (
                <div className="px-5 py-8 text-sm text-slate-300">
                  Add requirements first, then create links to populate the RTM.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {traceabilityMatrix.map((row) => (
                    <div
                      key={row._id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.2fr_1.2fr_0.8fr] md:items-center"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Requirement ID
                        </p>
                        <p className="font-medium text-blue-200">{row.reqId}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {row.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Linked Code
                        </p>
                        {row.linkedEntries.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {row.linkedEntries.map((entry) => (
                              <span
                                key={`${row._id}-${entry._id}-code`}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                              >
                                {entry.codeModule}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No linked code</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Linked Tests
                        </p>
                        {row.linkedEntries.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {row.linkedEntries.map((entry) => (
                              <span
                                key={`${row._id}-${entry._id}-test`}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                              >
                                {entry.testCase}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">No linked tests</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Coverage
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            row.coverageStatus === "Covered"
                              ? "bg-emerald-600/20 text-emerald-200"
                              : "bg-rose-600/20 text-rose-200"
                          }`}
                        >
                          {row.coverageStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>

        <section
          id="changes"
          className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.4fr]"
        >
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionTitle
              icon={Activity}
              title={editingChangeRequestId ? "Edit Change Request" : "Raise Change Request"}
              description="Preview blast radius first, then submit a formal change request with automatic risk classification."
              iconClassName="text-amber-300"
            />

            <form className="mt-6 space-y-4" onSubmit={handleChangeRequestSubmit}>
              <SelectField
                label="Requirement"
                name="requirement"
                value={changeRequestForm.requirement}
                onChange={handleChangeRequestChange}
                options={requirements.map((requirement) => ({
                  label: `${requirement.reqId} - ${requirement.title}`,
                  value: requirement._id
                }))}
                placeholder="Select a requirement"
              />
              <TextAreaField
                label="Change Description"
                name="description"
                placeholder="Why is this change needed?"
                value={changeRequestForm.description}
                onChange={handleChangeRequestChange}
              />
              <TextAreaField
                label="Proposed Change"
                name="proposedChange"
                placeholder="Describe the exact functional or technical change."
                value={changeRequestForm.proposedChange}
                onChange={handleChangeRequestChange}
              />
              <SelectField
                label="Status"
                name="status"
                value={changeRequestForm.status}
                onChange={handleChangeRequestChange}
                options={["Pending", "Approved"]}
              />

              <button
                type="button"
                onClick={handleAnalyzeImpact}
                disabled={impactLoading || !changeRequestForm.requirement}
                className="w-full rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {impactLoading ? "Analyzing blast radius..." : "Analyze Impact"}
              </button>

              {impactSummary ? (
                <BlastRadiusCard impactSummary={impactSummary} />
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-5 text-sm text-slate-400">
                  Run impact analysis to generate the blast-radius summary card.
                </div>
              )}

              {changeRequestError ? (
                <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {changeRequestError}
                </p>
              ) : null}

              {changeRequestSuccess ? (
                <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {changeRequestSuccess}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={crSubmitting || requirements.length === 0}
                  className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {crSubmitting
                    ? "Submitting change request..."
                    : editingChangeRequestId
                      ? "Update Change Request"
                      : "Submit Change Request"}
                </button>
                {editingChangeRequestId ? (
                  <button
                    type="button"
                    onClick={resetChangeRequestForm}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <SectionHeader
              eyebrow="Change Control"
              title="Recent Change Requests"
              description="A live list of generated impact scores, risk classifications, and requirement context."
            />

            <div className="mt-6 space-y-4">
              {crLoading ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-8 text-sm text-slate-300">
                  Loading change requests...
                </div>
              ) : changeRequests.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-8 text-sm text-slate-300">
                  No change requests yet. Raise one after analyzing a requirement.
                </div>
              ) : (
                changeRequests.map((request) => (
                  <article
                    key={request._id}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-amber-200">
                          {request.requirement?.reqId} - {request.requirement?.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {request.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <RiskBadge riskLevel={request.riskLevel} />
                        <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                          Score {request.impactScore}
                        </span>
                        <span className="inline-flex rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-200">
                          {request.status}
                        </span>
                        <ActionButton
                          icon={Pencil}
                          label="Edit"
                          onClick={() => startChangeRequestEdit(request)}
                        />
                        <ActionButton
                          icon={Trash2}
                          label={deletingId === request._id ? "Deleting..." : "Delete"}
                          onClick={() => handleChangeRequestDelete(request)}
                          tone="danger"
                          disabled={deletingId === request._id}
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-400">
                      Proposed change: {request.proposedChange}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>

        <section
          id="audit"
          className="mt-8 rounded-3xl border border-white/10 bg-card p-6"
        >
          <SectionHeader
            eyebrow="Governance"
            title="Audit Timeline"
            description="A chronological SCM journal showing how requirements, traceability, and change control evolved over time."
          />

          <div className="mt-6">
            {auditLoading ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-8 text-sm text-slate-300">
                Loading audit timeline...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-5 py-8 text-sm text-slate-300">
                No audit activity yet. Create, link, or change a requirement to
                start the journal.
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="mb-4">
                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={auditSearchTerm}
                      onChange={(event) => setAuditSearchTerm(event.target.value)}
                      placeholder="Search action, entity, or details"
                      className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </label>
                </div>

                <div className="max-h-[34rem] space-y-4 overflow-y-auto pr-1">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-5 py-8 text-sm text-slate-400">
                      No audit entries match your search.
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <article
                        key={log._id}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5 md:grid-cols-[0.9fr_1.2fr_2fr]"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Timestamp
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Action
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex rounded-full bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-200">
                              {log.action}
                            </span>
                            <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                              {log.entityType}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                            Details
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            {log.details || `Entity ID: ${log.entityId}`}
                          </p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {selectedRequirement ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Requirement Details
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {isRequirementModalEditing
                      ? `Edit ${selectedRequirement.reqId}`
                      : `${selectedRequirement.reqId} - ${selectedRequirement.title}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeRequirementDetails}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              {isRequirementModalEditing ? (
                <div className="mt-6 space-y-4">
                  <Field
                    label="Requirement ID"
                    name="reqId"
                    placeholder="REQ-001"
                    value={requirementDetailForm.reqId}
                    onChange={handleRequirementDetailChange}
                  />
                  <Field
                    label="Title"
                    name="title"
                    placeholder="Requirement title"
                    value={requirementDetailForm.title}
                    onChange={handleRequirementDetailChange}
                  />
                  <TextAreaField
                    label="Description"
                    name="description"
                    placeholder="Requirement description"
                    value={requirementDetailForm.description}
                    onChange={handleRequirementDetailChange}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      label="Priority"
                      name="priority"
                      value={requirementDetailForm.priority}
                      onChange={handleRequirementDetailChange}
                      options={["Low", "Medium", "High"]}
                    />
                    <SelectField
                      label="Status"
                      name="status"
                      value={requirementDetailForm.status}
                      onChange={handleRequirementDetailChange}
                      options={["Draft", "Approved", "Implemented"]}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <DetailCard
                      label="Priority"
                      value={selectedRequirement.priority}
                    />
                    <DetailCard
                      label="Status"
                      value={selectedRequirement.status}
                    />
                    <DetailCard
                      label="Requirement ID"
                      value={selectedRequirement.reqId}
                    />
                    <DetailCard
                      label="Created"
                      value={formatTimestamp(selectedRequirement.createdAt)}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Description
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {selectedRequirement.description}
                    </p>
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
                {isRequirementModalEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRequirementModalEditing(false);
                        setRequirementDetailForm({
                          reqId: selectedRequirement.reqId,
                          title: selectedRequirement.title,
                          description: selectedRequirement.description,
                          priority: selectedRequirement.priority,
                          status: selectedRequirement.status
                        });
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequirementDetailSave}
                      disabled={submitting}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsRequirementModalEditing(true)}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Edit Requirement
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {isProjectModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/40">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Create Project
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    New Project Workspace
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectModalOpen(false);
                    setProjectFormData(initialProjectForm);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleProjectSubmit}>
                <Field
                  label="Project Name"
                  name="name"
                  placeholder="Project Delta"
                  value={projectFormData.name}
                  onChange={handleProjectChange}
                />
                <TextAreaField
                  label="Description"
                  name="description"
                  placeholder="Short project summary"
                  value={projectFormData.description}
                  onChange={handleProjectChange}
                />

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectModalOpen(false);
                      setProjectFormData(initialProjectForm);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={projectSubmitting}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {projectSubmitting ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <article className="rounded-3xl border border-white/10 bg-card p-5 shadow-lg shadow-black/10">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </article>
);

const HeroKpi = ({ label, value }) => (
  <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </article>
);

const TopBarPill = ({ label, value, tone }) => {
  const tones = {
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-100",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-100"
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${tones[tone] || "border-white/10 bg-white/5 text-white"}`}
    >
      <p className="text-[11px] uppercase tracking-[0.2em] opacity-75">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled = false
}) => {
  const tones = {
    default: "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        tones[tone]
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="border-b border-white/10 pb-5">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
      {eyebrow}
    </p>
    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  title,
  description,
  iconClassName = "text-white"
}) => (
  <div>
    <div className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${iconClassName}`} />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

const BlastRadiusCard = ({ impactSummary }) => (
  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-amber-200">
          Blast Radius Summary
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          {impactSummary.requirement?.reqId} - {impactSummary.requirement?.title}
        </p>
      </div>
      <RiskBadge riskLevel={impactSummary.riskLevel} />
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <MetricPill label="Impact Score" value={impactSummary.impactScore} />
      <MetricPill label="Linked Modules" value={impactSummary.linkedModules} />
      <MetricPill label="Linked Tests" value={impactSummary.linkedTests} />
    </div>
  </div>
);

const MetricPill = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-xl font-semibold text-white">{value}</p>
  </div>
);

const MetricPanel = ({ label, value, helper, tone, percent }) => {
  const barStyles = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500"
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barStyles[tone] || "bg-white"}`}
          style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
        />
      </div>
    </article>
  );
};

const MiniStat = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
  </div>
);

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm leading-6 text-slate-100">{value}</p>
  </div>
);

const RiskBadge = ({ riskLevel }) => {
  const styles = {
    Standard: "bg-emerald-600/20 text-emerald-200",
    Normal: "bg-amber-600/20 text-amber-200",
    Emergency: "bg-rose-600/20 text-rose-200"
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[riskLevel] || "bg-white/5 text-slate-200"
      }`}
    >
      {riskLevel}
    </span>
  );
};

const formatTimestamp = (timestamp) =>
  new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <input
      {...props}
      required
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
    />
  </label>
);

const TextAreaField = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <textarea
      {...props}
      required
      rows="4"
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
    />
  </label>
);

const SelectField = ({ label, options, placeholder, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <select
      {...props}
      required
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => {
        if (typeof option === "string") {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        }

        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  </label>
);

export default App;
