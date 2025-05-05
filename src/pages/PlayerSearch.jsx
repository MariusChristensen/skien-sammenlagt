import React, { useState, useEffect, useRef } from "react";
import { COMPETITIONS } from "../constants/competitions";
import LoadingSpinner from "../components/LoadingSpinner";

const AVAILABLE_YEARS = Object.keys(COMPETITIONS).sort().reverse();

function PlayerSearch() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all");
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  // Fetch all players from all available years
  useEffect(() => {
    const fetchAllPlayers = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, collect all unique players from all years
        const allPlayers = new Map(); // Use Map to track unique players by name

        // Fetch players from each year
        for (const year of AVAILABLE_YEARS) {
          try {
            const COMPETITION_ID = COMPETITIONS[year].id;
            const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;

            const response = await fetch(API_URL);
            if (!response.ok) continue; // Skip year if fetch fails

            const data = await response.json();

            // Extract all players from SubCompetitions (if available)
            if (data?.Competition?.SubCompetitions) {
              data.Competition.SubCompetitions.forEach((week) => {
                if (!week.Results) return;

                week.Results.forEach((player) => {
                  const playerName = player.Name;
                  if (!playerName) return; // Skip if no name

                  // Check if we have this exact name already
                  if (!allPlayers.has(playerName)) {
                    // Check for similar names (name changes) - for example, "Marius" and "Marius Skårdal"
                    let foundSimilarName = false;

                    // This requires at least two name parts to match OR a very high similarity
                    for (const [
                      existingName,
                      existingPlayer,
                    ] of allPlayers.entries()) {
                      const nameParts = playerName.toLowerCase().split(" ");
                      const existingParts = existingName
                        .toLowerCase()
                        .split(" ");

                      // Count matching name parts
                      const matchingParts = nameParts.filter((part) =>
                        existingParts.includes(part)
                      );

                      // Require at least 2 matching name parts when both names have at least 2 parts
                      if (
                        matchingParts.length >= 2 &&
                        nameParts.length >= 2 &&
                        existingParts.length >= 2
                      ) {
                        // Consider this the same player with a name variation
                        existingPlayer.altNames.add(playerName);
                        existingPlayer.years.add(year);
                        existingPlayer.classes.add(
                          player.ClassName || "Unknown"
                        );
                        foundSimilarName = true;
                        break;
                      }

                      // Special case for single-part names - only match if they're identical
                      if (
                        nameParts.length === 1 &&
                        existingParts.length === 1 &&
                        nameParts[0] === existingParts[0]
                      ) {
                        existingPlayer.altNames.add(playerName);
                        existingPlayer.years.add(year);
                        existingPlayer.classes.add(
                          player.ClassName || "Unknown"
                        );
                        foundSimilarName = true;
                        break;
                      }
                    }

                    if (!foundSimilarName) {
                      // New player we haven't seen before
                      allPlayers.set(playerName, {
                        name: playerName,
                        id: player.PlayerID || player.ID || playerName, // Fallback to name if no ID
                        altNames: new Set([playerName]), // Alternative names
                        classes: new Set([player.ClassName || "Unknown"]),
                        years: new Set([year]),
                      });
                    }
                  } else {
                    // Update existing player data
                    const existingPlayer = allPlayers.get(playerName);
                    existingPlayer.classes.add(player.ClassName || "Unknown");
                    existingPlayer.years.add(year);
                  }
                });
              });
            }
            // For 2022 format with TourResults
            else if (data?.Competition?.TourResults) {
              data.Competition.TourResults.forEach((player) => {
                const playerName = player.Name;
                if (!playerName) return; // Skip if no name

                // Check if we have this exact name already
                if (!allPlayers.has(playerName)) {
                  // Check for similar names (name changes)
                  let foundSimilarName = false;

                  // This requires at least two name parts to match OR a very high similarity
                  for (const [
                    existingName,
                    existingPlayer,
                  ] of allPlayers.entries()) {
                    const nameParts = playerName.toLowerCase().split(" ");
                    const existingParts = existingName.toLowerCase().split(" ");

                    // Count matching name parts
                    const matchingParts = nameParts.filter((part) =>
                      existingParts.includes(part)
                    );

                    // Require at least 2 matching name parts when both names have at least 2 parts
                    if (
                      matchingParts.length >= 2 &&
                      nameParts.length >= 2 &&
                      existingParts.length >= 2
                    ) {
                      // Consider this the same player with a name variation
                      existingPlayer.altNames.add(playerName);
                      existingPlayer.years.add(year);
                      existingPlayer.classes.add(player.ClassName || "Unknown");
                      foundSimilarName = true;
                      break;
                    }

                    // Special case for single-part names - only match if they're identical
                    if (
                      nameParts.length === 1 &&
                      existingParts.length === 1 &&
                      nameParts[0] === existingParts[0]
                    ) {
                      existingPlayer.altNames.add(playerName);
                      existingPlayer.years.add(year);
                      existingPlayer.classes.add(player.ClassName || "Unknown");
                      foundSimilarName = true;
                      break;
                    }
                  }

                  if (!foundSimilarName) {
                    // New player we haven't seen before
                    allPlayers.set(playerName, {
                      name: playerName,
                      id: player.PlayerID || player.ID || playerName, // Fallback to name if no ID
                      altNames: new Set([playerName]), // Alternative names
                      classes: new Set([player.ClassName || "Unknown"]),
                      years: new Set([year]),
                    });
                  }
                } else {
                  // Update existing player data
                  const existingPlayer = allPlayers.get(playerName);
                  existingPlayer.classes.add(player.ClassName || "Unknown");
                  existingPlayer.years.add(year);
                }
              });
            }
          } catch (yearError) {
            console.error(`Error processing year ${year}:`, yearError);
          }
        }

        // Convert Map to Array and format the sets as arrays
        const playerArray = Array.from(allPlayers.values()).map((player) => ({
          ...player,
          altNames: Array.from(player.altNames),
          classes: Array.from(player.classes),
          years: Array.from(player.years).sort(),
        }));

        setPlayers(playerArray);
        setFilteredPlayers(playerArray);
      } catch (err) {
        setError("Kunne ikke hente spillerliste");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlayers();
  }, []);

  // Filter players based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers(players);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = players.filter((player) => {
      // Check if any of the player's names match the search term
      return player.altNames.some((name) =>
        name.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  // Effect to fetch player data when player or year changes
  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerDetailedData(selectedPlayer);
    }
  }, [selectedPlayer, selectedYear]);

  // Fetch detailed player data when a player is selected
  const fetchPlayerDetailedData = async (player) => {
    if (!player) return;

    setLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      // We'll need to fetch data for this player from each year they participated
      const playerYears =
        selectedYear === "all" ? player.years : [selectedYear];

      const playerDetailedData = {
        name: player.name,
        years: {},
        overall: {
          totalRounds: 0,
          holeAverages: [],
          scoreDistribution: {
            "-2": 0, // Eagle or better
            "-1": 0, // Birdie
            0: 0, // Par
            1: 0, // Bogey
            2: 0, // Double Bogey
            "3+": 0, // Triple+ Bogey
            total: 0,
          },
        },
      };

      let successfulYears = 0;
      let skippedYears = [];

      // For each year, fetch competition data and extract player's results
      for (const year of playerYears) {
        try {
          // Skip 2022 data which has a different structure without hole data
          if (year === "2022") {
            skippedYears.push(year);
            continue;
          }

          const COMPETITION_ID = COMPETITIONS[year].id;
          const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;

          const response = await fetch(API_URL);
          if (!response.ok) continue;

          const data = await response.json();

          // Check both primary name and alternative names
          const allPlayerNames = player.altNames || [player.name];
          const yearData = await processPlayerYearData(data, allPlayerNames);

          // Skip years with no rounds
          if (yearData.totalRounds === 0) {
            continue;
          }

          // Store the year data and update overall stats
          playerDetailedData.years[year] = yearData;
          successfulYears++;

          // Add to overall statistics
          playerDetailedData.overall.totalRounds += yearData.totalRounds;

          // Combine score distribution
          Object.keys(yearData.scoreDistribution).forEach((key) => {
            if (key !== "total") {
              playerDetailedData.overall.scoreDistribution[key] +=
                yearData.scoreDistribution[key];
            }
          });
          playerDetailedData.overall.scoreDistribution.total +=
            yearData.scoreDistribution.total;

          // Average the hole averages (will need to weight by rounds played)
          // This is a simplified version - a more accurate calculation would weight by rounds
          if (playerDetailedData.overall.holeAverages.length === 0) {
            playerDetailedData.overall.holeAverages = [
              ...yearData.holeAverages,
            ];
          } else {
            // Only combine if lengths match (same number of holes)
            if (
              playerDetailedData.overall.holeAverages.length ===
              yearData.holeAverages.length
            ) {
              playerDetailedData.overall.holeAverages =
                playerDetailedData.overall.holeAverages.map((avg, idx) => {
                  const yearAvg = yearData.holeAverages[idx];
                  return avg !== null && yearAvg !== null
                    ? (avg + yearAvg) / 2 // Simple average for now
                    : avg !== null
                    ? avg
                    : yearAvg;
                });
            }
          }
        } catch (yearErr) {
          // Just log the error for this year but continue processing other years
          console.error(
            `Error processing ${year} for ${player.name}:`,
            yearErr
          );
        }
      }

      if (successfulYears > 0) {
        // Add skipped years info to the player data
        playerDetailedData.skippedYears = skippedYears;
        setPlayerData(playerDetailedData);
      } else {
        if (
          skippedYears.length > 0 &&
          skippedYears.length === playerYears.length
        ) {
          // All requested years were skipped
          setError(
            `Spillerdata for ${player.name} i ${skippedYears.join(
              ", "
            )} kan ikke vises med detaljert hullstatistikk.`
          );
        } else {
          setError(
            `Kunne ikke hente spillerdata for ${player.name}${
              selectedYear !== "all" ? ` for ${selectedYear}` : ""
            }`
          );
        }
      }
    } catch (err) {
      setError("Kunne ikke hente spillerdata");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Process a single year's data for a player - now using an array of possible player names
  const processPlayerYearData = async (data, playerNames) => {
    const yearData = {
      totalRounds: 0,
      rounds: [],
      holeAverages: [],
      scoreDistribution: {
        "-2": 0, // Eagle or better
        "-1": 0, // Birdie
        0: 0, // Par
        1: 0, // Bogey
        2: 0, // Double Bogey
        "3+": 0, // Triple+ Bogey
        total: 0,
      },
    };

    try {
      // Extract player's rounds from each week - check all name variations
      if (data?.Competition?.SubCompetitions) {
        // Regular format (2020-2021, 2023+)
        data.Competition.SubCompetitions.forEach((week) => {
          if (!week.Results) return;

          // Find the player result by any of their name variations
          const playerResult = week.Results.find((p) =>
            playerNames.includes(p.Name)
          );

          if (playerResult && playerResult.PlayerResults) {
            yearData.totalRounds++;
            yearData.rounds.push({
              week: week.Name,
              date: week.Date,
              results: playerResult.PlayerResults,
            });

            // Process hole results for this round
            processRoundResults(playerResult.PlayerResults, yearData);
          }
        });
      }
      // For 2022 with TourResults (more complex extraction) - skipped via fetchPlayerDetailedData
      else if (data?.Competition?.TourResults) {
        const playerTourResult = data.Competition.TourResults.find((p) =>
          playerNames.includes(p.Name)
        );

        if (playerTourResult && playerTourResult.EventResults) {
          playerTourResult.EventResults.forEach((event) => {
            if (
              event &&
              event.PlayerResults &&
              Array.isArray(event.PlayerResults) &&
              event.PlayerResults.length > 0
            ) {
              yearData.totalRounds++;
              yearData.rounds.push({
                week: event.EventName || `Uke ${yearData.rounds.length + 1}`,
                date: event.EventDate,
                results: event.PlayerResults,
              });

              // Process hole results for this round
              processRoundResults(event.PlayerResults, yearData);
            }
          });
        }
      }

      // Calculate hole averages from accumulated data
      if (yearData.rounds.length > 0) {
        // Find the max holes across all rounds
        const maxHoles = Math.max(
          ...yearData.rounds.map((round) => round.results.length)
        );

        // Initialize sums and counts for each hole
        const sums = Array(maxHoles).fill(0);
        const counts = Array(maxHoles).fill(0);

        // Add up scores for each hole
        yearData.rounds.forEach((round) => {
          round.results.forEach((hole, holeIdx) => {
            if (hole?.Result && !isNaN(Number(hole.Result))) {
              sums[holeIdx] += Number(hole.Result);
              counts[holeIdx]++;
            }
          });
        });

        // Calculate averages
        yearData.holeAverages = sums.map((sum, idx) =>
          counts[idx] > 0 ? sum / counts[idx] : null
        );
      }
    } catch (err) {
      console.error("Error processing year data:", err);
      // Return empty data structure, calling function will handle it
    }

    return yearData;
  };

  // Process individual round results
  const processRoundResults = (playerResults, yearData) => {
    // Extract par values - similar to what we did in ScoreDistribution component
    const parValues = extractParValues(playerResults);

    // Process each hole's score
    playerResults.forEach((hole, idx) => {
      if (hole?.Result && !isNaN(Number(hole.Result))) {
        const result = Number(hole.Result);
        const par = parValues[idx] || 3; // Default par 3 if missing
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

        yearData.scoreDistribution[scoreKey]++;
        yearData.scoreDistribution.total++;
      }
    });
  };

  // Extract par values from results (similar to ScoreDistribution component)
  const extractParValues = (playerResults) => {
    // Try to calculate par from Result and Diff
    const parValues = [];

    if (playerResults && playerResults.length > 0) {
      // Calculate par as Result - Diff for each hole
      parValues.push(
        ...playerResults.map((hole) => {
          const result = parseInt(hole.Result, 10);
          const diff = parseInt(hole.Diff, 10);
          if (!isNaN(result) && !isNaN(diff)) {
            return result - diff;
          }
          return 3; // Default if calculation fails
        })
      );
    }

    // If we couldn't calculate any par values, default to par 3
    if (parValues.length === 0) {
      return Array(18).fill(3);
    }

    return parValues;
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name); // Set the search term to the selected player's name
    setIsSearchFocused(false); // Hide the player list
    if (searchInputRef.current) {
      searchInputRef.current.blur(); // Remove focus from the search input
    }
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = (e) => {
    // Delay hiding the list to allow for clicks on the list
    setTimeout(() => {
      // Safe check for the current target and active element
      if (
        e &&
        e.currentTarget &&
        document.activeElement &&
        !e.currentTarget.contains(document.activeElement)
      ) {
        setIsSearchFocused(false);
      }
    }, 200);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // If they're changing the search, clear any selected player
    if (selectedPlayer && e.target.value !== selectedPlayer.name) {
      setSelectedPlayer(null);
      setPlayerData(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Spillersøk</h2>

      {/* Construction banner */}
      <div className="bg-[#800000] text-white p-4 mb-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-xl font-bold">UNDER KONSTRUKSJON</h3>
            <p>
              Denne funksjonen er fortsatt under utvikling. Spillerdata kan være
              ufullstendig, spesielt for 2022-sesongen.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <div className="mb-6">
          <label
            htmlFor="playerSearch"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Søk etter spiller
          </label>
          <input
            type="text"
            id="playerSearch"
            ref={searchInputRef}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#800000] focus:border-[#800000]"
            placeholder="Skriv inn navn..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>

        {/* Display filtered players only when searching and not showing player stats */}
        {isSearchFocused && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Spillere</h3>
            {loading && !playerData && !selectedPlayer && (
              <LoadingSpinner text="Henter spillerliste..." />
            )}
            {error && !playerData && !selectedPlayer && (
              <p className="text-red-500">{error}</p>
            )}

            {!loading && !error && filteredPlayers.length === 0 && (
              <p>Ingen spillere funnet</p>
            )}

            {filteredPlayers.length > 0 && (
              <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {filteredPlayers.map((player) => (
                  <li key={player.name} className="py-2">
                    <button
                      className="w-full text-left hover:bg-gray-50 p-2 rounded"
                      onClick={() => handlePlayerSelect(player)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className="font-medium">{player.name}</span>
                      {player.altNames.length > 1 && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Også kjent som:{" "}
                          {player.altNames
                            .filter((n) => n !== player.name)
                            .join(", ")}
                          )
                        </span>
                      )}
                      <span className="text-sm text-gray-500 ml-2">
                        ({player.years.join(", ")})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Player details section */}
      {selectedPlayer && (
        <div className="bg-white shadow-md rounded-lg mb-6 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{selectedPlayer.name}</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setSelectedPlayer(null);
                setPlayerData(null);
                setSearchTerm("");
                setIsSearchFocused(true);
                if (searchInputRef.current) {
                  searchInputRef.current.focus();
                }
              }}
            >
              &times; Lukk
            </button>
          </div>

          {/* Year selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vis statistikk for
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-md ${
                  selectedYear === "all"
                    ? "bg-[#800000] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedYear("all")}
              >
                Alle år
              </button>
              {selectedPlayer.years.map((year) => (
                <button
                  key={year}
                  className={`px-3 py-1 rounded-md ${
                    selectedYear === year
                      ? "bg-[#800000] text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Player statistics */}
          {loading ? (
            <LoadingSpinner text="Henter spillerstatistikk..." />
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : playerData ? (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Score Distribution */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-bold text-[#800000] mb-4">
                    Poengfordeling
                  </h4>
                  {playerData.overall.scoreDistribution.total > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {/* Order the score types: Eagle, Birdie, Par, Bogey, Double Bogey, Triple+ */}
                      {["-2", "-1", "0", "1", "2", "3+"].map((score) => {
                        const count =
                          playerData.overall.scoreDistribution[score] || 0;
                        // Calculate percentage
                        const percentage = (
                          (count / playerData.overall.scoreDistribution.total) *
                          100
                        ).toFixed(1);

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

                        // Labels
                        const scoreLabels = {
                          "-2": "Ace/Eagle",
                          "-1": "Birdie",
                          0: "Par",
                          1: "Bogey",
                          2: "Double Bogey",
                          "3+": "Triple+",
                        };

                        return (
                          <div
                            key={score}
                            className={`${bgColor} rounded-lg p-3 text-center shadow-sm`}
                          >
                            <div className={`font-bold ${textColor}`}>
                              {scoreLabels[score] || score}
                            </div>
                            <div className="text-2xl font-bold mt-1">
                              {count}
                            </div>
                            <div className="text-sm">{percentage}%</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      Ingen score-data tilgjengelig
                    </p>
                  )}
                </div>

                {/* Hole Averages - Only show for specific years, not "all years" */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-bold text-[#800000] mb-4">
                    Hullgjennomsnitt
                  </h4>
                  {selectedYear !== "all" &&
                  playerData.years[selectedYear]?.holeAverages.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {playerData.years[selectedYear].holeAverages.map(
                        (avg, idx) => (
                          <div
                            key={idx}
                            className="text-center p-2 bg-gray-100 rounded shadow-sm"
                          >
                            <div className="text-xs text-gray-500">
                              Hull {idx + 1}
                            </div>
                            <div className="text-lg font-semibold">
                              {avg !== null ? avg.toFixed(1) : "-"}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : selectedYear === "all" ? (
                    <p className="text-center text-gray-500">
                      Hullgjennomsnitt kan ikke vises for alle år samlet siden
                      banelayouten kan variere mellom år.
                      <br />
                      Velg ett spesifikt år for å se hullgjennomsnitt.
                    </p>
                  ) : (
                    <p className="text-center text-gray-500">
                      Ingen hull-data tilgjengelig
                    </p>
                  )}
                </div>

                {/* Year by Year Performance Summary */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-bold text-[#800000] mb-4">
                    Utvikling over tid
                  </h4>
                  {Object.keys(playerData.years).length > 0 ? (
                    <div>
                      <p className="mb-2">
                        Total antall runder: {playerData.overall.totalRounds}
                      </p>

                      {selectedYear === "all" && (
                        <p className="text-gray-500 italic text-center">
                          Graf med spillerrating og utvikling over tid kommer i
                          en fremtidig oppdatering.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      Ingen data tilgjengelig
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default PlayerSearch;
