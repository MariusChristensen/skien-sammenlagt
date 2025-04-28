import React from "react";
import WeeklyResultsTable from "./WeeklyResultsTable";
import WeeklyResultsMobileCard from "./WeeklyResultsMobileCard";

const WeeklyResults = ({
  results,
  selectedWeek,
  selectedClass,
  isMobileView,
}) => {
  // Check if we have the 2022 TourResults format
  const hasTourResults =
    results?.Competition?.TourResults && results?.Competition?.Events;

  let classResults = {};

  if (hasTourResults) {
    // For 2022 TourResults format
    const eventIdForSelectedWeek = results.Competition.Events[selectedWeek]?.ID;

    if (!eventIdForSelectedWeek) {
      return (
        <div className="text-center py-4">
          <p className="text-amber-500">
            Ukentlige resultater for 2022 kan ikke vises i samme format på grunn
            av endringer i API-en.
          </p>
          <p className="mt-2">
            Vennligst bruk sammenlagtvisningen for å se spilleresultater og
            prestasjoner.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-4">
        <p className="text-amber-500">
          Ukentlige resultater for 2022 kan ikke vises i samme format på grunn
          av endringer i API-en.
        </p>
        <p className="mt-2">
          Vennligst bruk sammenlagtvisningen for å se spilleresultater og
          prestasjoner.
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
      results?.Competition?.SubCompetitions[selectedWeek]?.Results || [];

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

    return Object.entries(classResults).map(([className, players]) => (
      <div key={className} className="mb-8">
        <h3 className="text-xl font-semibold mb-3 bg-gray-200 p-2 rounded">
          {className}
        </h3>
        {isMobileView ? (
          <WeeklyResultsMobileCard
            players={players}
            className={className}
            selectedWeek={selectedWeek}
          />
        ) : (
          <WeeklyResultsTable
            players={players}
            className={className}
            selectedWeek={selectedWeek}
          />
        )}
      </div>
    ));
  }
};

export default WeeklyResults;
