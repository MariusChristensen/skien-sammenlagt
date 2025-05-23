const WeeklyResultsMobileCard = ({ players, className, selectedWeek }) => (
  <div className="space-y-4 max-w-xl mx-auto px-2">
    {players.length > 0 ? (
      players.map((player, idx) => {
        const holeResults = player.PlayerResults
          ? [...player.PlayerResults]
          : [];
        return (
          <div
            key={player.UserID}
            className={`border rounded-lg p-2 shadow-sm ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center min-w-0">
                <span className="font-bold text-base mr-1">{player.Place}</span>
                <span className="font-medium truncate text-sm">
                  {player.Name}
                </span>
              </div>
              <div className="flex flex-col items-center shrink-0 ml-2">
                <span className="bg-gray-100 font-bold text-base px-2 py-0.5 rounded mb-0.5">
                  {player.Sum}
                </span>
                <span
                  className={`relative-score-pill text-xs font-bold px-2 py-0.5 rounded
                    ${
                      player.Diff > 0
                        ? "bg-red-500 text-white"
                        : player.Diff < 0
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-800"
                    }
                  `}
                >
                  {player.Diff > 0 ? `+${player.Diff}` : player.Diff}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-1">
                {/* First row: holes 1-9 */}
                <div className="flex gap-0.5 min-w-0">
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
                        className={`w-[10%] min-w-[24px] aspect-square flex flex-col items-center justify-center border rounded ${bgColor}`}
                      >
                        <span className="text-[10px] text-gray-500">
                          {hIdx + 1}
                        </span>
                        <span className="text-xs font-semibold">
                          {score !== undefined ? score : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Second row: holes 10-18 */}
                <div className="flex gap-0.5 min-w-0">
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
                        className={`w-[10%] min-w-[24px] aspect-square flex flex-col items-center justify-center border rounded ${bgColor}`}
                      >
                        <span className="text-[10px] text-gray-500">
                          {holeIndex + 1}
                        </span>
                        <span className="text-xs font-semibold">
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
