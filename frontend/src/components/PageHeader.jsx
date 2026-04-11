import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: "border border-white/10 bg-[#242426] text-white shadow-sm ring-1 ring-sky-400/30",
  emerald: "border border-white/10 bg-[#242426] text-white shadow-sm ring-1 ring-emerald-400/30",
  amber: "border border-white/10 bg-[#242426] text-white shadow-sm ring-1 ring-amber-300/30",
  violet: "border border-white/10 bg-[#242426] text-white shadow-sm ring-1 ring-violet-400/30",
  rose: "border border-white/10 bg-[#242426] text-white shadow-sm ring-1 ring-rose-400/30",
  slate: "border border-white/10 bg-[#242426] text-white",
};

const Breadcrumb = ({ breadcrumbs }) => {
  if (!breadcrumbs?.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/45">
      {breadcrumbs.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
          {crumb.href ? (
            <Link
              to={crumb.href}
              className="text-white/55 transition-colors hover:text-white/90"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-white/90">{crumb.label}</span>
          )}
          {index < breadcrumbs.length - 1 && (
            <span className="opacity-30">/</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  breadcrumbs,
  actions = [],
  stats = [],
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#242426] transition-all duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="dot-grid" />
      </div>

      <div className="relative space-y-6 p-6 lg:p-7">
        <Breadcrumb breadcrumbs={breadcrumbs} />

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-1 items-start gap-4">
            {Icon && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-white/85">
                <Icon className="h-6 w-6" strokeWidth={2.3} />
              </div>
            )}
            <div>
              {badge && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/55">
                  {badge}
                </span>
              )}
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white lg:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-base text-white/60">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action, index) => (
                <div key={index} className="shrink-0">
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className={cn(
                  "rounded-2xl border px-4 py-3",
                  toneStyles[stat.tone] || toneStyles.slate
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-current/70">
                  {stat.label}
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  {stat.isLoading ? (
                    <div className="h-6 w-24 rounded-full skeleton" />
                  ) : (
                    <p className="text-2xl font-semibold leading-none">{stat.value}</p>
                  )}
                  {stat.trend && (
                    <span className="text-xs font-semibold text-current/80">
                      {stat.trend}
                    </span>
                  )}
                </div>
                {stat.helper && (
                  <p className="mt-1 text-xs text-current/70">{stat.helper}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
