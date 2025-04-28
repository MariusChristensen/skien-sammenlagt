import FetchResults from "./components/FetchResults";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FetchResults />
      </main>
    </div>
  );
}

export default App;
