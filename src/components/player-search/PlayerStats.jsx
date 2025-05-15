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

  // For score distribution across all years
  let totalAces = 0;
  let totalEagles = 0;
  let totalBirdies = 0;
  let totalPars = 0;
  let totalBogeys = 0;
  let totalDoubles = 0;
  let totalTriples = 0;
  let totalShots = 0;

  playerData.forEach((yearData) => {
    if (yearData.totalRounds) totalRounds += yearData.totalRounds;
    if (yearData.weeksPlayed) totalWeeksPlayed += yearData.weeksPlayed;

    // Ensure numeric conversion for totalScore
    if (yearData.totalScore !== undefined && yearData.totalScore !== null) {
      const score = Number(yearData.totalScore);
      if (!isNaN(score)) totalScore += score;
    }

    // Aggregate score distribution data across all years
    if (yearData.aces) totalAces += yearData.aces;
    if (yearData.eagles) totalEagles += yearData.eagles;

    // Sum up hole-specific scores
    if (yearData.holeBirdies) {
      totalBirdies += yearData.holeBirdies.reduce(
        (sum, count) => sum + (count || 0),
        0
      );
    }

    if (yearData.holePars) {
      totalPars += yearData.holePars.reduce(
        (sum, count) => sum + (count || 0),
        0
      );
    }

    if (yearData.holeBogeys) {
      totalBogeys += yearData.holeBogeys.reduce(
        (sum, count) => sum + (count || 0),
        0
      );
    }

    if (yearData.holeDoubles) {
      totalDoubles += yearData.holeDoubles.reduce(
        (sum, count) => sum + (count || 0),
        0
      );
    }

    if (yearData.triples) totalTriples += yearData.triples;

    // Find best round across all years - prioritize relation to par
    if (yearData.bestRound && yearData.bestRound.result) {
      // Validate the result is a proper score (not empty, null, or zero)
      const bestScore = Number(yearData.bestRound.result);
      if (!isNaN(bestScore) && bestScore > 0) {
        // Check if we have relation to par data
        if (yearData.bestRound.relativeToPar !== undefined) {
          if (
            !bestRound ||
            bestRound.relativeToPar === undefined ||
            yearData.bestRound.relativeToPar < bestRound.relativeToPar
          ) {
            bestRound = {
              ...yearData.bestRound,
              year: yearData.year,
            };
          }
        } else {
          // Fallback to absolute score if relation to par isn't available
          const bestRoundScore = Number(yearData.bestRound.result);
          if (
            !isNaN(bestRoundScore) &&
            bestRoundScore > 0 &&
            (!bestRound ||
              (bestRound.relativeToPar === undefined &&
                (!bestRound.result ||
                  bestRoundScore < Number(bestRound.result || Infinity))))
          ) {
            bestRound = {
              ...yearData.bestRound,
              year: yearData.year,
            };
          }
        }
      }
    }

    // Find worst round across all years
    if (yearData.worstRound && yearData.worstRound.result) {
      // Validate the result is a proper score (not empty, null, or zero)
      const worstScore = Number(yearData.worstRound.result);
      if (!isNaN(worstScore) && worstScore > 0) {
        // Check if we have relation to par data
        if (yearData.worstRound.relativeToPar !== undefined) {
          if (
            !worstRound ||
            worstRound.relativeToPar === undefined ||
            yearData.worstRound.relativeToPar > worstRound.relativeToPar
          ) {
            worstRound = {
              ...yearData.worstRound,
              year: yearData.year,
            };
          }
        } else {
          // Fallback to absolute score if relation to par isn't available
          const worstRoundScore = Number(yearData.worstRound.result);
          if (
            !isNaN(worstRoundScore) &&
            worstRoundScore > 0 &&
            (!worstRound ||
              (worstRound.relativeToPar === undefined &&
                (!worstRound.result ||
                  worstRoundScore > Number(worstRound.result || -Infinity))))
          ) {
            worstRound = {
              ...yearData.worstRound,
              year: yearData.year,
            };
          }
        }
      }
    }

    // Collect all weekly results
    if (yearData.weeklyResults && yearData.weeklyResults.length > 0) {
      // Filter out results without score or position
      const validResults = yearData.weeklyResults
        .filter((week) => {
          // Ensure the result exists and is a valid number (not empty string, null, undefined)
          if (!week.result) return false;
          const score = Number(week.result);
          return !isNaN(score) && score > 0;
        })
        .map((week) => ({
          ...week,
          year: yearData.year,
          result: week.result,
        }));

      weeklyResults = [...weeklyResults, ...validResults];
    }
  });

  // Calculate total shots for percentage calculations
  totalShots =
    totalAces +
    totalEagles +
    totalBirdies +
    totalPars +
    totalBogeys +
    totalDoubles +
    totalTriples;

  // Calculate average score - ensure proper numeric calculation
  const avgScore =
    totalWeeksPlayed > 0
      ? (Number(totalScore) / totalWeeksPlayed).toFixed(1)
      : "0.0";

  // Format best round score with relation to par
  const formatScoreWithPar = (round) => {
    if (!round) return "-";

    if (round.relativeToPar !== undefined && round.relativeToPar !== null) {
      let parText;
      if (round.relativeToPar === 0) {
        parText = "(E)";
      } else if (round.relativeToPar > 0) {
        parText = `(+${round.relativeToPar})`;
      } else {
        parText = `(${round.relativeToPar})`;
      }
      return `${round.result} ${parText}`;
    }

    return round.result;
  };

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

  // Calculate score distribution percentages
  const getPercentage = (count) => {
    return totalShots > 0 ? ((count / totalShots) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-[#800000] mb-1">
          {player.name}
        </h3>
        <p className="text-gray-600 mb-2">
          {player.classes.join(", ")} • {yearDisplay}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Runder spilt</div>
            <div className="text-xl font-semibold">{totalRounds || 0}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Snitt score</div>
            <div className="text-xl font-semibold">{avgScore}</div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500">Beste runde</div>
            <div className="text-xl font-semibold">
              {formatScoreWithPar(bestRound)}
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
              {formatScoreWithPar(worstRound)}
            </div>
            {worstRound && (
              <div className="text-xs text-gray-500">
                {worstRound.year}, Uke {worstRound.week}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score distribution - show for all years or specific year */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-lg font-semibold text-[#800000] mb-4">
          Poengfordeling
        </h4>

        {/* Use EXACTLY the same colors as in statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <div className="col-span-2 sm:col-span-1 bg-indigo-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-indigo-800">
              Ace/Eagle
            </div>
            <div className="font-bold text-xl text-indigo-800">
              {totalAces + totalEagles}
            </div>
            <div className="text-xs text-indigo-800">
              {getPercentage(totalAces + totalEagles)}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-blue-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-blue-800">Birdie</div>
            <div className="font-bold text-xl text-blue-800">
              {totalBirdies}
            </div>
            <div className="text-xs text-blue-800">
              {getPercentage(totalBirdies)}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-green-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-green-800">Par</div>
            <div className="font-bold text-xl text-green-800">{totalPars}</div>
            <div className="text-xs text-green-800">
              {getPercentage(totalPars)}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-yellow-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-yellow-800">Bogey</div>
            <div className="font-bold text-xl text-yellow-800">
              {totalBogeys}
            </div>
            <div className="text-xs text-yellow-800">
              {getPercentage(totalBogeys)}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-orange-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-orange-800">
              Double Bogey
            </div>
            <div className="font-bold text-xl text-orange-800">
              {totalDoubles}
            </div>
            <div className="text-xs text-orange-800">
              {getPercentage(totalDoubles)}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-red-200 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="text-base font-semibold text-red-800">Triple+</div>
            <div className="font-bold text-xl text-red-800">{totalTriples}</div>
            <div className="text-xs text-red-800">
              {getPercentage(totalTriples)}%
            </div>
          </div>
        </div>
      </div>

      {/* Best round scorecard - only show if holes exist and have length */}
      {bestRound && bestRound.holes && bestRound.holes.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-[#800000] mb-4">
            Beste runde: {formatScoreWithPar(bestRound)} (Uke {bestRound.week},{" "}
            {bestRound.year})
          </h4>
          <BestRoundScorecard round={bestRound} />
        </div>
      )}

      {/* Recent results table */}
      {recentResults.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-semibold text-[#800000] mb-4">
            Siste resultater
          </h4>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentResults.map((result, idx) => {
                  // Format the score to include relation to par if available
                  const formattedScore =
                    result.relativeToPar !== undefined
                      ? `${result.result} ${
                          result.relativeToPar === 0
                            ? "(E)"
                            : result.relativeToPar > 0
                            ? `(+${result.relativeToPar})`
                            : `(${result.relativeToPar})`
                        }`
                      : result.result;

                  return (
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
                          {formattedScore}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerStats;
