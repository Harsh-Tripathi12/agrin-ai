export default function FeatureActionCard({
  emoji,
  title,
  description,
  buttonText = "Open",
  onClick,
  color = "bg-green-50",
}) {
  return (
    <div className="group relative flex flex-col rounded-3xl bg-white border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200 overflow-hidden">
      
      {/* Top accent border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 opacity-80"></div>

      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-sm ${color}`}>
        {emoji}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-gray-900 tracking-tight">
        {title}
      </h3>

      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-green-700 hover:shadow-md active:scale-95"
      >
        {buttonText}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </div>
  );
}