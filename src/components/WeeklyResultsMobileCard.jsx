import React from "react";

const WeeklyResultsMobileCard = ({ players, className, selectedWeek }) => (
  <div className="space-y-4 max-w-xl mx-auto">
    {players.length > 0 ? (
      players.map((player, idx) => {
        const holeResults = player.PlayerResults
          ? [...player.PlayerResults]
          : [];
        return (
          <div
            key={player.UserID}
            className={`border rounded-lg p-3 shadow-sm ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="font-bold text-lg mr-2">{player.Place}</span>
                <span className="font-medium truncate max-w-[120px]">
                  {player.Name}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="bg-gray-100 font-bold text-lg px-3 py-1 rounded mb-1">
                  {player.Sum}
                </span>
                <span className="text-xs text-gray-500">+/- {player.Diff}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-1">
                {/* First row: holes 1-9 */}
                <div className="flex space-x-1 min-w-0">
                  {Array.from({ length: 9 }).map((_, hIdx) => {
                    const holeData = holeResults[hIdx];
                    const score = holeData?.Result;
                    const diff = holeData?.Diff;
                    let bgColor = "";
                    if (diff !== undefined) {
                      if (diff < 0) bgColor = "bg-green-200";
                      else if (diff === 1) bgColor = "bg-red-100";
                      else if (diff === 2) bgColor = "bg-red-300";
                      else if (diff >= 3) bgColor = "bg-red-500";
                      if (score === "1") bgColor = "bg-yellow-300";
                    }
                    return (
                      <div
                        key={hIdx}
                        className={`flex-1 aspect-square flex flex-col items-center justify-center border rounded min-w-0 ${bgColor}`}
                      >
                        <span className="text-xs text-gray-500">
                          {hIdx + 1}
                        </span>
                        <span className="font-semibold">
                          {score !== undefined ? score : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Second row: holes 10-18 */}
                <div className="flex space-x-1 min-w-0">
                  {Array.from({ length: 9 }).map((_, hIdx) => {
                    const holeIndex = hIdx + 9;
                    const holeData = holeResults[holeIndex];
                    const score = holeData?.Result;
                    const diff = holeData?.Diff;
                    let bgColor = "";
                    if (diff !== undefined) {
                      if (diff < 0) bgColor = "bg-green-200";
                      else if (diff === 1) bgColor = "bg-red-100";
                      else if (diff === 2) bgColor = "bg-red-300";
                      else if (diff >= 3) bgColor = "bg-red-500";
                      if (score === "1") bgColor = "bg-yellow-300";
                    }
                    return (
                      <div
                        key={holeIndex}
                        className={`flex-1 aspect-square flex flex-col items-center justify-center border rounded min-w-0 ${bgColor}`}
                      >
                        <span className="text-xs text-gray-500">
                          {holeIndex + 1}
                        </span>
                        <span className="font-semibold">
                          {score !== undefined ? score : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <div className="py-4 text-center text-gray-500">
        Ingen resultater tilgjengelig for {className} i uke {selectedWeek + 1}.
      </div>
    )}
  </div>
);

export default WeeklyResultsMobileCard;
