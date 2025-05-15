import React from "react";

function PlayerList({ isVisible, players, onSelectPlayer }) {
  if (!isVisible) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {players.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Ingen spillere funnet
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {players.map((player, idx) => (
            <li
              key={idx}
              className="p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectPlayer(player)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{player.name}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {player.years.map((year) => (
                    <span
                      key={year}
                      className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {year}
                    </span>
                  ))}
                </div>
                {player.altNames.length > 1 && (
                  <span className="text-xs text-gray-500 mt-1">
                    Også kjent som:{" "}
                    {player.altNames
                      .filter((name) => name !== player.name)
                      .join(", ")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerList;
