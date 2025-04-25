import FetchResults from "./components/FetchResults";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Logo Area */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="text-left">
            <h1 className="text-6xl font-black text-black tracking-tighter">
              SKiEN
            </h1>
            <p className="text-md font-medium uppercase tracking-wide">
              FRISBEEKLUBB
            </p>
          </div>
        </div>
      </div>

      <FetchResults />
    </div>
  );
}

export default App;
