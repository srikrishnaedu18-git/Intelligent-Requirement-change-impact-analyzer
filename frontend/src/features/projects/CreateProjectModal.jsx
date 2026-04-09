import { Field, TextAreaField } from "../../components/common/ui";

export const CreateProjectModal = ({
  isOpen,
  projectFormData,
  projectSubmitting,
  onChange,
  onClose,
  onSubmit
}) => {
  if (!isOpen) {
    return null;
  }

  return (
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
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Field
            label="Project Name"
            name="name"
            placeholder="Project Delta"
            value={projectFormData.name}
            onChange={onChange}
          />
          <TextAreaField
            label="Description"
            name="description"
            placeholder="Short project summary"
            value={projectFormData.description}
            onChange={onChange}
          />

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={onClose}
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
  );
};
