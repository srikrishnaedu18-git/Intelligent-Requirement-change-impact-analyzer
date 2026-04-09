import {
  DetailCard,
  Field,
  SelectField,
  TextAreaField
} from "../../components/common/ui";
import { formatTimestamp } from "../../utils/formatters";

export const RequirementDetailsModal = ({
  selectedRequirement,
  isRequirementModalEditing,
  requirementDetailForm,
  submitting,
  onClose,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSave
}) => {
  if (!selectedRequirement) {
    return null;
  }

  return (
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
            onClick={onClose}
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
              onChange={onEditChange}
            />
            <Field
              label="Title"
              name="title"
              placeholder="Requirement title"
              value={requirementDetailForm.title}
              onChange={onEditChange}
            />
            <TextAreaField
              label="Description"
              name="description"
              placeholder="Requirement description"
              value={requirementDetailForm.description}
              onChange={onEditChange}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Priority"
                name="priority"
                value={requirementDetailForm.priority}
                onChange={onEditChange}
                options={["Low", "Medium", "High"]}
              />
              <SelectField
                label="Status"
                name="status"
                value={requirementDetailForm.status}
                onChange={onEditChange}
                options={["Draft", "Approved", "Implemented"]}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DetailCard label="Priority" value={selectedRequirement.priority} />
              <DetailCard label="Status" value={selectedRequirement.status} />
              <DetailCard label="Requirement ID" value={selectedRequirement.reqId} />
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
                onClick={onCancelEdit}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={submitting}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Edit Requirement
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
