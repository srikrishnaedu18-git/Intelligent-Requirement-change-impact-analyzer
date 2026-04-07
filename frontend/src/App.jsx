import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ClipboardList,
  GitBranch,
  Link2,
  PlusCircle,
  Search,
  ShieldCheck
} from "lucide-react";

import {
  analyzeImpact,
  createChangeRequest,
  createRequirement,
  createTraceabilityLink,
  getAuditLogs,
  getChangeRequests,
  getRequirements,
  getTraceabilityLinks
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

const initialForm = {
  reqId: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Draft",
  tags: ""
};

const initialLinkForm = {
  requirement: "",
  codeModule: "",
  testCase: ""
};

const initialChangeRequestForm = {
  requirement: "",
  description: "",
  proposedChange: ""
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
  const [requirements, setRequirements] = useState([]);
  const [traceabilityLinks, setTraceabilityLinks] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [crLoading, setCrLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [crSubmitting, setCrSubmitting] = useState(false);
  const [impactLoading, setImpactLoading] = useState(false);
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

  const loadAuditLogs = async () => {
    const auditLogData = await getAuditLogs();
    setAuditLogs(auditLogData);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setLinksLoading(true);
        setCrLoading(true);
        setAuditLoading(true);
        const [requirementsData, linksData, changeRequestsData, auditLogData] = await Promise.all([
          getRequirements(),
          getTraceabilityLinks(),
          getChangeRequests(),
          getAuditLogs()
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
  }, []);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      };

      const createdRequirement = await createRequirement(payload);
      setRequirements((current) => [createdRequirement, ...current]);
      setFormData(initialForm);
      setSuccessMessage(`Requirement ${createdRequirement.reqId} created successfully.`);
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
      const createdLink = await createTraceabilityLink({
        ...linkFormData,
        coverageStatus: "Covered"
      });

      setTraceabilityLinks((current) => [createdLink, ...current]);
      setLinkFormData(initialLinkForm);
      setLinkSuccessMessage(
        `Traceability link created for ${createdLink.requirement?.reqId || "selected requirement"}.`
      );
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
      const summary = await analyzeImpact(changeRequestForm.requirement);
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
        const summary = await analyzeImpact(changeRequestForm.requirement);
        setImpactSummary(summary);
      }

      const createdRequest = await createChangeRequest(changeRequestForm);
      setChangeRequests((current) => [createdRequest, ...current]);
      setChangeRequestForm(initialChangeRequestForm);
      setImpactSummary(null);
      setChangeRequestSuccess(
        `Change request created for ${createdRequest.requirement?.reqId}.`
      );
      await loadAuditLogs();
    } catch (error) {
      setChangeRequestError(error.message);
    } finally {
      setCrSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10">
        <header className="border-b border-white/10 pb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
            Intelligent Requirement Change Impact Analyzer
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white">
            Requirements Manager
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Phase 2 turns your SCM blueprint into a working source of truth for
            requirement identification, prioritization, and lifecycle tracking.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module) => {
            const Icon = module.icon;

            return (
              <article
                key={module.title}
                className={`rounded-3xl border bg-gradient-to-br p-5 ${module.tone}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {module.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-200">
                      {module.summary}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

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
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-xl font-semibold text-white">
                Status Accounting Dashboard
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                A simple SCM metrics layer showing traceability coverage,
                lifecycle progress, and current change-control activity.
              </p>
            </div>

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
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-xl font-semibold text-white">
                Audit Summary
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Journal activity generated by requirement creation, traceability
                updates, and change requests.
              </p>
            </div>

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

        <main className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_1.6fr]">
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-blue-300" />
              <h2 className="text-xl font-semibold text-white">
                Add Requirement
              </h2>
            </div>

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

              <Field
                label="Tags"
                name="tags"
                placeholder="security, login, access-control"
                value={formData.tags}
                onChange={handleChange}
              />

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

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Saving requirement..." : "Create Requirement"}
              </button>
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
              <div className="hidden grid-cols-[1fr_2fr_1fr_1fr_1.4fr] gap-4 bg-slate-900/80 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:grid">
                <span>Req ID</span>
                <span>Title</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Tags</span>
              </div>

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
                <div className="divide-y divide-white/10">
                  {filteredRequirements.map((requirement) => (
                    <div
                      key={requirement._id}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_2fr_1fr_1fr_1.4fr] md:items-center"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Req ID
                        </p>
                        <p className="font-medium text-blue-200">
                          {requirement.reqId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Title
                        </p>
                        <p className="text-sm text-white">{requirement.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {requirement.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Priority
                        </p>
                        <p className={`text-sm font-medium ${priorityStyles[requirement.priority]}`}>
                          {requirement.priority}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Status
                        </p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[requirement.status]}`}
                        >
                          {requirement.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 md:hidden">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(requirement.tags || []).length > 0 ? (
                            requirement.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.4fr]">
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-semibold text-white">
                Create Traceability Link
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Connect a requirement to a code module and a test case so your RTM
              can reveal coverage gaps and orphan items.
            </p>

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

              <button
                type="submit"
                disabled={linkSubmitting || requirements.length === 0}
                className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {linkSubmitting ? "Saving link..." : "Create Link"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-xl font-semibold text-white">
                Traceability Matrix View
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Requirements without links are marked as orphan, making SCM
                coverage gaps easy to demonstrate.
              </p>
            </div>

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

        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.4fr]">
          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-semibold text-white">
                Raise Change Request
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Select a requirement, preview its blast radius, and submit a formal
              change request with an automatically classified risk level.
            </p>

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

              <button
                type="submit"
                disabled={crSubmitting || requirements.length === 0}
                className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {crSubmitting ? "Submitting change request..." : "Submit Change Request"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-white/10 bg-card p-6">
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-xl font-semibold text-white">
                Recent Change Requests
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                This list shows the generated impact score, risk classification,
                and requirement context for each CR.
              </p>
            </div>

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

        <section className="mt-8 rounded-3xl border border-white/10 bg-card p-6">
          <div className="border-b border-white/10 pb-5">
            <h2 className="text-xl font-semibold text-white">
              Audit Timeline
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              This fulfills the SCM journal and status-accounting requirement by
              showing a chronological trail of configuration activity.
            </p>
          </div>

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
              <div className="space-y-4">
                {auditLogs.map((log) => (
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
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <article className="rounded-3xl border border-white/10 bg-card p-5">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </article>
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
