import {
  MetricPanel,
  MiniStat,
  SectionHeader,
  StatCard
} from "../../components/common/ui";

export const DashboardSummary = ({
  stats,
  traceabilityLinks,
  changeRequestStats,
  dashboardMetrics,
  auditLogs
}) => (
  <>
    <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Requirements" value={stats.total} />
      <StatCard label="Approved" value={stats.approved} />
      <StatCard label="Implemented" value={stats.implemented} />
      <StatCard label="High Priority" value={stats.highPriority} />
    </section>

    <section className="mt-4 grid gap-4 md:grid-cols-2">
      <StatCard label="Traceability Links" value={traceabilityLinks.length} />
      <StatCard label="Orphan Requirements" value={stats.orphanRequirements} />
    </section>

    <section className="mt-4 grid gap-4 md:grid-cols-3">
      <StatCard label="Change Requests" value={changeRequestStats.total} />
      <StatCard label="Normal Risk CRs" value={changeRequestStats.normal} />
      <StatCard label="Emergency CRs" value={changeRequestStats.emergency} />
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
  </>
);
