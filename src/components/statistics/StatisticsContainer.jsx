import { useState, useRef, useEffect } from "react";
import YearDropdown from "../common/YearDropdown";
import WeekDropdown from "../common/WeekDropdown";
import ViewToggle from "../common/ViewToggle";
import HoleAveragesTable from "./HoleAveragesTable";
import ScoreDistribution from "./ScoreDistribution";
import AceHallOfFame from "./AceHallOfFame";
import { COMPETITIONS } from "../../constants/competitions";

const AVAILABLE_YEARS = Object.keys(COMPETITIONS).sort().reverse();

function StatisticsContainer() {
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
  let metrixEventId = null;
  if (is2022 && results?.Competition?.Events && weeks[selectedWeek - 1]) {
    metrixEventId = weeks[selectedWeek - 1].ID;
  }

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
              }}
              isOpen={isWeekDropdownOpen}
              setIsOpen={setIsWeekDropdownOpen}
              dropdownRef={weekDropdownRef}
              indexOffset={1}
            />
          </div>
        )}
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                <p className="mt-2 text-gray-600">Laster statistikk...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              Feil ved henting av data: {error}
            </div>
          ) : is2022 ? (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg my-4 text-center">
              <p className="font-semibold">
                Hullstatistikk er ikke tilgjengelig for 2022 pga.
                API-begrensninger.
              </p>
              <p className="mt-2">
                <a
                  href={`https://discgolfmetrix.com/?u=${
                    isUkentlig && metrixEventId
                      ? "score&ID=" + metrixEventId
                      : "tournament&id=" + COMPETITIONS["2022"].id
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Se {isUkentlig ? "ukens resultater" : "konkurransen"} på Disc
                  Golf Metrix
                </a>
              </p>
            </div>
          ) : averages.length === 0 ? (
            <div className="text-center text-gray-600 p-4">
              Ingen data tilgjengelig.
            </div>
          ) : (
            <div className="px-4">
              {results && activeView === "sammenlagt" && (
                <AceHallOfFame results={results} />
              )}

              <ScoreDistribution
                results={results}
                selectedWeek={activeView === "sammenlagt" ? 0 : selectedWeek}
                activeView={activeView}
              />

              <HoleAveragesTable
                averages={averages}
                results={results}
                title={
                  activeView === "sammenlagt"
                    ? "Hull Gjennomsnitt (Alle uker)"
                    : `Hull Gjennomsnitt (Uke ${selectedWeek})`
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticsContainer;
