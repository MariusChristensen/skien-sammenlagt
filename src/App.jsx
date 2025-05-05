import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Results from "./pages/Results";
import Statistics from "./pages/Statistics";
import PlayerSearch from "./pages/PlayerSearch";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<Results />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/player-search" element={<PlayerSearch />} />
      </Routes>
    </div>
  );
}

export default App;
