import { PlusCircle } from "lucide-react";

import {
  Field,
  SectionTitle,
  SelectField,
  TextAreaField
} from "../../components/common/ui";

export const RequirementForm = ({
  formData,
  editingRequirementId,
  submitting,
  errorMessage,
  successMessage,
  onChange,
  onSubmit,
  onCancel
}) => (
  <section className="rounded-3xl border border-white/10 bg-card p-6">
    <SectionTitle
      icon={PlusCircle}
      title={editingRequirementId ? "Edit Requirement" : "Add Requirement"}
      description="Capture requirement identity, business intent, and lifecycle state in one place."
      iconClassName="text-blue-300"
    />

    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <Field
        label="Requirement ID"
        name="reqId"
        placeholder="REQ-001"
        value={formData.reqId}
        onChange={onChange}
      />
      <Field
        label="Title"
        name="title"
        placeholder="User authentication must support role-based access"
        value={formData.title}
        onChange={onChange}
      />
      <TextAreaField
        label="Description"
        name="description"
        placeholder="Describe the requirement in a way that supports traceability and change analysis."
        value={formData.description}
        onChange={onChange}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={onChange}
          options={["Low", "Medium", "High"]}
        />
        <SelectField
          label="Status"
          name="status"
          value={formData.status}
          onChange={onChange}
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
            onClick={onCancel}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  </section>
);
