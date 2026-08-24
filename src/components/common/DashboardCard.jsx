export default function DashboardCard({
  emoji,
  title,
  value,
  subtitle,
  badge,
  children,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`animate-fade-in-up bg-white rounded-3xl border border-gray-100 p-6 shadow-sm transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-green-100" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-3xl shadow-inner">
            {emoji}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs text-gray-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {badge && badge}
      </div>

      {value && (
        <div className="mt-6">
          <p className="text-4xl font-extrabold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
      )}

      {children && (
        <div className="mt-5 pt-5 border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  );
}