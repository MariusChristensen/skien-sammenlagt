import { useEffect, useState, useRef } from "react";
import OverallLeaderboard from "./OverallLeaderboard";
import YearDropdown from "./YearDropdown";
import WeekDropdown from "./WeekDropdown";
import ClassSelector from "./ClassSelector";
import ViewToggle from "./ViewToggle";
import WeeklyResults from "./WeeklyResults";
import { COMPETITIONS } from "../constants/competitions";

// Available years (in reverse chronological order)
const AVAILABLE_YEARS = Object.keys(COMPETITIONS).sort().reverse();

const ResultsContainer = () => {
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

  // Get the competition ID and total rounds based on selected year
  const COMPETITION_ID = COMPETITIONS[selectedYear].id;
  const TOTAL_ROUNDS = COMPETITIONS[selectedYear].totalRounds;
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
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false);
      }
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(event.target)) {
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
  if (error) return <p className="text-center py-8 text-red-500">Feil: {error}</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <div>
        {/* Navigation Bar */}
        <div className="bg-white shadow-md rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4">
            {/* Year Selection Dropdown */}
            <YearDropdown
              years={AVAILABLE_YEARS}
              selectedYear={selectedYear}
              onChange={(year) => {
                setSelectedYear(year);
                setIsYearDropdownOpen(false);
              }}
              isOpen={isYearDropdownOpen}
              setIsOpen={(open) => {
                if (open) setIsWeekDropdownOpen(false);
                setIsYearDropdownOpen(open);
              }}
              dropdownRef={yearDropdownRef}
            />

            {/* View Toggle Buttons */}
            <ViewToggle activeView={activeView} onChange={setActiveView} />
          </div>

          {/* Class Selection */}
          {availableClasses.length > 0 && (
            <ClassSelector classes={availableClasses} selectedClass={selectedClass} onChange={setSelectedClass} />
          )}
        </div>

        {/* Conditional Rendering Based on View */}
        {activeView === "overall" ? (
          <OverallLeaderboard
            results={results}
            selectedClass={selectedClass}
            selectedYear={selectedYear}
            totalRounds={TOTAL_ROUNDS}
          />
        ) : (
          <div>
            {/* Week Selection */}
            <div className="mb-4 flex justify-center">
              <WeekDropdown
                weeks={results?.Competition?.SubCompetitions || []}
                selectedWeek={selectedWeek}
                onChange={(idx) => {
                  setSelectedWeek(idx);
                  setIsWeekDropdownOpen(false);
                }}
                isOpen={isWeekDropdownOpen}
                setIsOpen={(open) => {
                  if (open) setIsYearDropdownOpen(false);
                  setIsWeekDropdownOpen(open);
                }}
                dropdownRef={weekDropdownRef}
              />
            </div>

            {/* Weekly Results */}
            <h2 className="text-2xl font-semibold mb-4">Uke {selectedWeek + 1}</h2>
            <WeeklyResults
              results={results}
              selectedWeek={selectedWeek}
              selectedClass={selectedClass}
              isMobileView={isMobileView}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default ResultsContainer;
