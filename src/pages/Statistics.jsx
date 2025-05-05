import { useState, useRef, useEffect } from "react";
import YearDropdown from "../components/YearDropdown";
import WeekDropdown from "../components/WeekDropdown";
import ViewToggle from "../components/ViewToggle";
import HoleAveragesTable from "../components/HoleAveragesTable";
import ScoreDistribution from "../components/ScoreDistribution";
import { COMPETITIONS } from "../constants/competitions";

const AVAILABLE_YEARS = Object.keys(COMPETITIONS).sort().reverse();

function AceHallOfFame({ results }) {
  // Only search for aces if we have SubCompetitions (2020-2021, 2023+)
  if (!results?.Competition?.SubCompetitions) return null;
  const aces = [];
  results.Competition.SubCompetitions.forEach((week, weekIdx) => {
    const weekDate = week.Date || week.StartDate || week.EndDate || null;
    let formattedDate = null;
    if (weekDate) {
      // Try to format as DD.MM.YYYY
      const d = new Date(weekDate);
      if (!isNaN(d)) {
        formattedDate = d.toLocaleDateString("no-NO");
      }
    }
    week.Results?.forEach((player) => {
      player.PlayerResults?.forEach((hole, holeIdx) => {
        if (hole?.Result === "1") {
          aces.push({
            name: player.Name,
            week: weekIdx + 1,
            hole: holeIdx + 1,
            className: player.ClassName || "",
            date: formattedDate,
          });
        }
      });
    });
  });
  if (aces.length === 0) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow p-4 text-center text-gray-500 font-semibold">
        Ingen aces registrert i år!
      </div>
    );
  }
  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-4 text-[#800000]">
        Ace Hall of Fame
      </h3>
      <div className="hidden sm:grid grid-cols-4 gap-4 px-2 pb-2 text-xs font-semibold text-gray-500 border-b border-gray-200">
        <div>Navn</div>
        <div>Hull</div>
        <div>Dato</div>
        <div>Klasse</div>
      </div>
      <ul className="divide-y divide-gray-200">
        {aces.map((ace, idx) => (
          <li
            key={idx}
            className="py-2 flex flex-col sm:grid sm:grid-cols-4 sm:gap-4 items-start sm:items-center px-2"
          >
            <span className="font-semibold text-gray-800">{ace.name}</span>
            <span className="text-sm text-gray-600">Hull {ace.hole}</span>
            <span className="text-xs text-gray-500">
              {ace.date || `Uke ${ace.week}`}
            </span>
            <span className="text-xs text-gray-400">
              {ace.className && `(${ace.className})`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Statistics() {
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[0]);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  const [activeView, setActiveView] = useState("sammenlagt"); // 'sammenlagt' or 'ukentlig'
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);
  const weekDropdownRef = useRef(null);

  // Initialize selectedWeek based on view
  useEffect(() => {
    if (activeView === "ukentlig" && selectedWeek === 0) {
      setSelectedWeek(1);
    }
  }, [activeView, selectedWeek]);

  // Data fetching state
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch results data when year changes
  useEffect(() => {
    setResults(null);
    setLoading(true);
    setError(null);

    // When changing years, reset week selection based on the active view
    if (activeView === "ukentlig") {
      setSelectedWeek(1); // Set to first week for weekly view
    } else {
      setSelectedWeek(0); // Reset to all weeks for sammenlagt view
    }

    const COMPETITION_ID = COMPETITIONS[selectedYear].id;
    const API_URL = `https://discgolfmetrix.com/api.php?content=result&id=${COMPETITION_ID}`;
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Kunne ikke hente data");
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear, activeView]);

  // Extract weeks from results
  let weeks = [];
  if (results?.Competition?.SubCompetitions) {
    weeks = results.Competition.SubCompetitions;
  } else if (results?.Competition?.Events) {
    weeks = results.Competition.Events;
  }

  // Calculate hole averages
  function calculateHoleAverages(results, selectedWeek) {
    if (!results?.Competition) return [];

    let rounds = [];
    // Handle SubCompetitions (all years except 2022)
    if (results.Competition.SubCompetitions) {
      if (selectedWeek === 0) {
        // All weeks
        rounds = results.Competition.SubCompetitions.flatMap((week) =>
          week.Results ? week.Results : []
        );
      } else if (selectedWeek > 0) {
        // Specific week
        const week = results.Competition.SubCompetitions[selectedWeek - 1];
        rounds = week?.Results || [];
      } else {
        return [];
      }
    } else if (results.Competition.TourResults && results.Competition.Events) {
      // Handle 2022 TourResults/Events format for SAMMENLAGT only
      if (selectedWeek === 0) {
        // For each player, for each event, collect PlayerResults if available
        results.Competition.TourResults.forEach((player) => {
          if (player.EventResults && Array.isArray(player.EventResults)) {
            player.EventResults.forEach((eventResult) => {
              if (eventResult && eventResult.PlayerResults) {
                rounds.push({ PlayerResults: eventResult.PlayerResults });
              }
            });
          }
        });
      } else {
        // No weekly stats for 2022
        return [];
      }
    } else {
      return [];
    }

    // Find max number of holes
    const maxHoles = Math.max(
      ...rounds.map((player) => player.PlayerResults?.length || 0)
    );
    if (!rounds.length || !isFinite(maxHoles) || maxHoles <= 0) return [];

    // Calculate averages
    const sums = Array(maxHoles).fill(0);
    const counts = Array(maxHoles).fill(0);

    rounds.forEach((player) => {
      player.PlayerResults?.forEach((hole, idx) => {
        if (hole?.Result && !isNaN(Number(hole.Result))) {
          sums[idx] += Number(hole.Result);
          counts[idx]++;
        }
      });
    });

    return sums.map((sum, idx) => (counts[idx] ? sum / counts[idx] : null));
  }

  const averages =
    activeView === "sammenlagt"
      ? calculateHoleAverages(results, 0)
      : calculateHoleAverages(results, selectedWeek);

  // Fallback for 2022 weekly stats
  const is2022 = selectedYear === "2022";
  const isUkentlig = activeView === "ukentlig";
  const isSammenlagt = activeView === "sammenlagt";
  let metrixEventId = null;
  if (is2022 && results?.Competition?.Events && weeks[selectedWeek]) {
    metrixEventId = weeks[selectedWeek].ID;
  }
  // For sammenlagt, link to the main competition page
  const metrixCompetitionId = is2022 ? COMPETITIONS["2022"].id : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">Statistikk</h2>
      <div className="bg-white shadow-md rounded-lg mb-6 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4">
          <YearDropdown
            years={AVAILABLE_YEARS}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
            isOpen={isYearDropdownOpen}
            setIsOpen={setIsYearDropdownOpen}
            dropdownRef={yearDropdownRef}
          />
          <ViewToggle
            activeView={activeView}
            onChange={(view) => {
              // When switching to weekly view, set selectedWeek to 1 (first week)
              if (view === "ukentlig" && activeView !== "ukentlig") {
                setSelectedWeek(1);
              }
              setActiveView(view);
            }}
            leftLabel="Sammenlagt"
            rightLabel="Ukentlig"
            leftValue="sammenlagt"
            rightValue="ukentlig"
          />
        </div>
        {activeView === "ukentlig" && (
          <div className="flex justify-center">
            <WeekDropdown
              weeks={weeks}
              selectedWeek={selectedWeek}
              onChange={(idx) => {
                setSelectedWeek(idx);
                setIsWeekDropdownOpen(false);
              }}
              isOpen={isWeekDropdownOpen}
              setIsOpen={setIsWeekDropdownOpen}
              dropdownRef={weekDropdownRef}
            />
          </div>
        )}
      </div>
      {/* Fallback for 2022 sammenlagt stats */}
      {is2022 && isSammenlagt && !loading && !error && (
        <div className="mb-8 bg-white rounded-lg shadow p-4 text-center">
          <p className="text-amber-600 font-semibold mb-2">
            Hullstatistikk er ikke tilgjengelig for 2022 pga. API-begrensninger.
          </p>
          <a
            href={`https://discgolfmetrix.com/${metrixCompetitionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Se konkurransen på Disc Golf Metrix
          </a>
        </div>
      )}
      {/* Fallback for 2022 weekly stats */}
      {is2022 && isUkentlig && !loading && !error && metrixEventId && (
        <div className="mb-8 bg-white rounded-lg shadow p-4 text-center">
          <p className="text-amber-600 font-semibold mb-2">
            Ukentlig statistikk for 2022 kan ikke vises i detalj her pga.
            endringer i API-strukturen.
          </p>
          <a
            href={`https://discgolfmetrix.com/${metrixEventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Se detaljer for denne uken på Disc Golf Metrix
          </a>
        </div>
      )}
      {/* Ace Hall of Fame just above stats table, only in sammenlagt view for non-2022 years */}
      {activeView === "sammenlagt" && !loading && !error && !is2022 && (
        <AceHallOfFame results={results} />
      )}

      {/* Score Distribution Component */}
      {!(is2022 && (isUkentlig || isSammenlagt)) && !loading && !error && (
        <ScoreDistribution
          results={results}
          selectedWeek={selectedWeek}
          activeView={activeView}
        />
      )}

      {/* Only show stats table if not 2022 weekly or sammenlagt fallback */}
      {!(is2022 && (isUkentlig || isSammenlagt)) && !loading && !error && (
        <HoleAveragesTable averages={averages} />
      )}
      {loading && <p className="text-center py-8">Laster statistikk...</p>}
      {error && <p className="text-center py-8 text-red-500">Feil: {error}</p>}
    </div>
  );
}

export default Statistics;
