import React from "react";

function AceHallOfFame({ results }) {
  // Only search for aces if we have SubCompetitions (2020-2021, 2023+)
  if (!results?.Competition?.SubCompetitions) return null;
  const aces = [];
  results.Competition.SubCompetitions.forEach((week, weekIdx) => {
    const weekDate = week.Date || week.StartDate || week.EndDate || null;
    let formattedDate = null;
    if (weekDate) {
      // Try to format as DD.MM.YYYY
      const d = new Date(weekDate);
      if (!isNaN(d)) {
        formattedDate = d.toLocaleDateString("no-NO");
      }
    }
    week.Results?.forEach((player) => {
      player.PlayerResults?.forEach((hole, holeIdx) => {
        if (hole?.Result === "1") {
          aces.push({
            name: player.Name,
            week: weekIdx + 1,
            hole: holeIdx + 1,
            className: player.ClassName || "",
            date: formattedDate,
          });
        }
      });
    });
  });
  if (aces.length === 0) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow p-4 text-center text-gray-500 font-semibold">
        Ingen aces registrert i år!
      </div>
    );
  }
  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4 text-[#800000]">
        Ace Hall of Fame
      </h3>
      <div className="hidden sm:grid grid-cols-4 gap-4 px-2 pb-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
        <div>Navn</div>
        <div>Hull</div>
        <div>Dato</div>
        <div>Klasse</div>
      </div>
      <ul className="divide-y divide-gray-200">
        {aces.map((ace, idx) => (
          <li
            key={idx}
            className="py-2 flex flex-col sm:grid sm:grid-cols-4 sm:gap-4 items-start sm:items-center px-2"
          >
            <span className="font-semibold text-gray-800">{ace.name}</span>
            <span className="text-sm text-gray-600">Hull {ace.hole}</span>
            <span className="text-xs text-gray-500">
              {ace.date || `Uke ${ace.week}`}
            </span>
            <span className="text-xs text-gray-400">
              {ace.className && `(${ace.className})`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AceHallOfFame;
