export default function LoadingSpinner({
  size = "md",
  text = "",
  variant = "inline"
}) {
  if (variant === "page") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 fade-in">
        <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-3xl bg-green-50 border-2 border-green-100 shadow-sm text-4xl">
          🌱
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-extrabold tracking-tight text-green-800">
            AgriN
          </h2>
          {text && (
            <p className="text-sm font-medium text-gray-500 animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[3px]",
    lg: "h-10 w-10 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 fade-in">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-gray-100 border-t-green-600`}
      />

      {text && (
        <p className="text-sm font-medium text-gray-500">
          {text}
        </p>
      )}
    </div>
  );
}