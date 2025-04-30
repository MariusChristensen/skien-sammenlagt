import React from "react";

const Header = () => {
  return (
    <header className="bg-[#800000] text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl font-black tracking-tighter text-white">
            SKiEN
          </h1>
          <p className="text-md font-medium uppercase tracking-wider text-white/90">
            FRISBEEKLUBB
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
