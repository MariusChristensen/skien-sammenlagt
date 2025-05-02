import React, { useEffect, useState } from "react";

function getPillColor(avg) {
  if (avg === null || avg === undefined) return "bg-gray-200 text-gray-500";
  if (avg < 3) return "bg-green-200 text-green-900";
  if (avg < 3.5) return "bg-yellow-200 text-yellow-900";
  if (avg < 4.5) return "bg-orange-200 text-orange-900";
  return "bg-red-200 text-red-900";
}

function HoleAveragesTable({ averages }) {
  const [mobileCols, setMobileCols] = useState(6);

  useEffect(() => {
    function handleResize() {
      setMobileCols(window.innerWidth < 375 ? 4 : 6);
    }
    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!averages || averages.length === 0) return null;

  // Helper to split array into chunks
  function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  // Desktop/tablet view: vibrant, pill-style averages, bold Snitt
  return (
    <>
      <div className="hidden sm:block mb-8 overflow-x-auto bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-2 px-2 text-left text-gray-700 text-lg font-bold align-bottom">Hull</th>
              {averages.map((_, idx) => (
                <th key={idx} className="py-2 px-2 text-gray-700 font-semibold align-bottom">
                  {idx + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 hover:bg-gray-100 rounded-lg">
              <td className="py-2 px-2 text-left font-bold text-gray-800">Snitt</td>
              {averages.map((avg, idx) => (
                <td key={idx} className="py-2 px-2 font-mono font-semibold">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getPillColor(avg)}`}
                  >
                    {avg ? avg.toFixed(2) : "-"}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {/* Mobile view: modern card grid, no cell borders, spacing between rows */}
      <div className="sm:hidden mb-8">
        <div className="bg-white rounded-xl shadow-lg p-3 flex flex-col gap-2">
          {chunkArray(averages, mobileCols).map((chunk, rowIdx) => (
            <div className="flex gap-2" key={rowIdx}>
              {chunk.map((avg, idx) => {
                const holeNumber = rowIdx * mobileCols + idx + 1;
                return (
                  <div
                    key={holeNumber}
                    className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg py-2"
                  >
                    <span className="text-xs text-gray-500 mb-1">{holeNumber}</span>
                    <span className={`font-semibold font-mono px-2 py-1 rounded-full text-sm ${getPillColor(avg)}`}>
                      {avg ? avg.toFixed(2) : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default HoleAveragesTable;
