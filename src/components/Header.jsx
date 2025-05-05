import React from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  const linkClass = (path) =>
    `px-3 py-2 rounded hover:bg-white hover:text-[#800000] transition ${
      location.pathname === path ? "bg-white text-[#800000] font-bold" : ""
    }`;

  return (
    <header className="bg-[#800000] text-white shadow-lg mb-6">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-none">
            SKiEN
          </h1>
          <p className="text-md font-medium uppercase tracking-wider text-white/90">
            FRISBEEKLUBB
          </p>
        </div>
        <nav className="flex gap-2 mt-4 sm:mt-0 self-center sm:self-auto justify-center">
          <Link to="/" className={linkClass("/")}>
            Resultater
          </Link>
          <Link to="/statistics" className={linkClass("/statistics")}>
            Statistikk
          </Link>
          <Link to="/player-search" className={linkClass("/player-search")}>
            Spillersøk
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
