import React from "react";

const OverallLeaderboardTable = ({
  players,
  displayWeekCount,
  actualWeekCount,
}) => (
  <div className="relative overflow-x-auto border border-gray-300 rounded-lg shadow">
    <table className="w-full border-collapse">
      <thead className="bg-gray-50 sticky top-0">
        <tr>
          <th className="py-3 px-4 text-center font-semibold text-gray-700 w-16 border-r border-gray-300 sticky left-0 bg-gray-50 z-20">
            Plass
          </th>
          <th className="py-3 px-4 text-left font-semibold text-gray-700 w-52 border-r border-gray-300 sticky left-16 bg-gray-50 z-20">
            Spiller
          </th>
          {Array.from({ length: displayWeekCount }).map((_, index) => (
            <th
              key={index}
              className={`py-3 px-2 text-center font-semibold text-gray-700 min-w-[50px] border-r border-gray-300 ${
                index < actualWeekCount ? "" : "bg-gray-50 text-gray-400"
              }`}
            >
              {index + 1}
            </th>
          ))}
          <th className="py-3 px-4 text-center font-semibold text-gray-700 min-w-[100px] bg-gray-100 sticky right-0 z-10 border-l border-gray-300">
            Totalt
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {players.length > 0 ? (
          players.map((player, index) => (
            <tr
              key={player.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td
                className="py-3 px-4 text-center border-r border-gray-300 sticky left-0 z-10"
                style={{
                  backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                }}
              >
                {index + 1}
              </td>
              <td
                className="py-3 px-4 text-left whitespace-nowrap overflow-hidden text-ellipsis border-r border-gray-300 sticky left-16 z-10"
                style={{
                  backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                }}
              >
                {player.name}
              </td>
              {Array.from({ length: displayWeekCount }).map((_, idx) => {
                const info =
                  idx < player.weeklyPointsInfo.length
                    ? player.weeklyPointsInfo[idx]
                    : { points: 0, counts: false };
                return (
                  <td
                    key={idx}
                    className={`py-3 px-2 text-center border-r border-gray-300 ${
                      info.points > 0 && !info.counts
                        ? "bg-red-100"
                        : info.counts
                        ? "bg-green-50"
                        : idx >= actualWeekCount
                        ? "text-gray-300"
                        : ""
                    }`}
                  >
                    {idx < actualWeekCount ? info.points || "-" : "-"}
                  </td>
                );
              })}
              <td className="py-3 px-4 text-center font-bold bg-gray-100 sticky right-0 z-10 border-l border-gray-300">
                {player.totalPoints}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={displayWeekCount + 3}
              className="py-4 px-4 text-center text-gray-500"
            >
              Ingen resultater tilgjengelig.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default OverallLeaderboardTable;
