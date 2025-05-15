import React from "react";

function BestRoundScorecard({ round }) {
  // Make sure we have valid hole data
  if (
    !round ||
    !round.holes ||
    !Array.isArray(round.holes) ||
    round.holes.length === 0
  ) {
    return null;
  }

  // Check that all the required hole properties are present
  const validHoles = round.holes.filter(
    (hole) =>
      hole &&
      typeof hole.number === "number" &&
      typeof hole.result === "number" &&
      typeof hole.par === "number" &&
      typeof hole.diff === "number"
  );

  if (validHoles.length === 0) {
    return null;
  }

  // Calculate total score and relation to par
  const totalScore = validHoles.reduce((sum, hole) => sum + hole.result, 0);
  const totalPar = validHoles.reduce((sum, hole) => sum + hole.par, 0);
  const totalRelativeToPar = totalScore - totalPar;

  // Color map to exactly match the results page style
  const getScoreCellStyle = (diff, score) => {
    // Special case for hole-in-one
    if (score === 1) return "bg-yellow-300";

    // Match EXACTLY the weekly results color scheme
    if (diff < 0) return "bg-green-200"; // Under par
    if (diff === 1) return "bg-red-100"; // Bogey
    if (diff === 2) return "bg-red-300"; // Double bogey
    if (diff >= 3) return "bg-red-500"; // Triple+ bogey
    return "bg-white"; // Par (default)
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("no-NO", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get display date
  const displayDate = formatDate(round.date);

  return (
    <>
      {/* Desktop/tablet version - Table layout */}
      <div className="hidden sm:block overflow-x-auto">
        <div className="mb-2">
          <div className="text-sm">Dato: {displayDate}</div>
        </div>
        <table className="min-w-full border-collapse mb-2">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left text-sm font-medium bg-white">
                Hull
              </th>
              {validHoles.map((hole) => (
                <th
                  key={`hole-${hole.number}`}
                  className="border px-2 py-1 text-center text-sm font-medium bg-white"
                >
                  {hole.number}
                </th>
              ))}
              <th className="border px-2 py-1 text-center text-sm font-medium bg-white">
                +/-
              </th>
              <th className="border px-2 py-1 text-center text-sm font-medium bg-white">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 text-sm">Score</td>
              {validHoles.map((hole) => (
                <td
                  key={`score-${hole.number}`}
                  className={`border px-2 py-1 text-center text-sm ${getScoreCellStyle(
                    hole.diff,
                    hole.result
                  )}`}
                >
                  {hole.result}
                </td>
              ))}
              <td
                className={`border px-2 py-1 text-center text-sm font-medium ${
                  totalRelativeToPar <= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {totalRelativeToPar === 0
                  ? "E"
                  : totalRelativeToPar > 0
                  ? `+${totalRelativeToPar}`
                  : totalRelativeToPar}
              </td>
              <td className="border px-2 py-1 text-center text-sm font-medium">
                {totalScore}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile version - Card grid */}
      <div className="sm:hidden mb-2">
        <div className="p-4 border rounded-lg">
          <div className="mb-3">
            <div className="text-sm">{displayDate}</div>
          </div>

          <div className="grid grid-cols-9 gap-1 mb-2">
            {validHoles.slice(0, 9).map((hole) => (
              <div
                key={`hole-mobile-${hole.number}`}
                className="rounded border"
              >
                <div className="text-xs text-center text-gray-500 border-b">
                  {hole.number}
                </div>
                <div
                  className={`text-center py-1 ${getScoreCellStyle(
                    hole.diff,
                    hole.result
                  )}`}
                >
                  {hole.result}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-9 gap-1 mb-3">
            {validHoles.slice(9, 18).map((hole) => (
              <div
                key={`hole-mobile-${hole.number}`}
                className="rounded border"
              >
                <div className="text-xs text-center text-gray-500 border-b">
                  {hole.number}
                </div>
                <div
                  className={`text-center py-1 ${getScoreCellStyle(
                    hole.diff,
                    hole.result
                  )}`}
                >
                  {hole.result}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <div
              className={`font-medium ${
                totalRelativeToPar <= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalRelativeToPar === 0
                ? "E"
                : totalRelativeToPar > 0
                ? `+${totalRelativeToPar}`
                : totalRelativeToPar}
            </div>
            <div className="font-medium">Total: {totalScore}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BestRoundScorecard;
