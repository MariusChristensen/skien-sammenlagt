import React from "react";
import BestRoundScorecard from "./BestRoundScorecard";

function PlayerStats({ player, playerData, selectedYear }) {
  if (!player || !playerData || playerData.length === 0) return null;

  // Aggregate stats across all years or display for a single year
  let totalRounds = 0;
  let totalWeeksPlayed = 0;
  let totalScore = 0;
  let bestRound = null;
  let worstRound = null;
  let weeklyResults = [];

  playerData.forEach((yearData) => {
    totalRounds += yearData.totalRounds || 0;
    totalWeeksPlayed += yearData.weeksPlayed || 0;
    totalScore += yearData.totalScore || 0;

    // Find best round across all years
    if (yearData.bestRound) {
      if (
        !bestRound ||
        parseFloat(yearData.bestRound.result) < parseFloat(bestRound.result)
      ) {
        bestRound = {
          ...yearData.bestRound,
          year: yearData.year,
        };
      }
    }

    // Find worst round across all years
    if (yearData.worstRound) {
      if (
        !worstRound ||
        parseFloat(yearData.worstRound.result) > parseFloat(worstRound.result)
      ) {
        worstRound = {
          ...yearData.worstRound,
          year: yearData.year,
        };
      }
    }

    // Collect all weekly results
    if (yearData.weeklyResults && yearData.weeklyResults.length > 0) {
      weeklyResults = [
        ...weeklyResults,
        ...yearData.weeklyResults.map((week) => ({
          ...week,
          year: yearData.year,
        })),
      ];
    }
  });

  // Calculate average score
  const avgScore =
    totalWeeksPlayed > 0 ? (totalScore / totalWeeksPlayed).toFixed(1) : 0;

  // Sort weekly results by date (most recent first)
  weeklyResults.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  // Limit to 10 most recent results for display
  const recentResults = weeklyResults.slice(0, 10);

  // Check if we're viewing a specific year or all years
  const yearDisplay = selectedYear === "all" ? "Alle år" : selectedYear;
  const yearSpecificData = selectedYear !== "all" ? playerData[0] : null;

  return (
    <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{player.name}</h3>
        <p className="text-gray-600 mb-2">
          {player.classes.join(", ")} • {yearDisplay}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Runder spilt</div>
            <div className="text-xl font-semibold">{totalRounds}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Snitt score</div>
            <div className="text-xl font-semibold">{avgScore}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Beste runde</div>
            <div className="text-xl font-semibold">
              {bestRound ? bestRound.result : "-"}
            </div>
            {bestRound && (
              <div className="text-xs text-gray-500">
                {bestRound.year}, Uke {bestRound.week}
              </div>
            )}
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Dårligste runde</div>
            <div className="text-xl font-semibold">
              {worstRound ? worstRound.result : "-"}
            </div>
            {worstRound && (
              <div className="text-xs text-gray-500">
                {worstRound.year}, Uke {worstRound.week}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best round scorecard */}
      {bestRound && bestRound.holes && bestRound.holes.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold mb-4">
            Beste runde: {bestRound.result} (Uke {bestRound.week},{" "}
            {bestRound.year})
          </h4>
          <BestRoundScorecard round={bestRound} />
        </div>
      )}

      {/* Score distribution */}
      {yearSpecificData && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold mb-4">Score fordeling</h4>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
            <div className="bg-purple-100 p-2 rounded">
              <div className="text-xs text-purple-800">Aces</div>
              <div className="font-bold text-purple-800">
                {yearSpecificData.aces || 0}
              </div>
            </div>
            <div className="bg-indigo-100 p-2 rounded">
              <div className="text-xs text-indigo-800">Eagles</div>
              <div className="font-bold text-indigo-800">
                {yearSpecificData.eagles || 0}
              </div>
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <div className="text-xs text-blue-800">Birdies</div>
              <div className="font-bold text-blue-800">
                {yearSpecificData.holeBirdies
                  ? yearSpecificData.holeBirdies.reduce(
                      (sum, count) => sum + (count || 0),
                      0
                    )
                  : 0}
              </div>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <div className="text-xs text-green-800">Pars</div>
              <div className="font-bold text-green-800">
                {yearSpecificData.holePars
                  ? yearSpecificData.holePars.reduce(
                      (sum, count) => sum + (count || 0),
                      0
                    )
                  : 0}
              </div>
            </div>
            <div className="bg-yellow-100 p-2 rounded">
              <div className="text-xs text-yellow-800">Bogeys</div>
              <div className="font-bold text-yellow-800">
                {yearSpecificData.holeBogeys
                  ? yearSpecificData.holeBogeys.reduce(
                      (sum, count) => sum + (count || 0),
                      0
                    )
                  : 0}
              </div>
            </div>
            <div className="bg-orange-100 p-2 rounded">
              <div className="text-xs text-orange-800">Doubles</div>
              <div className="font-bold text-orange-800">
                {yearSpecificData.holeDoubles
                  ? yearSpecificData.holeDoubles.reduce(
                      (sum, count) => sum + (count || 0),
                      0
                    )
                  : 0}
              </div>
            </div>
            <div className="bg-red-100 p-2 rounded">
              <div className="text-xs text-red-800">Triples+</div>
              <div className="font-bold text-red-800">
                {yearSpecificData.triples || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent results table */}
      {recentResults.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-semibold mb-4">Siste resultater</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uke / År
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dato
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plassering
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((result, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        Uke {result.week}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        {result.year}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {result.date
                        ? new Date(result.date).toLocaleDateString("no-NO")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {result.result || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {result.position ? (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {result.position}. plass
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerStats;
