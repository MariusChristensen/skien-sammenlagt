import React from "react";

function ScoreDistribution({ results, selectedWeek, activeView }) {
  if (!results?.Competition) return null;

  // Calculate score distribution
  const distribution = calculateScoreDistribution(
    results,
    selectedWeek,
    activeView
  );

  if (!distribution || Object.keys(distribution).length === 0) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow p-4 text-center text-gray-500 font-semibold">
        Ingen score-data tilgjengelig
      </div>
    );
  }

  // Sort the distribution keys in ascending order (eagle, birdie, par, bogey, etc.)
  const scoreLabels = {
    "-2": "Ace/Eagle",
    "-1": "Birdie",
    0: "Par",
    1: "Bogey",
    2: "Double Bogey",
    "3+": "Triple+",
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#800000]">Poengfordeling</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {/* Order the score types: Eagle, Birdie, Par, Bogey, Double Bogey, Triple+ */}
        {["-2", "-1", "0", "1", "2", "3+"].map((score) => {
          const count = distribution[score] || 0;
          // Calculate percentage
          const percentage = ((count / distribution.total) * 100).toFixed(1);

          // Determine color based on score type
          let bgColor = "bg-gray-200";
          let textColor = "text-gray-800";

          if (score === "-2") {
            bgColor = "bg-indigo-200";
            textColor = "text-indigo-800";
          } else if (score === "-1") {
            bgColor = "bg-blue-200";
            textColor = "text-blue-800";
          } else if (score === "0") {
            bgColor = "bg-green-200";
            textColor = "text-green-800";
          } else if (score === "1") {
            bgColor = "bg-yellow-200";
            textColor = "text-yellow-800";
          } else if (score === "2") {
            bgColor = "bg-orange-200";
            textColor = "text-orange-800";
          } else if (score === "3+") {
            bgColor = "bg-red-200";
            textColor = "text-red-800";
          }

          return (
            <div
              key={score}
              className={`${bgColor} rounded-lg p-3 text-center shadow-sm`}
            >
              <div className={`font-bold ${textColor}`}>
                {scoreLabels[score] || score}
              </div>
              <div className="text-2xl font-bold mt-1">{count}</div>
              <div className="text-sm">{percentage}%</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-right text-sm text-gray-500">
        <div>Total Scores: {distribution.total}</div>
      </div>
    </div>
  );
}

// Helper function to get player rounds based on view and week
function getPlayerRounds(results, selectedWeek, activeView) {
  let rounds = [];

  if (results.Competition.SubCompetitions) {
    if (activeView === "sammenlagt") {
      // All weeks
      rounds = results.Competition.SubCompetitions.flatMap((week) =>
        week.Results ? week.Results : []
      );
    } else if (activeView === "ukentlig" && selectedWeek > 0) {
      // Specific week
      const week = results.Competition.SubCompetitions[selectedWeek - 1];
      rounds = week?.Results || [];
    }
  } else if (
    results.Competition.TourResults &&
    results.Competition.Events &&
    activeView === "sammenlagt"
  ) {
    // Handle 2022 TourResults/Events format for SAMMENLAGT only
    results.Competition.TourResults.forEach((player) => {
      if (player.EventResults && Array.isArray(player.EventResults)) {
        player.EventResults.forEach((eventResult) => {
          if (eventResult && eventResult.PlayerResults) {
            rounds.push({ PlayerResults: eventResult.PlayerResults });
          }
        });
      }
    });
  }

  return rounds;
}

// Helper function to extract par values from Tracks data
function extractParValues(results) {
  // Extract par values directly from Tracks data
  if (
    results.Competition &&
    results.Competition.Tracks &&
    results.Competition.Tracks.length > 0
  ) {
    return results.Competition.Tracks.map((track) => {
      // Parse par value, default to 3 if not available or not a number
      const par = parseInt(track.Par, 10);
      return isNaN(par) ? 3 : par;
    });
  }

  // If for some reason Tracks data is not found, return default par 3 for all holes
  return Array(18).fill(3);
}

function calculateScoreDistribution(results, selectedWeek, activeView) {
  // Get player rounds
  let rounds = getPlayerRounds(results, selectedWeek, activeView);

  if (!rounds.length) return {};

  // Initialize distribution object
  const distribution = {
    "-2": 0, // Eagle
    "-1": 0, // Birdie
    0: 0, // Par
    1: 0, // Bogey
    2: 0, // Double Bogey
    "3+": 0, // Triple Bogey and worse
    total: 0,
  };

  // Get course par values each hole - more comprehensive approach
  const parValues = extractParValues(results);

  // Process all scores
  rounds.forEach((player) => {
    player.PlayerResults?.forEach((hole, idx) => {
      if (hole?.Result && !isNaN(Number(hole.Result))) {
        const result = Number(hole.Result);
        const par = parValues[idx] || 3; // Use default par 3 if missing
        const relativeToPar = result - par;

        // Categorize the result
        let scoreKey;
        if (relativeToPar <= -2) {
          scoreKey = "-2"; // Eagle or better
        } else if (relativeToPar === -1) {
          scoreKey = "-1"; // Birdie
        } else if (relativeToPar === 0) {
          scoreKey = "0"; // Par
        } else if (relativeToPar === 1) {
          scoreKey = "1"; // Bogey
        } else if (relativeToPar === 2) {
          scoreKey = "2"; // Double Bogey
        } else {
          scoreKey = "3+"; // Triple Bogey or worse
        }

        distribution[scoreKey]++;
        distribution.total++;
      }
    });
  });

  return distribution;
}

export default ScoreDistribution;
