import React from "react";

const getWeekLabel = (name, idx) => {
  let afterArrow = null;
  if (name.includes("&rarr;")) {
    afterArrow = name.split("&rarr;")[1];
  } else if (name.includes("→")) {
    afterArrow = name.split("→")[1];
  }
  if (afterArrow) {
    return afterArrow.trim();
  }
  const match = name.match(/Runde \d+/);
  return match ? match[0] : name || `Uke ${idx + 1}`;
};

const WeekDropdown = ({
  weeks,
  selectedWeek,
  onChange,
  isOpen,
  setIsOpen,
  dropdownRef,
}) => (
  <div className="relative w-full max-w-xs" ref={dropdownRef}>
    <button
      onClick={() => setIsOpen((open) => !open)}
      className="flex items-center justify-between w-full px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors"
    >
      <span>
        {weeks && weeks[selectedWeek]
          ? getWeekLabel(weeks[selectedWeek].Name, selectedWeek)
          : `Uke ${selectedWeek + 1}`}
      </span>
      <svg
        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
    {isOpen && (
      <div className="absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-72 overflow-y-auto">
        {weeks.map((sub, idx) => {
          const label = getWeekLabel(sub.Name, idx);
          return (
            <button
              key={sub.ID || idx}
              onClick={() => {
                onChange(idx);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                selectedWeek === idx ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    )}
  </div>
);

export default WeekDropdown;
