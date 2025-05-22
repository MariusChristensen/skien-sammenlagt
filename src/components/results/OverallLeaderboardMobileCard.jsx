const OverallLeaderboardMobileCard = ({ players, displayWeekCount }) => (
  <div className="space-y-4">
    {players.map((player, index) => (
      <div
        key={player.id}
        className={`border rounded-lg p-3 shadow-sm ${
          index % 2 === 0 ? "bg-white" : "bg-gray-50"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="font-bold text-lg mr-2">{index + 1}</span>
            <span className="font-medium">{player.name}</span>
          </div>
          <div className="bg-gray-100 font-bold text-lg px-3 py-1 rounded">
            {player.totalPoints}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {Array.from({ length: displayWeekCount }).map((_, idx) => {
            const weekInfo =
              idx < player.weeklyPointsInfo.length
                ? player.weeklyPointsInfo[idx]
                : { points: 0, counts: false };
            return (
              <div
                key={idx}
                className={`text-center p-1 border rounded ${
                  weekInfo.points > 0 && !weekInfo.counts
                    ? "bg-red-100"
                    : weekInfo.counts
                    ? "bg-green-50 border-green-200"
                    : ""
                }`}
              >
                <div className="text-xs text-gray-500">Uke {idx + 1}</div>
                <div>{weekInfo.points || "-"}</div>
              </div>
            );
          })}
        </div>
      </div>
    ))}
    {players.length === 0 && (
      <div className="py-4 text-center text-gray-500">
        Ingen resultater tilgjengelig.
      </div>
    )}
  </div>
);

export default OverallLeaderboardMobileCard;
