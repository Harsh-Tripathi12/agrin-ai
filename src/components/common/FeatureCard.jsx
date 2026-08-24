export default function FeatureCard({
  icon,
  title,
  description,
  onClick,
  variant = "default",
}) {
  const variants = {
    default: "bg-white border-gray-100",
    green: "bg-green-50 border-green-100",
    warning: "bg-amber-50 border-amber-100",
    blue: "bg-blue-50 border-blue-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        w-full
        rounded-3xl
        border
        p-6
        text-left
        transition-all
        duration-300
        hover:-translate-y-1.5
        hover:shadow-lg
        hover:shadow-green-500/10
        ${variants[variant] || variants.default}
      `}
    >
      <div
        className="
          mb-5
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-3xl
          shadow-sm
          border border-gray-50
          transition-transform
          duration-300
          group-hover:scale-105
        "
      >
        {icon}
      </div>

      <h3 className="text-lg font-bold text-gray-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        {description}
      </p>

      <div className="mt-5 flex items-center text-sm font-semibold text-green-600 transition-colors group-hover:text-green-700">
        Open 
        <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1.5">→</span>
      </div>
    </button>
  );
}