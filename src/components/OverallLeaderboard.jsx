import React, { useEffect, useState } from "react";
import OverallLeaderboardTable from "./OverallLeaderboardTable";
import OverallLeaderboardMobileCard from "./OverallLeaderboardMobileCard";

const OverallLeaderboard = ({
  results,
  selectedClass = null,
  selectedYear = "2025",
}) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [maxCompetitions, setMaxCompetitions] = useState(20);

  // Minimum number of columns to display (for visual consistency)
  const MIN_COMPETITIONS_DISPLAY = 20;

  // Function to calculate points based on placement
  const calculatePoints = (place) => {
    if (place === 1) return 50;
    if (place === 2) return 45;
    if (place === 3) return 40;
    if (place === 4) return 38;

    // After 4th place, decrease by 2 points until reaching 10
    let points = 38 - (place - 4) * 2;

    // If points are 10 or less, decrease by 1 point per place
    if (points <= 10) {
      // Calculate how many places after reaching 10 points
      const placeAt10Points = Math.floor((38 - 10) / 2) + 4;
      points = 10 - (place - placeAt10Points);
    }

    return Math.max(0, points); // Ensure no negative points
  };

  useEffect(() => {
    // Handle responsive design
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!results?.Competition) return;

    let playerScores = {};
    let eventCount = 0;

    // Check which data format we have - TourResults or SubCompetitions
    const hasTourResults =
      results.Competition.TourResults &&
      results.Competition.TourResults.length > 0;

    const hasSubCompetitions =
      results.Competition.SubCompetitions &&
      results.Competition.SubCompetitions.length > 0;

    // Get number of events from the data
    if (hasTourResults && results.Competition.Events) {
      // TourResults format (2022)
      const events = results.Competition.Events;
      eventCount = events.length;

      // Keep track of merged players to ensure we use consistent names
      const mergedPlayerNames = {};

      // First pass - gather all names for each UserID
      results.Competition.TourResults.forEach((player) => {
        if (player.UserID) {
          if (!mergedPlayerNames[player.UserID]) {
            mergedPlayerNames[player.UserID] = [];
          }
          mergedPlayerNames[player.UserID].push(player.Name);
        }
      });

      // Choose the longest name for each player (usually the most complete name)
      Object.keys(mergedPlayerNames).forEach((userId) => {
        mergedPlayerNames[userId] = mergedPlayerNames[userId].reduce(
          (longest, current) =>
            current.length > longest.length ? current : longest,
          ""
        );
      });

      // We need to process each event separately
      // First, initialize player objects
      results.Competition.TourResults.forEach((player) => {
        if (!player.UserID) return; // Skip players without UserID

        const playerID = player.UserID;
        const playerClass = player.ClassName || "Unknown";

        // Skip if filtering by class and this player is in a different class
        if (selectedClass && playerClass !== selectedClass) return;

        // Use the consistent name for this player
        const playerName = mergedPlayerNames[playerID] || player.Name;

        // Initialize player in our tracking object
        if (!playerScores[playerID]) {
          playerScores[playerID] = {
            name: playerName,
            id: playerID,
            class: playerClass,
            weeklyPoints: Array(eventCount).fill(0),
            weeklyPointsInfo: Array(eventCount).fill({
              points: 0,
              counts: false,
              isCompleted: false,
            }),
            totalPoints: 0,
            // Store raw scores for processing
            rawScores: Array(eventCount).fill(null),
          };
        }

        // Merge the scores from this entry with existing scores
        if (player.EventResults) {
          player.EventResults.forEach((result, weekIndex) => {
            if (weekIndex < eventCount && result !== null) {
              playerScores[playerID].rawScores[weekIndex] = result;
            }
          });
        }
      });

      // Now calculate points for each event based on player placement
      events.forEach((event, eventIndex) => {
        // Get all players who participated in this event
        const eventParticipants = Object.values(playerScores)
          .filter(
            (player) =>
              player.rawScores && player.rawScores[eventIndex] !== null
          )
          .map((player) => ({
            id: player.id,
            score: player.rawScores[eventIndex],
          }));

        // Only calculate points if there are actual scores (not just registrations)
        const hasActualScores = eventParticipants.some((p) => p.score > 0);

        if (hasActualScores) {
          // Sort participants by score (lower is better)
          eventParticipants.sort((a, b) => a.score - b.score);

          // Assign points based on placement
          eventParticipants.forEach((participant, index) => {
            const place = index + 1;
            const points = calculatePoints(place);

            if (playerScores[participant.id]) {
              playerScores[participant.id].weeklyPoints[eventIndex] = points;
              playerScores[participant.id].weeklyPointsInfo[eventIndex] = {
                points,
                counts: false,
                isCompleted: true,
              };
            }
          });
        } else {
          // Mark this week as not completed for all players
          Object.values(playerScores).forEach((player) => {
            player.weeklyPointsInfo[eventIndex] = {
              points: 0,
              counts: false,
              isCompleted: false,
            };
          });
        }
      });

      // Clean up the raw scores which we no longer need
      Object.values(playerScores).forEach((player) => {
        delete player.rawScores;
      });
    } else if (hasSubCompetitions) {
      // SubCompetitions format (other years)
      const subCompetitions = results.Competition.SubCompetitions;
      eventCount = subCompetitions.length;

      // Process each subcompetition (weekly event)
      subCompetitions.forEach((competition, weekIndex) => {
        if (!competition.Results) return;

        // Check if this competition has actual scores (not just registrations)
        const hasActualScores = competition.Results.some(
          (player) => player.Sum !== undefined && player.Sum > 0
        );

        if (hasActualScores) {
          // Calculate points for each player in this week
          competition.Results.forEach((player) => {
            const playerName = player.Name;
            const playerID = player.UserID;
            const playerClass = player.ClassName || "Unknown";
            const points = calculatePoints(player.Place);

            // Skip if filtering by class and this player is in a different class
            if (selectedClass && playerClass !== selectedClass) return;

            // Initialize player in our tracking object if first encounter
            if (!playerScores[playerID]) {
              playerScores[playerID] = {
                name: playerName,
                id: playerID,
                class: playerClass,
                weeklyPoints: Array(eventCount).fill(0),
                weeklyPointsInfo: Array(eventCount).fill({
                  points: 0,
                  counts: false,
                  isCompleted: false,
                }),
                totalPoints: 0,
              };
            }

            // Add points for this week
            playerScores[playerID].weeklyPoints[weekIndex] = points;
            playerScores[playerID].weeklyPointsInfo[weekIndex] = {
              points: points,
              counts: false,
              isCompleted: true,
            };
          });
        } else {
          // Mark this week as not completed for all players
          Object.values(playerScores).forEach((player) => {
            player.weeklyPointsInfo[weekIndex] = {
              points: 0,
              counts: false,
              isCompleted: false,
            };
          });
        }
      });
    } else {
      // No data available in a format we understand
      console.warn("No competition data found in a recognized format");
      setLeaderboard([]);
      setMaxCompetitions(MIN_COMPETITIONS_DISPLAY);
      return;
    }

    // Update maxCompetitions state
    setMaxCompetitions(Math.max(eventCount, MIN_COMPETITIONS_DISPLAY));

    // Calculate total points using best 50% of completed competitions for each player
    Object.values(playerScores).forEach((player) => {
      // Create array of point objects with week index and points value
      const pointsWithIndices = player.weeklyPointsInfo
        .map((info, index) => ({
          index,
          points: info.points,
          isCompleted: info.isCompleted,
        }))
        .filter((item) => item.points > 0 && item.isCompleted); // Only include completed weeks with points

      // Sort by points (descending)
      pointsWithIndices.sort((a, b) => b.points - a.points);

      // Calculate number of counting competitions (50% of total competitions)
      const countingCompetitions = Math.floor(eventCount * 0.5);

      // Determine which results count (50% or all if fewer than 50%)
      const countingResults = Math.min(
        countingCompetitions,
        pointsWithIndices.length
      );
      let total = 0;

      // Mark all as not counting initially
      player.weeklyPointsInfo.forEach((info, index) => {
        player.weeklyPointsInfo[index] = { ...info, counts: false };
      });

      // Mark the top counting results and sum them
      for (let i = 0; i < countingResults; i++) {
        const { index, points } = pointsWithIndices[i];
        player.weeklyPointsInfo[index] = {
          ...player.weeklyPointsInfo[index],
          counts: true,
        };
        total += points;
      }

      player.totalPoints = total;
    });

    // Convert to array and sort by total points (descending)
    const leaderboardArray = Object.values(playerScores).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    setLeaderboard(leaderboardArray);
  }, [results, selectedClass]);

  if (!results) return null;

  // Get the actual week count from data
  const actualWeekCount =
    results?.Competition?.SubCompetitions?.length ||
    results?.Competition?.Events?.length ||
    0;

  // Use the larger of actual week count or minimum display count or maxCompetitions
  const displayWeekCount = Math.max(
    actualWeekCount,
    MIN_COMPETITIONS_DISPLAY,
    maxCompetitions
  );

  // Group players by class if no specific class is selected
  const groupedLeaderboards = !selectedClass
    ? leaderboard.reduce((groups, player) => {
        const playerClass = player.class;
        if (!groups[playerClass]) {
          groups[playerClass] = [];
        }
        groups[playerClass].push(player);
        return groups;
      }, {})
    : { [selectedClass]: leaderboard };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Sammenlagt {selectedYear}</h2>
      {/* Show leaderboards for each class */}
      {Object.entries(groupedLeaderboards).map(([className, players]) => (
        <div key={className} className="mb-10">
          <h3 className="text-xl font-semibold mb-3 bg-gray-200 p-2 rounded">
            {className}
          </h3>
          {isMobileView ? (
            <OverallLeaderboardMobileCard
              players={players}
              displayWeekCount={displayWeekCount}
            />
          ) : (
            <OverallLeaderboardTable
              players={players}
              displayWeekCount={displayWeekCount}
              actualWeekCount={actualWeekCount}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default OverallLeaderboard;
