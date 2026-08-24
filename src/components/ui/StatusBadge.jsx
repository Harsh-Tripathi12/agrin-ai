export default function StatusBadge({
  status = "default",
  children,
}) {
  const styles = {
    success:
      "bg-green-50 text-green-700 border-green-200",

    warning:
      "bg-amber-50 text-amber-700 border-amber-200",

    danger:
      "bg-red-50 text-red-700 border-red-200",

    info:
      "bg-blue-50 text-blue-700 border-blue-200",

    default:
      "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status] || styles.default}`}
    >
      {children}
    </span>
  );
}