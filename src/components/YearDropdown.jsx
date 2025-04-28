import React from "react";

const YearDropdown = ({
  years,
  selectedYear,
  onChange,
  isOpen,
  setIsOpen,
  dropdownRef,
}) => (
  <div className="relative w-full sm:w-auto mb-4 sm:mb-0" ref={dropdownRef}>
    <div className="flex flex-row items-center space-x-2 w-full">
      <span className="text-gray-700 font-medium whitespace-nowrap">
        Velg år:
      </span>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center space-x-2 px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors min-w-[100px] justify-between w-full sm:w-auto"
      >
        <span>{selectedYear}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
    {isOpen && (
      <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => {
              onChange(year);
              setIsOpen(false);
            }}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
              selectedYear === year ? "bg-gray-100 font-medium" : ""
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    )}
  </div>
);

export default YearDropdown;
