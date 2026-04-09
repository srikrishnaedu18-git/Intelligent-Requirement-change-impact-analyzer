import { Search } from "lucide-react";

import { SectionHeader } from "../../components/common/ui";
import { formatTimestamp } from "../../utils/formatters";

export const AuditTimelineSection = ({
  auditLoading,
  auditLogs,
  auditSearchTerm,
  filteredAuditLogs,
  onSearchChange
}) => (
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
          No audit activity yet. Create, link, or change a requirement to start
          the journal.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="mb-4">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={auditSearchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
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
);
