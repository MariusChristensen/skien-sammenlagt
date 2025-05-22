const ClassSelector = ({ classes, selectedClass, onChange }) => (
  <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200 justify-center">
    <button
      className={`px-3 py-1 rounded-md transition-colors ${
        selectedClass === null
          ? "bg-[#800000] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => onChange(null)}
    >
      Alle klasser
    </button>
    {classes.map((className) => (
      <button
        key={className}
        className={`px-3 py-1 rounded-md transition-colors ${
          selectedClass === className
            ? "bg-[#800000] text-white"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
        onClick={() => onChange(className)}
      >
        {className}
      </button>
    ))}
  </div>
);

export default ClassSelector;
