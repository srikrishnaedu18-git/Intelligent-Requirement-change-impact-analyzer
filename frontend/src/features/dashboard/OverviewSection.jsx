import { HeroKpi } from "../../components/common/ui";

export const OverviewSection = ({
  quickLinks,
  dashboardMetrics,
  stats,
  changeRequestStats
}) => (
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
            Build, trace, analyze, and audit requirements in one unified
            workspace. This dashboard turns SCM theory into a practical
            demonstration of identification, change control, status accounting,
            and auditability.
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
);
