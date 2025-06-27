import { useEffect, useState } from "react";

function HoleAveragesTable({ averages, title, results }) {
  const [parValues, setParValues] = useState([]);

  // Extract par values from results
  useEffect(() => {
    if (!results?.Competition?.Tracks || !averages.length) {
      // Fallback to par 3 for each hole if data is missing
      setParValues(Array(averages.length).fill(3));
      return;
    }

    const extractedPars = [];

    // Try to get par values directly from track objects
    for (const track of results.Competition.Tracks) {
      if (track && track.Par) {
        const par = parseInt(track.Par, 10);
        extractedPars.push(isNaN(par) ? 3 : par);
      } else {
        extractedPars.push(3); // Default to 3 if missing
      }
    }

    // If no par values found and Holes structure exists, try that
    if (extractedPars.length === 0 && results.Competition.Tracks[0]?.Holes) {
      const holesParValues = results.Competition.Tracks[0].Holes.map(
        (h) => parseInt(h.Par, 10) || 3
      );
      setParValues(holesParValues);
    } else if (extractedPars.length > 0) {
      setParValues(extractedPars);
    } else {
      // Fallback to all par 3s
      setParValues(Array(averages.length).fill(3));
    }
  }, [results, averages]);

  // Don't render if no averages available
  if (!averages || averages.length === 0) return null;

  // Get background color based on score's relation to par
  function getColorRelativeToPar(score, par) {
    if (score === null || par === null) return "bg-gray-200";
    const relativeToPar = score - par;

    if (relativeToPar < -0.5) return "bg-green-200"; // Well under par
    if (relativeToPar < 0) return "bg-green-100"; // Slightly under par
    if (relativeToPar < 0.5) return "bg-yellow-200"; // At or near par
    if (relativeToPar < 1.5) return "bg-orange-100"; // Slightly over par
    return "bg-red-100"; // Well over par
  }

  // Component to display average score with dynamic styling
  const ScoreDisplay = ({ avg, holeIdx }) => {
    const par = parValues[holeIdx] || 3;
    const bgColor = getColorRelativeToPar(avg, par);

    return (
      <span
        className={`font-mono px-3 py-1 rounded-full text-sm font-bold ${bgColor}`}
      >
        {avg ? avg.toFixed(2) : "-"}
      </span>
    );
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#800000]">
          {title || "Hullgjennomsnitt"}
        </h3>
      </div>

      {/* Desktop/tablet view (table layout) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-2 px-2 text-left text-gray-700 text-lg font-bold align-bottom">
                Hull
              </th>
              {averages.map((_, idx) => (
                <th
                  key={idx}
                  className="py-2 px-2 text-gray-700 font-semibold align-bottom"
                >
                  {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 hover:bg-gray-100 rounded-lg">
              <td className="py-2 px-2 text-left font-bold text-gray-800">
                Snitt
              </td>
              {averages.map((avg, idx) => (
                <td key={idx} className="py-2 px-2 font-mono font-semibold">
                  <ScoreDisplay avg={avg} holeIdx={idx} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile view (responsive grid layout) */}
      <div className="sm:hidden grid grid-cols-3 xs:grid-cols-4 gap-2">
        {averages.map((avg, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2"
          >
            {/* Hole number */}
            <span className="text-xs text-gray-500 mb-1">{idx + 1}</span>
            {/* Average score */}
            <ScoreDisplay avg={avg} holeIdx={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HoleAveragesTable;
