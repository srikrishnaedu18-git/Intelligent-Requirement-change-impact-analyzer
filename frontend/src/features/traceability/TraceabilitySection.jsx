import { Link2, Pencil, Trash2 } from "lucide-react";

import {
  ActionButton,
  Field,
  SectionHeader,
  SectionTitle,
  SelectField
} from "../../components/common/ui";

export const TraceabilitySection = ({
  requirements,
  linkFormData,
  editingLinkId,
  linkSubmitting,
  linkErrorMessage,
  linkSuccessMessage,
  traceabilityLinks,
  traceabilityMatrix,
  linksLoading,
  deletingId,
  onLinkChange,
  onLinkSubmit,
  onResetLinkForm,
  onStartLinkEdit,
  onDeleteLink
}) => (
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

      <form className="mt-6 space-y-4" onSubmit={onLinkSubmit}>
        <SelectField
          label="Requirement"
          name="requirement"
          value={linkFormData.requirement}
          onChange={onLinkChange}
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
          onChange={onLinkChange}
        />
        <Field
          label="Test Case"
          name="testCase"
          placeholder="login-test.py"
          value={linkFormData.testCase}
          onChange={onLinkChange}
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
              onClick={onResetLinkForm}
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
                    onClick={() => onStartLinkEdit(link)}
                  />
                  <ActionButton
                    icon={Trash2}
                    label={deletingId === link._id ? "Deleting..." : "Delete"}
                    onClick={() => onDeleteLink(link)}
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
                  <p className="mt-1 text-sm text-slate-400">{row.title}</p>
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
);
