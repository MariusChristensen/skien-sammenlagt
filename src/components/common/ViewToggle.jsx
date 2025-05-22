const ViewToggle = ({
  activeView,
  onChange,
  leftValue = "overall",
  rightValue = "weekly",
  leftLabel = "Sammenlagt",
  rightLabel = "Ukentlig",
}) => (
  <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-start">
    <button
      className={`px-4 py-2 rounded-md transition-colors ${
        activeView === leftValue
          ? "bg-[#800000] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => onChange(leftValue)}
    >
      {leftLabel}
    </button>
    <button
      className={`px-4 py-2 rounded-md transition-colors ${
        activeView === rightValue
          ? "bg-[#800000] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => onChange(rightValue)}
    >
      {rightLabel}
    </button>
  </div>
);

export default ViewToggle;
