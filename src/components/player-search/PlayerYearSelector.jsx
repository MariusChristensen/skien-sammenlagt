import React from "react";

function PlayerYearSelector({ selectedYear, setSelectedYear, availableYears }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Velg år
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          className={`py-2 px-4 rounded-lg ${
            selectedYear === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          onClick={() => setSelectedYear("all")}
        >
          Alle år
        </button>
        {availableYears.map((year) => (
          <button
            key={year}
            className={`py-2 px-4 rounded-lg ${
              selectedYear === year
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlayerYearSelector;
