import React from "react";

function BestRoundScorecard({ round }) {
  if (!round || !round.holes || round.holes.length === 0) return null;

  // Function to determine score color based on par difference
  const getScoreClass = (diff) => {
    if (diff === -3) return "bg-purple-100 text-purple-800"; // Ace or better (should be rare)
    if (diff === -2) return "bg-indigo-100 text-indigo-800"; // Eagle
    if (diff === -1) return "bg-blue-100 text-blue-800"; // Birdie
    if (diff === 0) return "bg-green-100 text-green-800"; // Par
    if (diff === 1) return "bg-yellow-100 text-yellow-800"; // Bogey
    if (diff === 2) return "bg-orange-100 text-orange-800"; // Double bogey
    return "bg-red-100 text-red-800"; // Triple bogey or worse
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-9 sm:grid-cols-18 gap-1">
          {/* Hole numbers row */}
          {round.holes.map((hole, idx) => (
            <div
              key={`hole-${idx}`}
              className="text-center font-semibold bg-gray-100 p-1 text-sm"
            >
              {hole.number}
            </div>
          ))}

          {/* Par values row */}
          {round.holes.map((hole, idx) => (
            <div
              key={`par-${idx}`}
              className="text-center text-gray-600 bg-gray-50 p-1 text-xs"
            >
              Par {hole.par}
            </div>
          ))}

          {/* Score row */}
          {round.holes.map((hole, idx) => (
            <div
              key={`score-${idx}`}
              className={`text-center p-1 font-medium text-sm ${getScoreClass(
                hole.diff
              )}`}
            >
              {hole.result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BestRoundScorecard;
