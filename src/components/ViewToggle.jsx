import React from "react";

const ViewToggle = ({ activeView, onChange }) => (
  <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-start">
    <button
      className={`px-4 py-2 rounded-md transition-colors ${
        activeView === "overall"
          ? "bg-[#800000] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => onChange("overall")}
    >
      Sammenlagt
    </button>
    <button
      className={`px-4 py-2 rounded-md transition-colors ${
        activeView === "weekly"
          ? "bg-[#800000] text-white"
          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
      }`}
      onClick={() => onChange("weekly")}
    >
      Ukentlig
    </button>
  </div>
);

export default ViewToggle;
