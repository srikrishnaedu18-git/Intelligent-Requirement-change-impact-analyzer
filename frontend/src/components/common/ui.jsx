export const StatCard = ({ label, value }) => (
  <article className="rounded-3xl border border-white/10 bg-card p-5 shadow-lg shadow-black/10">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
  </article>
);

export const HeroKpi = ({ label, value }) => (
  <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </article>
);

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  disabled = false
}) => {
  const tones = {
    default: "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
        tones[tone]
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};

export const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="border-b border-white/10 pb-5">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
      {eyebrow}
    </p>
    <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
    <p className="mt-2 text-sm text-slate-300">{description}</p>
  </div>
);

export const SectionTitle = ({
  icon: Icon,
  title,
  description,
  iconClassName = "text-white"
}) => (
  <div>
    <div className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${iconClassName}`} />
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

export const MetricPill = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-xl font-semibold text-white">{value}</p>
  </div>
);

export const RiskBadge = ({ riskLevel }) => {
  const styles = {
    Standard: "bg-emerald-600/20 text-emerald-200",
    Normal: "bg-amber-600/20 text-amber-200",
    Emergency: "bg-rose-600/20 text-rose-200"
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[riskLevel] || "bg-white/5 text-slate-200"
      }`}
    >
      {riskLevel}
    </span>
  );
};

export const BlastRadiusCard = ({ impactSummary }) => (
  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-amber-200">
          Blast Radius Summary
        </p>
        <p className="mt-2 text-lg font-semibold text-white">
          {impactSummary.requirement?.reqId} - {impactSummary.requirement?.title}
        </p>
      </div>
      <RiskBadge riskLevel={impactSummary.riskLevel} />
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <MetricPill label="Impact Score" value={impactSummary.impactScore} />
      <MetricPill label="Linked Modules" value={impactSummary.linkedModules} />
      <MetricPill label="Linked Tests" value={impactSummary.linkedTests} />
    </div>
  </div>
);

export const MetricPanel = ({ label, value, helper, tone, percent }) => {
  const barStyles = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500"
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${barStyles[tone] || "bg-white"}`}
          style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
        />
      </div>
    </article>
  );
};

export const MiniStat = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-sm text-slate-400">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${tone}`}>{value}</p>
  </div>
);

export const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm leading-6 text-slate-100">{value}</p>
  </div>
);

export const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <input
      {...props}
      required
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
    />
  </label>
);

export const TextAreaField = ({ label, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <textarea
      {...props}
      required
      rows="4"
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
    />
  </label>
);

export const SelectField = ({ label, options, placeholder, ...props }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
    <select
      {...props}
      required
      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => {
        if (typeof option === "string") {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        }

        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  </label>
);
