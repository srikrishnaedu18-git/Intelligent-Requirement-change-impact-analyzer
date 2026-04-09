export const quickLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#requirements", label: "Requirements" },
  { href: "#traceability", label: "Traceability" },
  { href: "#changes", label: "Change Requests" },
  { href: "#audit", label: "Audit" }
];

export const initialRequirementForm = {
  reqId: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Draft"
};

export const initialRequirementDetailForm = {
  reqId: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Draft"
};

export const initialLinkForm = {
  requirement: "",
  codeModule: "",
  testCase: ""
};

export const initialChangeRequestForm = {
  requirement: "",
  description: "",
  proposedChange: "",
  status: "Pending"
};

export const initialProjectForm = {
  name: "",
  description: ""
};

export const statusStyles = {
  Draft: "bg-slate-700/60 text-slate-100",
  Approved: "bg-blue-600/20 text-blue-200",
  Implemented: "bg-emerald-600/20 text-emerald-200"
};

export const priorityStyles = {
  Low: "text-slate-300",
  Medium: "text-amber-200",
  High: "text-rose-200"
};
