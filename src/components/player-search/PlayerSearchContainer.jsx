import React, { useState, useEffect, useRef } from "react";
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

      try {
        const yearDataArray = [];

        if (selectedYear === "all") {
          // Fetch data for all years the player has participated in
          for (const year of selectedPlayer.years) {
            const yearData = await fetchYearData(year, selectedPlayer);
            if (yearData) {
              yearDataArray.push({ year, ...yearData });
            }
          }
        } else {
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
  }, [selectedPlayer, selectedYear]);

  const fetchYearData = async (year, player) => {
    const COMPETITION_ID = COMPETITIONS[year].id;
    const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;

    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error(`Failed to fetch data for year ${year}`);
      return null;
    }

    const data = await response.json();
    const processedData = processPlayerYearData(data, player.altNames);
    return processedData;
  };

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
    if (data.Competition.SubCompetitions) {
      // For 2020-2021, 2023+
      const allWeeks = data.Competition.SubCompetitions;
      // Get par values from the competition if available
      const tracks = data.Competition.Tracks || [];
      const parValues = tracks.length > 0 ? extractParValues(tracks) : null;

      // Loop through each week
      allWeeks.forEach((week, weekIdx) => {
        if (!week.Results) return;

        // Find the player in this week's results
        const playerResult = week.Results.find((result) =>
          playerNames.includes(result.Name)
        );

        if (!playerResult) return; // Player didn't play this week

        playerResults.weeksPlayed++;
        playerResults.totalRounds++;

        // Extract hole-by-hole data
        const roundResults = processRoundResults(
          playerResult.PlayerResults,
          playerResults,
          parValues
        );

        // Add this week's results
        playerResults.weeklyResults.push({
          week: weekIdx + 1,
          name: week.Name || `Uke ${weekIdx + 1}`,
          date: week.Date || week.StartDate || week.EndDate || null,
          result: playerResult.Result || null,
          position: playerResult.Position || null,
          holes: roundResults.holes,
          totalScore: roundResults.totalScore,
          distribution: roundResults.distribution,
        });

        // Track total score
        playerResults.totalScore += parseFloat(playerResult.Result || 0);

        // Check if this is the best or worst round
        if (
          playerResults.bestRound === null ||
          parseFloat(playerResult.Result) <
            parseFloat(playerResults.bestRound.result)
        ) {
          playerResults.bestRound = {
            week: weekIdx + 1,
            name: week.Name || `Uke ${weekIdx + 1}`,
            date: week.Date || week.StartDate || week.EndDate || null,
            result: playerResult.Result,
            position: playerResult.Position,
            holes: roundResults.holes,
          };
        }

        if (
          playerResults.worstRound === null ||
          parseFloat(playerResult.Result) >
            parseFloat(playerResults.worstRound.result)
        ) {
          playerResults.worstRound = {
            week: weekIdx + 1,
            name: week.Name || `Uke ${weekIdx + 1}`,
            date: week.Date || week.StartDate || week.EndDate || null,
            result: playerResult.Result,
            position: playerResult.Position,
            holes: roundResults.holes,
          };
        }
      });
    } else if (data.Competition.TourResults) {
      // For 2022 (only has aggregated data, not hole-by-hole)
      const playerResult = data.Competition.TourResults.find((result) =>
        playerNames.includes(result.Name)
      );

      if (playerResult) {
        playerResults.totalEvents = playerResult.EventResults?.length || 0;
        playerResults.weeksPlayed = playerResults.totalEvents;
        playerResults.totalRounds = playerResults.totalEvents;

        // Process each event result
        if (playerResult.EventResults) {
          playerResult.EventResults.forEach((event, idx) => {
            const eventWeek = data.Competition.Events.find(
              (e) => e.ID === event.EventID
            );
            const weekNumber = idx + 1;

            playerResults.weeklyResults.push({
              week: weekNumber,
              name: eventWeek?.Name || `Uke ${weekNumber}`,
              date:
                eventWeek?.Date ||
                eventWeek?.StartDate ||
                eventWeek?.EndDate ||
                null,
              result: event.Result || null,
              position: event.Position || null,
              // No hole-by-hole data available for 2022
            });

            // Track total score
            if (event.Result) {
              playerResults.totalScore += parseFloat(event.Result);
            }

            // Track best/worst round
            if (
              event.Result &&
              (playerResults.bestRound === null ||
                parseFloat(event.Result) <
                  parseFloat(playerResults.bestRound.result))
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
                position: event.Position,
                // No hole data available
              };
            }

            if (
              event.Result &&
              (playerResults.worstRound === null ||
                parseFloat(event.Result) >
                  parseFloat(playerResults.worstRound.result))
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
                position: event.Position,
                // No hole data available
              };
            }
          });
        }
      }
    }

    // Calculate average result
    if (playerResults.weeksPlayed > 0) {
      playerResults.avgResult = (
        playerResults.totalScore / playerResults.weeksPlayed
      ).toFixed(1);
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

      const result = parseInt(hole.Result, 10);
      if (isNaN(result)) return;

      // Use par values from the track if available, otherwise use the API's par
      const par =
        parValues && parValues[idx]
          ? parValues[idx]
          : parseInt(hole.Par, 10) || 3;
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

      // Update hole distribution
      if (!yearData.holeDistribution[idx]) {
        yearData.holeDistribution[idx] = {};
      }
      if (!yearData.holeDistribution[idx][result]) {
        yearData.holeDistribution[idx][result] = 0;
      }
      yearData.holeDistribution[idx][result]++;
    });

    return { holes, totalScore, distribution };
  };

  const extractParValues = (tracks) => {
    if (!tracks || !tracks.length || !tracks[0].Holes) return null;
    return tracks[0].Holes.map((hole) => parseInt(hole.Par, 10) || 3);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setSearchTerm("");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Spillerstatistikk</h2>

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
