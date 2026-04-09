import { Activity, Pencil, Trash2 } from "lucide-react";

import {
  ActionButton,
  BlastRadiusCard,
  RiskBadge,
  SectionHeader,
  SectionTitle,
  SelectField,
  TextAreaField
} from "../../components/common/ui";

export const ChangeRequestsSection = ({
  requirements,
  changeRequestForm,
  editingChangeRequestId,
  impactLoading,
  impactSummary,
  changeRequestError,
  changeRequestSuccess,
  crSubmitting,
  crLoading,
  changeRequests,
  deletingId,
  onChange,
  onAnalyzeImpact,
  onSubmit,
  onReset,
  onStartEdit,
  onDelete
}) => (
  <section id="changes" className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.4fr]">
    <section className="rounded-3xl border border-white/10 bg-card p-6">
      <SectionTitle
        icon={Activity}
        title={editingChangeRequestId ? "Edit Change Request" : "Raise Change Request"}
        description="Preview blast radius first, then submit a formal change request with automatic risk classification."
        iconClassName="text-amber-300"
      />

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <SelectField
          label="Requirement"
          name="requirement"
          value={changeRequestForm.requirement}
          onChange={onChange}
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
          onChange={onChange}
        />
        <TextAreaField
          label="Proposed Change"
          name="proposedChange"
          placeholder="Describe the exact functional or technical change."
          value={changeRequestForm.proposedChange}
          onChange={onChange}
        />
        <SelectField
          label="Status"
          name="status"
          value={changeRequestForm.status}
          onChange={onChange}
          options={["Pending", "Approved"]}
        />

        <button
          type="button"
          onClick={onAnalyzeImpact}
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
              onClick={onReset}
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
                    onClick={() => onStartEdit(request)}
                  />
                  <ActionButton
                    icon={Trash2}
                    label={deletingId === request._id ? "Deleting..." : "Delete"}
                    onClick={() => onDelete(request)}
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
);
