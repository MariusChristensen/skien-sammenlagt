import { useEffect, useState, useRef } from "react";
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
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);
  const weekDropdownRef = useRef(null);

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
        if (!response.ok) throw new Error("Kunne ikke hente data");
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

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target)
      ) {
        setIsYearDropdownOpen(false);
      }
      if (
        weekDropdownRef.current &&
        !weekDropdownRef.current.contains(event.target)
      ) {
        setIsWeekDropdownOpen(false);
      }
    }
    if (isYearDropdownOpen || isWeekDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isYearDropdownOpen, isWeekDropdownOpen]);

  if (loading) return <p className="text-center py-8">Laster resultater...</p>;
  if (error)
    return <p className="text-center py-8 text-red-500">Feil: {error}</p>;

  return (
    <div>
      {/* Navigation Bar */}
      <div className="bg-white shadow-md rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4">
          {/* Year Selection Dropdown */}
          <div
            className="relative w-full sm:w-auto mb-4 sm:mb-0"
            ref={yearDropdownRef}
          >
            <div className="flex flex-row items-center space-x-2 w-full">
              <span className="text-gray-700 font-medium whitespace-nowrap">
                Velg år:
              </span>
              <button
                onClick={() => {
                  setIsYearDropdownOpen((open) => {
                    if (!open) setIsWeekDropdownOpen(false);
                    return !open;
                  });
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors min-w-[100px] justify-between w-full sm:w-auto"
              >
                <span>{selectedYear}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isYearDropdownOpen ? "rotate-180" : ""
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
            {isYearDropdownOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200">
                {AVAILABLE_YEARS.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsYearDropdownOpen(false);
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

          {/* View Toggle Buttons */}
          <div className="flex space-x-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeView === "overall"
                  ? "bg-[#800000] text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setActiveView("overall")}
            >
              Sammenlagt
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeView === "weekly"
                  ? "bg-[#800000] text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setActiveView("weekly")}
            >
              Ukentlig
            </button>
          </div>
        </div>

        {/* Class Selection */}
        {availableClasses.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200 justify-center">
            <button
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedClass === null
                  ? "bg-[#800000] text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              onClick={() => setSelectedClass(null)}
            >
              Alle klasser
            </button>
            {availableClasses.map((className) => (
              <button
                key={className}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedClass === className
                    ? "bg-[#800000] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedClass(className)}
              >
                {className}
              </button>
            ))}
          </div>
        )}
      </div>

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
          <div className="mb-4 flex justify-center">
            <div className="relative w-full max-w-xs" ref={weekDropdownRef}>
              <button
                onClick={() => {
                  setIsWeekDropdownOpen((open) => {
                    if (!open) setIsYearDropdownOpen(false);
                    return !open;
                  });
                }}
                className="flex items-center justify-between w-full px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors"
              >
                <span>
                  {(() => {
                    const name =
                      results?.Competition?.SubCompetitions?.[selectedWeek]
                        ?.Name || `Uke ${selectedWeek + 1}`;
                    // Prefer part after &rarr; or →
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
                    return match ? match[0] : name;
                  })()}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isWeekDropdownOpen ? "rotate-180" : ""
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
              {isWeekDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-72 overflow-y-auto">
                  {results?.Competition?.SubCompetitions?.map((sub, idx) => {
                    let label = sub.Name || `Uke ${idx + 1}`;
                    // Prefer part after &rarr; or →
                    let afterArrow = null;
                    if (label.includes("&rarr;")) {
                      afterArrow = label.split("&rarr;")[1];
                    } else if (label.includes("→")) {
                      afterArrow = label.split("→")[1];
                    }
                    if (afterArrow) {
                      label = afterArrow.trim();
                    } else {
                      const match = label.match(/Runde \d+/);
                      if (match) label = match[0];
                    }
                    return (
                      <button
                        key={sub.ID || idx}
                        onClick={() => {
                          setSelectedWeek(idx);
                          setIsWeekDropdownOpen(false);
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
          </div>

          {/* Weekly Results */}
          <h2 className="text-2xl font-semibold mb-4">
            Uke {selectedWeek + 1}
          </h2>

          {/* Display weekly results for each class or only the selected class */}
          {(() => {
            // Check if we have the 2022 TourResults format
            const hasTourResults =
              results?.Competition?.TourResults && results?.Competition?.Events;

            let classResults = {};

            if (hasTourResults) {
              // For 2022 TourResults format
              const eventIdForSelectedWeek =
                results.Competition.Events[selectedWeek]?.ID;

              if (!eventIdForSelectedWeek) {
                return (
                  <div className="text-center py-4">
                    <p className="text-amber-500">
                      Ukentlige resultater for 2022 kan ikke vises i samme
                      format på grunn av endringer i API-en.
                    </p>
                    <p className="mt-2">
                      Vennligst bruk sammenlagtvisningen for å se
                      spilleresultater og prestasjoner.
                    </p>
                  </div>
                );
              }

              return (
                <div className="text-center py-4">
                  <p className="text-amber-500">
                    Ukentlige resultater for 2022 kan ikke vises i samme format
                    på grunn av endringer i API-en.
                  </p>
                  <p className="mt-2">
                    Vennligst bruk sammenlagtvisningen for å se spilleresultater
                    og prestasjoner.
                  </p>
                  <p className="mt-2">
                    For detaljerte ukentlige resultater, besøk:{" "}
                    <a
                      href={`https://discgolfmetrix.com/${eventIdForSelectedWeek}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Uke {selectedWeek + 1} på Disc Golf Metrix
                    </a>
                  </p>
                </div>
              );
            } else {
              // Standard format for other years
              // Get all results for the selected week
              const weekResults =
                results?.Competition?.SubCompetitions[selectedWeek]?.Results ||
                [];

              // Group by class or filter by selected class
              classResults = selectedClass
                ? {
                    [selectedClass]: weekResults.filter(
                      (p) => p.ClassName === selectedClass
                    ),
                  }
                : weekResults.reduce((acc, player) => {
                    const className = player.ClassName || "Ukjent";
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
                    {isMobileView ? (
                      <div className="space-y-4">
                        {players.length > 0 ? (
                          players.map((player, idx) => {
                            const holeResults = player.PlayerResults
                              ? [...player.PlayerResults]
                              : [];
                            return (
                              <div
                                key={player.UserID}
                                className={`border rounded-lg p-3 shadow-sm ${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center">
                                    <span className="font-bold text-lg mr-2">
                                      {player.Place}
                                    </span>
                                    <span className="font-medium truncate max-w-[120px]">
                                      {player.Name}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="bg-gray-100 font-bold text-lg px-3 py-1 rounded mb-1">
                                      {player.Sum}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      +/- {player.Diff}
                                    </span>
                                  </div>
                                </div>
                                <div className="overflow-x-auto">
                                  <div className="flex space-x-1 min-w-[600px]">
                                    {Array.from({ length: 18 }).map(
                                      (_, hIdx) => {
                                        const holeData = holeResults[hIdx];
                                        const score = holeData?.Result;
                                        const diff = holeData?.Diff;
                                        let bgColor = "";
                                        if (diff !== undefined) {
                                          if (diff < 0)
                                            bgColor = "bg-green-200";
                                          else if (diff > 0)
                                            bgColor = "bg-red-200";
                                          if (score === "1")
                                            bgColor = "bg-yellow-300";
                                        }
                                        return (
                                          <div
                                            key={hIdx}
                                            className={`w-8 h-8 flex flex-col items-center justify-center border rounded ${bgColor}`}
                                          >
                                            <span className="text-xs text-gray-500">
                                              {hIdx + 1}
                                            </span>
                                            <span className="font-semibold">
                                              {score !== undefined
                                                ? score
                                                : "-"}
                                            </span>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-4 text-center text-gray-500">
                            Ingen resultater tilgjengelig for {className} i uke{" "}
                            {selectedWeek + 1}.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="border-collapse w-full">
                          <thead>
                            <tr>
                              <th className="border border-gray-400 px-4 py-2 text-center">
                                Plass
                              </th>
                              <th className="border border-gray-400 px-4 py-2 text-left">
                                Spiller
                              </th>
                              {/* Display column headers for each hole */}
                              {Array.from({ length: 18 }).map((_, index) => (
                                <th
                                  key={index}
                                  className="border border-gray-400 px-1 py-1 text-center font-medium"
                                >
                                  {index + 1}
                                </th>
                              ))}
                              <th className="border border-gray-400 px-4 py-2 text-center">
                                +/-
                              </th>
                              <th className="border border-gray-400 px-4 py-2 text-center">
                                Totalt
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {players.length > 0 ? (
                              players.map((player) => {
                                const holeResults = player.PlayerResults
                                  ? [...player.PlayerResults]
                                  : [];
                                return (
                                  <tr key={player.UserID}>
                                    <td className="border border-gray-400 px-4 py-2 text-center">
                                      {player.Place}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                      {player.Name}
                                    </td>
                                    {/* Display individual hole scores */}
                                    {Array.from({ length: 18 }).map(
                                      (_, index) => {
                                        const holeData = holeResults[index];
                                        const score = holeData?.Result;
                                        const diff = holeData?.Diff;
                                        let bgColor = "";
                                        if (diff !== undefined) {
                                          if (diff < 0)
                                            bgColor = "bg-green-200";
                                          else if (diff > 0)
                                            bgColor = "bg-red-200";
                                          if (score === "1")
                                            bgColor = "bg-yellow-300";
                                        }
                                        return (
                                          <td
                                            key={index}
                                            className={`border border-gray-400 px-2 py-1 text-center ${bgColor}`}
                                          >
                                            {score !== undefined ? score : "-"}
                                          </td>
                                        );
                                      }
                                    )}
                                    <td className="border border-gray-400 px-4 py-2 text-center">
                                      {player.Diff}
                                    </td>
                                    <td className="border border-gray-400 px-4 py-2 text-center">
                                      {player.Sum}
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan="22"
                                  className="border border-gray-400 px-4 py-2 text-center"
                                >
                                  Ingen resultater tilgjengelig for {className}{" "}
                                  i uke {selectedWeek + 1}.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default FetchResults;
