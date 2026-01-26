import NavigationBar from "./components/layout/navigation/NavigationBar";
import Hero from "./pages/home/Hero";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar />
      <main className="flex-1">
        <Hero />
      </main>
    </div>
  );
}

export default App;
