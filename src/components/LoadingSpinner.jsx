import React from "react";

function LoadingSpinner({ text = "Laster..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#800000]"></div>
      <p className="mt-3 text-gray-700 font-medium">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
