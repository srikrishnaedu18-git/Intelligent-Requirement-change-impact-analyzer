import { useEffect, useMemo, useState } from "react";

import {
  initialChangeRequestForm,
  initialLinkForm,
  initialProjectForm,
  initialRequirementDetailForm,
  initialRequirementForm,
  priorityStyles,
  quickLinks,
  statusStyles
} from "./constants/appConstants";
import { AuditTimelineSection } from "./features/audit/AuditTimelineSection";
import { ChangeRequestsSection } from "./features/change-requests/ChangeRequestsSection";
import { DashboardSummary } from "./features/dashboard/DashboardSummary";
import { OverviewSection } from "./features/dashboard/OverviewSection";
import { CreateProjectModal } from "./features/projects/CreateProjectModal";
import { Sidebar } from "./features/projects/Sidebar";
import { RequirementDetailsModal } from "./features/requirements/RequirementDetailsModal";
import { RequirementForm } from "./features/requirements/RequirementForm";
import { RequirementsRegister } from "./features/requirements/RequirementsRegister";
import { TraceabilitySection } from "./features/traceability/TraceabilitySection";
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

const App = () => {
  const [formData, setFormData] = useState(initialRequirementForm);
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
  const [isRequirementModalEditing, setIsRequirementModalEditing] =
    useState(false);
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

    return requirements.filter(
      (requirement) =>
        requirement.reqId.toLowerCase().includes(term) ||
        requirement.title.toLowerCase().includes(term)
    );
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

    return { total, approved, implemented, highPriority, orphanRequirements };
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

  const traceabilityMatrix = useMemo(
    () =>
      requirements.map((requirement) => {
        const linkedEntries = traceabilityLinks.filter(
          (link) => link.requirement?._id === requirement._id
        );

        return {
          ...requirement,
          linkedEntries,
          coverageStatus: linkedEntries.length > 0 ? "Covered" : "Orphan"
        };
      }),
    [requirements, traceabilityLinks]
  );

  const filteredAuditLogs = useMemo(() => {
    const term = auditSearchTerm.trim().toLowerCase();

    if (!term) {
      return auditLogs;
    }

    return auditLogs.filter(
      (log) =>
        log.action?.toLowerCase().includes(term) ||
        log.entityType?.toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term)
    );
  }, [auditLogs, auditSearchTerm]);

  const activeProject = useMemo(
    () => projects.find((project) => project._id === activeProjectId) || null,
    [projects, activeProjectId]
  );

  const handleSimpleChange = (setter) => (event) => {
    const { name, value } = event.target;
    setter((current) => ({ ...current, [name]: value }));
  };

  const handleChange = handleSimpleChange(setFormData);
  const handleProjectChange = handleSimpleChange(setProjectFormData);
  const handleLinkChange = handleSimpleChange(setLinkFormData);
  const handleChangeRequestChange = handleSimpleChange(setChangeRequestForm);
  const handleRequirementDetailChange = handleSimpleChange(setRequirementDetailForm);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = { ...formData, projectId: activeProjectId, tags: [] };

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

      setFormData(initialRequirementForm);
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

  const resetRequirementForm = () => {
    setEditingRequirementId("");
    setFormData(initialRequirementForm);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetLinkForm = () => {
    setEditingLinkId("");
    setLinkFormData(initialLinkForm);
    setLinkErrorMessage("");
    setLinkSuccessMessage("");
  };

  const resetChangeRequestForm = () => {
    setEditingChangeRequestId("");
    setChangeRequestForm(initialChangeRequestForm);
    setImpactSummary(null);
    setChangeRequestError("");
    setChangeRequestSuccess("");
  };

  const handleRequirementDelete = async (requirement) => {
    if (!window.confirm(`Delete requirement ${requirement.reqId}?`)) {
      return;
    }

    setDeletingId(requirement._id);

    try {
      await deleteRequirement(requirement._id);
      setRequirements((current) => current.filter((item) => item._id !== requirement._id));
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

  const handleLinkDelete = async (link) => {
    if (!window.confirm("Delete this traceability link?")) {
      return;
    }

    setDeletingId(link._id);

    try {
      await deleteTraceabilityLink(link._id);
      setTraceabilityLinks((current) => current.filter((item) => item._id !== link._id));

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

  const handleChangeRequestDelete = async (request) => {
    if (!window.confirm("Delete this change request?")) {
      return;
    }

    setDeletingId(request._id);

    try {
      await deleteChangeRequest(request._id);
      setChangeRequests((current) => current.filter((item) => item._id !== request._id));

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <Sidebar
          projects={projects}
          activeProject={activeProject}
          activeProjectId={activeProjectId}
          openProjectMenuId={openProjectMenuId}
          quickLinks={quickLinks}
          onSelectProject={setActiveProjectId}
          onToggleProjectMenu={(projectId) =>
            setOpenProjectMenuId((current) => (current === projectId ? "" : projectId))
          }
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
        />

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
            </div>
          </div>

          <div className="flex min-h-screen flex-col">
            <OverviewSection
              quickLinks={quickLinks}
              dashboardMetrics={dashboardMetrics}
              stats={stats}
              changeRequestStats={changeRequestStats}
            />

            <DashboardSummary
              stats={stats}
              traceabilityLinks={traceabilityLinks}
              changeRequestStats={changeRequestStats}
              dashboardMetrics={dashboardMetrics}
              auditLogs={auditLogs}
            />

            <main
              id="requirements"
              className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_1.6fr]"
            >
              <RequirementForm
                formData={formData}
                editingRequirementId={editingRequirementId}
                submitting={submitting}
                errorMessage={errorMessage}
                successMessage={successMessage}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={resetRequirementForm}
              />

              <RequirementsRegister
                loading={loading}
                filteredRequirements={filteredRequirements}
                searchTerm={searchTerm}
                deletingId={deletingId}
                priorityStyles={priorityStyles}
                statusStyles={statusStyles}
                onSearchChange={setSearchTerm}
                onOpenRequirementDetails={openRequirementDetails}
                onDeleteRequirement={handleRequirementDelete}
              />
            </main>

            <TraceabilitySection
              requirements={requirements}
              linkFormData={linkFormData}
              editingLinkId={editingLinkId}
              linkSubmitting={linkSubmitting}
              linkErrorMessage={linkErrorMessage}
              linkSuccessMessage={linkSuccessMessage}
              traceabilityLinks={traceabilityLinks}
              traceabilityMatrix={traceabilityMatrix}
              linksLoading={linksLoading}
              deletingId={deletingId}
              onLinkChange={handleLinkChange}
              onLinkSubmit={handleLinkSubmit}
              onResetLinkForm={resetLinkForm}
              onStartLinkEdit={(link) => {
                setEditingLinkId(link._id);
                setLinkFormData({
                  requirement: link.requirement?._id || "",
                  codeModule: link.codeModule,
                  testCase: link.testCase
                });
                setLinkErrorMessage("");
                setLinkSuccessMessage("");
              }}
              onDeleteLink={handleLinkDelete}
            />

            <ChangeRequestsSection
              requirements={requirements}
              changeRequestForm={changeRequestForm}
              editingChangeRequestId={editingChangeRequestId}
              impactLoading={impactLoading}
              impactSummary={impactSummary}
              changeRequestError={changeRequestError}
              changeRequestSuccess={changeRequestSuccess}
              crSubmitting={crSubmitting}
              crLoading={crLoading}
              changeRequests={changeRequests}
              deletingId={deletingId}
              onChange={handleChangeRequestChange}
              onAnalyzeImpact={handleAnalyzeImpact}
              onSubmit={handleChangeRequestSubmit}
              onReset={resetChangeRequestForm}
              onStartEdit={(request) => {
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
              }}
              onDelete={handleChangeRequestDelete}
            />

            <AuditTimelineSection
              auditLoading={auditLoading}
              auditLogs={auditLogs}
              auditSearchTerm={auditSearchTerm}
              filteredAuditLogs={filteredAuditLogs}
              onSearchChange={setAuditSearchTerm}
            />

            <RequirementDetailsModal
              selectedRequirement={selectedRequirement}
              isRequirementModalEditing={isRequirementModalEditing}
              requirementDetailForm={requirementDetailForm}
              submitting={submitting}
              onClose={closeRequirementDetails}
              onEditChange={handleRequirementDetailChange}
              onStartEdit={() => setIsRequirementModalEditing(true)}
              onCancelEdit={() => {
                setIsRequirementModalEditing(false);
                setRequirementDetailForm({
                  reqId: selectedRequirement.reqId,
                  title: selectedRequirement.title,
                  description: selectedRequirement.description,
                  priority: selectedRequirement.priority,
                  status: selectedRequirement.status
                });
              }}
              onSave={handleRequirementDetailSave}
            />

            <CreateProjectModal
              isOpen={isProjectModalOpen}
              projectFormData={projectFormData}
              projectSubmitting={projectSubmitting}
              onChange={handleProjectChange}
              onClose={() => {
                setIsProjectModalOpen(false);
                setProjectFormData(initialProjectForm);
              }}
              onSubmit={handleProjectSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
