import { MoreVertical } from "lucide-react";

export const Sidebar = ({
  projects,
  activeProject,
  activeProjectId,
  openProjectMenuId,
  quickLinks,
  onSelectProject,
  onToggleProjectMenu,
  onOpenProjectModal
}) => (
  <aside className="sticky top-4 hidden w-72 shrink-0 rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/20 backdrop-blur lg:flex lg:flex-col">
    <div className="border-b border-white/10 p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        Projects
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-white">
        {activeProject?.name || "Project Workspace"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {activeProject?.description ||
          "Create and switch between project-specific SCM workspaces."}
      </p>
    </div>

    <div className="border-b border-white/10 p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">
        Project List
      </p>
      <div className="space-y-2">
        {projects.map((project) => (
          <div
            key={project._id}
            className={`rounded-2xl border px-4 py-3 transition ${
              activeProjectId === project._id
                ? "border-blue-400/40 bg-blue-500/10"
                : "border-white/10 bg-white/5 hover:border-blue-400/30 hover:bg-blue-500/5"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectProject(project._id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-sm font-semibold text-white">{project.name}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {project.description || "No description"}
                </p>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleProjectMenu(project._id);
                }}
                className="rounded-xl border border-white/10 bg-slate-950/40 p-2 text-slate-300 transition hover:bg-white/10"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {openProjectMenuId === project._id ? (
              <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                {quickLinks.map((link) => (
                  <a
                    key={`${project._id}-${link.href}`}
                    href={link.href}
                    onClick={() => {
                      onSelectProject(project._id);
                      onToggleProjectMenu("");
                    }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-200 transition hover:border-blue-400/30 hover:bg-blue-500/10"
                  >
                    <span>{link.label}</span>
                    <span className="text-slate-500">#</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onOpenProjectModal}
        className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Add Project
      </button>
    </div>
  </aside>
);
