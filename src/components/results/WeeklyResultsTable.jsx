import { getHoleBgColor } from "../../utils/helpers";

const WeeklyResultsTable = ({ players, className, selectedWeek }) => (
  <div className="overflow-x-auto">
    <table className="border-collapse w-full">
      <thead>
        <tr>
          <th className="border border-gray-400 px-4 py-2 text-center">
            Plass
          </th>
          <th className="border border-gray-400 px-4 py-2 text-left">
            Spiller
          </th>
          {Array.from({ length: 18 }).map((_, index) => (
            <th
              key={index}
              className="border border-gray-400 px-1 py-1 text-center font-medium"
            >
              {index + 1}
            </th>
          ))}
          <th className="border border-gray-400 px-4 py-2 text-center">+/-</th>
          <th className="border border-gray-400 px-4 py-2 text-center">
            Totalt
          </th>
        </tr>
      </thead>
      <tbody>
        {players.length > 0 ? (
          players.map((player) => {
            const holeResults = player.PlayerResults
              ? [...player.PlayerResults]
              : [];
            return (
              <tr key={player.UserID}>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {player.Place}
                </td>
                <td className="border border-gray-400 px-4 py-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                  {player.Name}
                </td>
                {Array.from({ length: 18 }).map((_, index) => {
                  const holeData = holeResults[index];
                  const score = holeData?.Result;
                  const diff = holeData?.Diff;
                  const numericDiff =
                    diff !== undefined ? Number(diff) : undefined;
                  const numericScore =
                    score !== undefined ? Number(score) : undefined;
                  const bgColor = getHoleBgColor(numericDiff, numericScore);
                  return (
                    <td
                      key={index}
                      className={`border border-gray-400 px-2 py-1 text-center ${bgColor}`}
                    >
                      {score !== undefined ? score : "-"}
                    </td>
                  );
                })}
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {player.Diff}
                </td>
                <td className="border border-gray-400 px-4 py-2 text-center">
                  {player.Sum}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td
              colSpan="22"
              className="border border-gray-400 px-4 py-2 text-center"
            >
              Ingen resultater tilgjengelig for {className} i uke{" "}
              {selectedWeek + 1}.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default WeeklyResultsTable;
