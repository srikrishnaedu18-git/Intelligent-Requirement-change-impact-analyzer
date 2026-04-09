import { Search, Trash2 } from "lucide-react";

import { ActionButton } from "../../components/common/ui";

export const RequirementsRegister = ({
  loading,
  filteredRequirements,
  searchTerm,
  deletingId,
  priorityStyles,
  statusStyles,
  onSearchChange,
  onOpenRequirementDetails,
  onDeleteRequirement
}) => (
  <section className="rounded-3xl border border-white/10 bg-card p-6">
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Requirements Register
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Search by requirement ID or title to simulate enterprise requirement
          lookup.
        </p>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search REQ-001 or authentication"
          className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>
    </div>

    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
      {loading ? (
        <div className="px-5 py-8 text-sm text-slate-300">
          Loading requirements...
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="px-5 py-8 text-sm text-slate-300">
          No requirements found yet. Add your first SCM requirement from the
          form.
        </div>
      ) : (
        <>
          <div className="hidden max-h-[31rem] overflow-y-auto overflow-x-hidden md:block">
            <table className="w-full table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <th className="w-[15%] whitespace-nowrap px-4 py-4">Req ID</th>
                  <th className="w-[38%] px-4 py-4">Title</th>
                  <th className="w-[14%] whitespace-nowrap px-4 py-4 pr-8">
                    Priority
                  </th>
                  <th className="w-[16%] whitespace-nowrap px-6 py-4 pl-8">
                    Status
                  </th>
                  <th className="w-[17%] whitespace-nowrap px-4 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((requirement) => (
                  <tr key={requirement._id} className="align-middle">
                    <td className="px-4 py-3 font-medium text-blue-200">
                      {requirement.reqId}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          onOpenRequirementDetails(requirement);
                        }}
                        className="text-sm font-medium text-white transition hover:text-blue-300 hover:underline"
                      >
                        {requirement.title}
                      </a>
                    </td>
                    <td
                      className={`px-4 py-3 pr-8 text-sm font-medium ${priorityStyles[requirement.priority]}`}
                    >
                      {requirement.priority}
                    </td>
                    <td className="px-6 py-3 pl-8">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[requirement.status]}`}
                      >
                        {requirement.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionButton
                          icon={Trash2}
                          label={
                            deletingId === requirement._id ? "Deleting..." : "Delete"
                          }
                          onClick={() => onDeleteRequirement(requirement)}
                          tone="danger"
                          disabled={deletingId === requirement._id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-white/10 md:hidden">
            {filteredRequirements.map((requirement) => (
              <div key={requirement._id} className="space-y-3 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Req ID
                  </p>
                  <p className="mt-1 font-medium text-blue-200">
                    {requirement.reqId}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Title
                  </p>
                  <a
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenRequirementDetails(requirement);
                    }}
                    className="mt-1 inline-block text-sm font-medium text-white transition hover:text-blue-300 hover:underline"
                  >
                    {requirement.title}
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Priority
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium ${priorityStyles[requirement.priority]}`}
                    >
                      {requirement.priority}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Status
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[requirement.status]}`}
                    >
                      {requirement.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Actions
                  </p>
                  <div className="mt-2 flex gap-2">
                    <ActionButton
                      icon={Trash2}
                      label={deletingId === requirement._id ? "Deleting..." : "Delete"}
                      onClick={() => onDeleteRequirement(requirement)}
                      tone="danger"
                      disabled={deletingId === requirement._id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </section>
);
