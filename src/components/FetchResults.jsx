import { useEffect, useState } from "react";
import OverallLeaderboard from "./OverallLeaderboard";

// Competition IDs for each year
const COMPETITION_IDS = {
  2020: "1222406",
  2021: "1660549",
  2022: "2079115",
  2023: "2503707",
  2024: "2886967",
  2025: "3268191",
};

// Available years (in reverse chronological order)
const AVAILABLE_YEARS = Object.keys(COMPETITION_IDS).sort().reverse();

const FetchResults = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("overall"); // 'overall' or 'weekly'
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[0]); // Default to latest year

  // Get the competition ID based on selected year
  const COMPETITION_ID = COMPETITION_IDS[selectedYear];
  const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;

  useEffect(() => {
    // Reset states when year changes
    setResults(null);
    setLoading(true);
    setError(null);
    setSelectedClass(null);
    setSelectedWeek(0);
    setAvailableClasses([]);

    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();

        setResults(data);

        // Extract all available classes
        const classes = new Set();
        data?.Competition?.SubCompetitions?.forEach((comp) => {
          comp?.Results?.forEach((player) => {
            if (player.ClassName) {
              classes.add(player.ClassName);
            }
          });
        });

        setAvailableClasses(Array.from(classes).sort());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]); // Re-fetch when API_URL changes (which happens when selectedYear changes)

  if (loading) return <p className="text-center py-8">Loading results...</p>;
  if (error)
    return <p className="text-center py-8 text-red-500">Error: {error}</p>;

  // Get the number of weeks
  const weekCount = results?.Competition?.SubCompetitions?.length || 0;

  return (
    <div>
      {/* Competition Title */}
      <h2 className="text-2xl font-bold text-center mb-4">
        Ukegolf {selectedYear} | Sammenlagt tabell
      </h2>

      {/* Year Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {AVAILABLE_YEARS.map((year) => (
            <button
              key={year}
              className={`px-4 py-2 rounded-md ${
                selectedYear === year
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeView === "overall"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveView("overall")}
        >
          Overall Standings
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeView === "weekly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => setActiveView("weekly")}
        >
          Weekly Results
        </button>
      </div>

      {/* Class Selection */}
      {availableClasses.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            className={`px-3 py-1 rounded ${
              selectedClass === null
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setSelectedClass(null)}
          >
            All Classes
          </button>
          {availableClasses.map((className) => (
            <button
              key={className}
              className={`px-3 py-1 rounded ${
                selectedClass === className
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedClass(className)}
            >
              {className}
            </button>
          ))}
        </div>
      )}

      {/* Conditional Rendering Based on View */}
      {activeView === "overall" ? (
        <OverallLeaderboard
          results={results}
          selectedClass={selectedClass}
          selectedYear={selectedYear}
        />
      ) : (
        <div>
          {/* Week Selection */}
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {Array.from({ length: weekCount }).map((_, index) => (
              <button
                key={index}
                className={`min-w-[36px] px-3 py-1 rounded text-center ${
                  selectedWeek === index
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setSelectedWeek(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Weekly Results Table */}
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Uke {selectedWeek + 1}
            </h2>

            {/* Display weekly results for each class or only the selected class */}
            {(() => {
              // Get all results for the selected week
              const weekResults =
                results?.Competition?.SubCompetitions[selectedWeek]?.Results ||
                [];

              // Group by class or filter by selected class
              const classResults = selectedClass
                ? {
                    [selectedClass]: weekResults.filter(
                      (p) => p.ClassName === selectedClass
                    ),
                  }
                : weekResults.reduce((acc, player) => {
                    const className = player.ClassName || "Unknown";
                    if (!acc[className]) acc[className] = [];
                    acc[className].push(player);
                    return acc;
                  }, {});

              return Object.entries(classResults).map(
                ([className, players]) => (
                  <div key={className} className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 bg-gray-200 p-2 rounded">
                      {className}
                    </h3>
                    <table className="table-fixed border-collapse border border-gray-400 w-full">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2 text-center w-[5%]">
                            Place
                          </th>
                          <th className="border px-4 py-2 w-[15%]">Player</th>
                          {/* Display column headers for each hole */}
                          {Array.from({ length: 18 }).map((_, index) => (
                            <th
                              key={index}
                              className="border px-1 py-1 text-center font-medium"
                              style={{ width: "3.3%" }}
                            >
                              {index + 1}
                            </th>
                          ))}
                          <th className="border px-4 py-2 text-center w-[5%]">
                            +/-
                          </th>
                          <th className="border px-4 py-2 text-center w-[5%]">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.length > 0 ? (
                          players.map((player) => {
                            // Extract hole scores from player data if available
                            const holeResults = player.PlayerResults
                              ? [...player.PlayerResults]
                              : [];

                            return (
                              <tr key={player.UserID}>
                                <td className="border px-4 py-2 text-center">
                                  {player.Place}
                                </td>
                                <td className="border px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                  {player.Name}
                                </td>

                                {/* Display individual hole scores */}
                                {Array.from({ length: 18 }).map((_, index) => {
                                  // Access the hole result if available (holes are in order in the array)
                                  const holeData = holeResults[index];
                                  const score = holeData?.Result;
                                  const diff = holeData?.Diff;

                                  // Add color based on score relative to par (using Diff property)
                                  let bgColor = "";

                                  if (diff !== undefined) {
                                    if (diff < 0) bgColor = "bg-green-200";
                                    // Under par (birdie or better)
                                    else if (diff > 0) bgColor = "bg-red-200"; // Over par (bogey or worse)

                                    // Special case: hole-in-one (ace) always gets priority
                                    if (score === "1") {
                                      bgColor = "bg-yellow-300";
                                    }
                                  }

                                  return (
                                    <td
                                      key={index}
                                      className={`border px-2 py-1 text-center ${bgColor}`}
                                    >
                                      {score !== undefined ? score : "-"}
                                    </td>
                                  );
                                })}

                                <td className="border px-4 py-2 text-center">
                                  {player.Diff}
                                </td>
                                <td className="border px-4 py-2 text-center">
                                  {player.Sum}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="22"
                              className="border px-4 py-2 text-center"
                            >
                              No results available for {className} in week{" "}
                              {selectedWeek + 1}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchResults;
