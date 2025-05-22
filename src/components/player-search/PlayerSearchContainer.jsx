import { useState, useEffect, useRef } from "react";
import { COMPETITIONS } from "../../constants/competitions";
import LoadingSpinner from "../common/LoadingSpinner";
import PlayerList from "./PlayerList";
import PlayerStats from "./PlayerStats";
import PlayerYearSelector from "./PlayerYearSelector";

const AVAILABLE_YEARS = Object.keys(COMPETITIONS).sort().reverse();

function PlayerSearchContainer() {
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
          } catch {
            // Error handling
          }
        }

        // Convert Map to Array and format the sets as arrays
        const playerArray = Array.from(allPlayers.values()).map((player) => ({
          ...player,
          altNames: Array.from(player.altNames),
          classes: Array.from(player.classes),
          years: Array.from(player.years).sort(),
        }));

        // Sort players by name
        playerArray.sort((a, b) => a.name.localeCompare(b.name));

        setPlayers(playerArray);
        setFilteredPlayers(playerArray);
      } catch (err) {
        setError("Kunne ikke hente spillere: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlayers();
  }, []);

  // Update filtered players when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPlayers(players);
      return;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = players.filter((player) => {
      // Check primary name
      if (player.name.toLowerCase().includes(normalizedSearchTerm)) {
        return true;
      }

      // Check alternative names
      for (const altName of player.altNames) {
        if (altName.toLowerCase().includes(normalizedSearchTerm)) {
          return true;
        }
      }

      return false;
    });

    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  // When a player is selected, fetch their data for the selected year
  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerData(null);
      return;
    }

    const fetchPlayerData = async () => {
      setLoading(true);
      setError(null);

      const fetchYearData = async (year, player) => {
        try {
          const COMPETITION_ID = COMPETITIONS[year].id;
          const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;

          const response = await fetch(API_URL);
          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          const processedData = processPlayerYearData(data, player.altNames);
          return processedData;
        } catch {
          return null;
        }
      };

      try {
        const yearDataArray = [];

        if (selectedYear === "all") {
          // Fetch data for all years the player has participated in
          for (const year of selectedPlayer.years) {
            // Skip 2022 when showing "all years" due to API incompatibility
            if (year === "2022") continue;

            const yearData = await fetchYearData(year, selectedPlayer);
            if (yearData) {
              yearDataArray.push({ year, ...yearData });
            }
          }
        } else {
          // Check if user specifically requested 2022 data
          if (selectedYear === "2022") {
            setLoading(false);
            return; // Don't set an error, we'll handle 2022 display separately
          }

          // Fetch data for just the selected year
          const yearData = await fetchYearData(selectedYear, selectedPlayer);
          if (yearData) {
            yearDataArray.push({ year: selectedYear, ...yearData });
          }
        }

        setPlayerData(yearDataArray);
      } catch (err) {
        setError("Kunne ikke hente spillerdata: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayer, selectedYear]);

  const processPlayerYearData = (data, playerNames) => {
    if (!data?.Competition) return null;

    // Initialize results structure
    const playerResults = {
      weeksPlayed: 0,
      totalRounds: 0,
      weeklyResults: [],
      bestRound: null,
      worstRound: null,
      avgResult: 0,
      totalScore: 0,
      holeBirdies: [],
      holePars: [],
      holeBogeys: [],
      holeDoubles: [],
      triples: 0,
      eagles: 0,
      aces: 0,
      holeDistribution: {},
      totalEvents: 0,
    };

    // Process the data based on the format (SubCompetitions vs TourResults)
    if (
      data.Competition.SubCompetitions &&
      Array.isArray(data.Competition.SubCompetitions)
    ) {
      // For 2020-2021, 2023+
      const allWeeks = data.Competition.SubCompetitions;
      // Get par values from the competition if available
      const tracks = data.Competition.Tracks || [];
      const parValues = tracks.length > 0 ? extractParValues(tracks) : null;

      // Loop through each week
      allWeeks.forEach((week, weekIdx) => {
        if (!week.Results || !Array.isArray(week.Results)) {
          return;
        }

        // Find the player in this week's results
        const playerResult = week.Results.find((result) =>
          playerNames.includes(result.Name)
        );

        if (!playerResult) {
          return; // Player didn't play this week
        }

        playerResults.weeksPlayed++;
        playerResults.totalRounds++;

        // Extract hole-by-hole data
        let roundResults = { holes: [], totalScore: 0, distribution: {} };

        if (
          playerResult.PlayerResults &&
          Array.isArray(playerResult.PlayerResults)
        ) {
          roundResults = processRoundResults(
            playerResult.PlayerResults,
            playerResults,
            parValues
          );
        }

        // Use a valid result value, defaulting to totalScore from hole data if Result is missing
        let resultValue = null;

        // Try to get the result from different possible sources
        if (playerResult.Result !== undefined && playerResult.Result !== null) {
          resultValue = playerResult.Result.toString();
        } else if (roundResults.totalScore) {
          resultValue = roundResults.totalScore.toString();
        }

        // Only add valid results
        const resultNum = resultValue ? Number(resultValue) : 0;
        const relativeToPar = parValues
          ? resultNum - parValues.totalPar
          : undefined;

        if (resultValue && !isNaN(resultNum) && resultNum > 0) {
          // Add to weekly results array
          playerResults.weeklyResults.push({
            week: weekIdx + 1,
            name: week.Name || `Uke ${weekIdx + 1}`,
            date: week.Date || week.StartDate || week.EndDate || null,
            result: resultValue,
            relativeToPar: relativeToPar,
            position: playerResult.Position || null,
            holes: roundResults.holes,
            totalScore: roundResults.totalScore,
            distribution: roundResults.distribution,
          });

          // Update total score for average calculation
          playerResults.totalScore += resultNum;

          // Check if this is the best or worst round
          if (relativeToPar !== undefined) {
            // Compare using relation to par
            if (
              playerResults.bestRound === null ||
              playerResults.bestRound.relativeToPar === undefined ||
              relativeToPar < playerResults.bestRound.relativeToPar
            ) {
              playerResults.bestRound = {
                week: weekIdx + 1,
                name: week.Name || `Uke ${weekIdx + 1}`,
                date: week.Date || week.StartDate || week.EndDate || null,
                result: resultValue,
                relativeToPar: relativeToPar,
                position: playerResult.Position || null,
                holes: roundResults.holes,
              };
            }

            if (
              playerResults.worstRound === null ||
              playerResults.worstRound.relativeToPar === undefined ||
              relativeToPar > playerResults.worstRound.relativeToPar
            ) {
              playerResults.worstRound = {
                week: weekIdx + 1,
                name: week.Name || `Uke ${weekIdx + 1}`,
                date: week.Date || week.StartDate || week.EndDate || null,
                result: resultValue,
                relativeToPar: relativeToPar,
                position: playerResult.Position || null,
                holes: roundResults.holes,
              };
            }
          } else {
            // Fallback to absolute score if relativeToPar is not available
            if (
              playerResults.bestRound === null ||
              (playerResults.bestRound.relativeToPar === undefined &&
                resultNum < Number(playerResults.bestRound.result))
            ) {
              playerResults.bestRound = {
                week: weekIdx + 1,
                name: week.Name || `Uke ${weekIdx + 1}`,
                date: week.Date || week.StartDate || week.EndDate || null,
                result: resultValue,
                position: playerResult.Position || null,
                holes: roundResults.holes,
              };
            }

            if (
              playerResults.worstRound === null ||
              (playerResults.worstRound.relativeToPar === undefined &&
                resultNum > Number(playerResults.worstRound.result))
            ) {
              playerResults.worstRound = {
                week: weekIdx + 1,
                name: week.Name || `Uke ${weekIdx + 1}`,
                date: week.Date || week.StartDate || week.EndDate || null,
                result: resultValue,
                position: playerResult.Position || null,
                holes: roundResults.holes,
              };
            }
          }
        } else {
          // If the round is incomplete, don't count it towards total rounds
          playerResults.totalRounds--;
          playerResults.weeksPlayed--;
        }
      });
    } else if (
      data.Competition.TourResults &&
      Array.isArray(data.Competition.TourResults)
    ) {
      // For 2022 (only has aggregated data, not hole-by-hole)
      const playerResult = data.Competition.TourResults.find((result) =>
        playerNames.includes(result.Name)
      );

      if (playerResult) {
        playerResults.totalEvents = playerResult.EventResults?.length || 0;
        playerResults.weeksPlayed = playerResults.totalEvents;
        playerResults.totalRounds = playerResults.totalEvents;

        // Get course par values if available for 2022
        let coursePars = {};
        if (data.Competition.Events && Array.isArray(data.Competition.Events)) {
          data.Competition.Events.forEach((event) => {
            if (event.ID && event.CoursePar) {
              coursePars[event.ID] = parseInt(event.CoursePar, 10);
            }
          });
        }

        // Process each event result
        if (
          playerResult.EventResults &&
          Array.isArray(playerResult.EventResults)
        ) {
          playerResult.EventResults.forEach((event, idx) => {
            // Add null checks and fallbacks
            const events = data.Competition.Events || [];
            const eventWeek = event.EventID
              ? events.find((e) => e.ID === event.EventID)
              : null;
            const weekNumber = idx + 1;

            // Try to determine par for this event
            let relativeToPar = null;
            if (event.EventID && coursePars[event.EventID] && event.Result) {
              const coursePar = coursePars[event.EventID];
              const score = parseInt(event.Result, 10);
              if (!isNaN(score) && !isNaN(coursePar)) {
                relativeToPar = score - coursePar;
              }
            }

            // Track weeklyResults
            if (event.Result) {
              const resultNum = Number(event.Result);

              if (!isNaN(resultNum) && resultNum > 0) {
                playerResults.weeklyResults.push({
                  week: weekNumber,
                  name: eventWeek?.Name || `Uke ${weekNumber}`,
                  date:
                    eventWeek?.Date ||
                    eventWeek?.StartDate ||
                    eventWeek?.EndDate ||
                    null,
                  result: event.Result,
                  relativeToPar: relativeToPar,
                  position: event.Position || null,
                  // No hole-by-hole data available for 2022
                });

                // Track total score
                playerResults.totalScore += resultNum;

                // Track best/worst round
                // Prioritize relativeToPar if available
                if (relativeToPar !== null) {
                  if (
                    playerResults.bestRound === null ||
                    playerResults.bestRound.relativeToPar === undefined ||
                    relativeToPar < playerResults.bestRound.relativeToPar
                  ) {
                    playerResults.bestRound = {
                      week: weekNumber,
                      name: eventWeek?.Name || `Uke ${weekNumber}`,
                      date:
                        eventWeek?.Date ||
                        eventWeek?.StartDate ||
                        eventWeek?.EndDate ||
                        null,
                      result: event.Result,
                      relativeToPar: relativeToPar,
                      position: event.Position || null,
                      // No hole data available for 2022
                    };
                  }

                  if (
                    playerResults.worstRound === null ||
                    playerResults.worstRound.relativeToPar === undefined ||
                    relativeToPar > playerResults.worstRound.relativeToPar
                  ) {
                    playerResults.worstRound = {
                      week: weekNumber,
                      name: eventWeek?.Name || `Uke ${weekNumber}`,
                      date:
                        eventWeek?.Date ||
                        eventWeek?.StartDate ||
                        eventWeek?.EndDate ||
                        null,
                      result: event.Result,
                      relativeToPar: relativeToPar,
                      position: event.Position || null,
                      // No hole data available for 2022
                    };
                  }
                } else {
                  // Fallback to absolute score if relativeToPar is not available
                  if (
                    playerResults.bestRound === null ||
                    (playerResults.bestRound.relativeToPar === undefined &&
                      resultNum < Number(playerResults.bestRound.result))
                  ) {
                    playerResults.bestRound = {
                      week: weekNumber,
                      name: eventWeek?.Name || `Uke ${weekNumber}`,
                      date:
                        eventWeek?.Date ||
                        eventWeek?.StartDate ||
                        eventWeek?.EndDate ||
                        null,
                      result: event.Result,
                      position: event.Position || null,
                      // No hole data available for 2022
                    };
                  }

                  if (
                    playerResults.worstRound === null ||
                    (playerResults.worstRound.relativeToPar === undefined &&
                      resultNum > Number(playerResults.worstRound.result))
                  ) {
                    playerResults.worstRound = {
                      week: weekNumber,
                      name: eventWeek?.Name || `Uke ${weekNumber}`,
                      date:
                        eventWeek?.Date ||
                        eventWeek?.StartDate ||
                        eventWeek?.EndDate ||
                        null,
                      result: event.Result,
                      position: event.Position || null,
                      // No hole data available for 2022
                    };
                  }
                }
              } else {
                // If the round is incomplete, don't count it towards total rounds
                playerResults.totalRounds--;
                playerResults.weeksPlayed--;
                playerResults.totalEvents--;
              }
            } else {
              // If the round has no result, don't count it towards total rounds
              playerResults.totalRounds--;
              playerResults.weeksPlayed--;
              playerResults.totalEvents--;
            }
          });
        }
      }
    }

    // Calculate average result
    if (playerResults.weeksPlayed > 0) {
      const avgResultNum =
        Number(playerResults.totalScore) / playerResults.weeksPlayed;
      playerResults.avgResult = avgResultNum.toFixed(1);
    } else {
      playerResults.avgResult = "0.0";
    }

    return playerResults;
  };

  const processRoundResults = (playerResults, yearData, parValues) => {
    if (!playerResults || !Array.isArray(playerResults)) {
      return { holes: [], totalScore: 0, distribution: {} };
    }

    const holes = [];
    let totalScore = 0;
    const distribution = {
      ace: 0, // Hole in one
      eagle: 0, // -2
      birdie: 0, // -1
      par: 0, // 0
      bogey: 0, // +1
      double: 0, // +2
      triple: 0, // +3+
    };

    playerResults.forEach((hole, idx) => {
      if (!hole || !hole.Result) return;

      let result;
      try {
        result = parseInt(hole.Result, 10);
        if (isNaN(result)) {
          return;
        }
      } catch {
        return;
      }

      // Use par values from the track if available, otherwise use the API's par
      let par = 3; // Default par
      if (parValues && parValues[idx]) {
        par = parValues[idx];
      } else if (hole.Par) {
        try {
          const parsedPar = parseInt(hole.Par, 10);
          if (!isNaN(parsedPar)) par = parsedPar;
        } catch {
          // Error parsing par
        }
      }

      const diff = result - par;

      // Record the hole result
      holes.push({
        number: idx + 1,
        result,
        par,
        diff,
      });

      // Track score stats
      totalScore += result;

      // Update distribution
      if (result === 1) {
        distribution.ace++;
        yearData.aces++;
      } else if (diff === -2 && result > 1) {
        distribution.eagle++;
        yearData.eagles++;
      } else if (diff === -1) {
        distribution.birdie++;
        if (yearData.holeBirdies[idx] === undefined) {
          yearData.holeBirdies[idx] = 0;
        }
        yearData.holeBirdies[idx]++;
      } else if (diff === 0) {
        distribution.par++;
        if (yearData.holePars[idx] === undefined) {
          yearData.holePars[idx] = 0;
        }
        yearData.holePars[idx]++;
      } else if (diff === 1) {
        distribution.bogey++;
        if (yearData.holeBogeys[idx] === undefined) {
          yearData.holeBogeys[idx] = 0;
        }
        yearData.holeBogeys[idx]++;
      } else if (diff === 2) {
        distribution.double++;
        if (yearData.holeDoubles[idx] === undefined) {
          yearData.holeDoubles[idx] = 0;
        }
        yearData.holeDoubles[idx]++;
      } else if (diff >= 3) {
        distribution.triple++;
        yearData.triples++;
      }
    });

    return {
      holes,
      totalScore,
      distribution,
    };
  };

  const extractParValues = (tracks) => {
    if (!tracks || tracks.length === 0) return null;

    // Try to get par values directly from track objects
    if (tracks[0].Par !== undefined) {
      return tracks.map((track) => parseInt(track.Par, 10) || 3);
    }

    // Fall back to the old structure with Holes array
    if (tracks[0].Holes) {
      return tracks[0].Holes.map((hole) => parseInt(hole.Par, 10) || 3);
    }

    // Return null if no par values found
    return null;
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setSearchTerm(player.name);
    setIsSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delayed blur to allow clicking on search results
    setTimeout(() => {
      // Don't blur if we're still inside the component
      if (
        searchInputRef.current &&
        searchInputRef.current.contains(document.activeElement)
      ) {
        return;
      }
      setIsSearchFocused(false);
    }, 200);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearchFocused(true); // Show results dropdown when typing
  };

  // Effect to clear playerData when changing years
  useEffect(() => {
    // Always clear player data when switching years
    setPlayerData(null);
  }, [selectedYear]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-[#800000] mb-4">Spillersøk</h2>

      <div className="bg-[#800000] text-white p-4 mb-6 rounded-lg flex items-center">
        <div className="mr-3">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <div>
          <strong>UNDER KONSTRUKSJON</strong>
          <p className="text-sm">
            Denne funksjonen er fortsatt under utvikling. Spillerdata kan være
            ufullstendig, spesielt for 2022-sesongen.
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Søk etter spiller..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Player list dropdown */}
        <PlayerList
          isVisible={isSearchFocused && filteredPlayers.length > 0}
          players={filteredPlayers}
          onSelectPlayer={handlePlayerSelect}
        />
      </div>

      {/* Year selector (only shown when a player is selected) */}
      {selectedPlayer && (
        <PlayerYearSelector
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={selectedPlayer.years}
        />
      )}

      {/* Player data display */}
      {loading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
          <strong className="font-bold">Feil! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Special message for 2022 data */}
      {selectedYear === "2022" && !loading && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded relative my-4 text-center">
          <p className="font-semibold">
            Hullstatistikk er ikke tilgjengelig for 2022 pga. API-begrensninger.
          </p>
          <p className="mt-2">
            <a
              href={`https://discgolfmetrix.com/?u=tournament&id=${COMPETITIONS["2022"].id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Se konkurransen på Disc Golf Metrix
            </a>
          </p>
        </div>
      )}

      {/* Show player stats if we have data */}
      {selectedPlayer && playerData && !loading && (
        <PlayerStats
          player={selectedPlayer}
          playerData={playerData}
          selectedYear={selectedYear}
        />
      )}

      {/* Initial instruction state */}
      {!selectedPlayer && !loading && (
        <div className="text-center py-12 bg-white shadow-md rounded-lg">
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            Søk etter en spiller for å se statistikk
          </h3>
          <p className="text-gray-500">
            Skriv inn navn i søkefeltet og velg en spiller fra listen.
          </p>
        </div>
      )}
    </div>
  );
}

export default PlayerSearchContainer;
