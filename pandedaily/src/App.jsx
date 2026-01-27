import { useState, useEffect } from "react";
import NavigationBar from "./components/layout/navigation/NavigationBar";
import Hero from "./pages/home/Hero";
import Why from "./pages/home/Why";
import Story from "./pages/home/Story";
import CallToAction from "./pages/home/CallToAction";
import Contact from "./pages/home/Contact";
import Footer from "./components/layout/Footer";

function App() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar isScrolled={isScrolled} />
      <main className="flex-1">
        <Hero />
        <Why />
        <Story />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
