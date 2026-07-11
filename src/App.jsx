import Navbar from "./components/Navbar";
import ParticlesBackground from "./components/ParticlesBackground";
import CustomCursor from "./components/CustomCursor";
import About from "./sections/About";
// import Experience from "./sections/Experience";
import Footer from "./sections/Footer";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import Home from "./sections/Home";
import React from "react";
import IntroAnimation from "./components/IntroAnimation";
import { useEffect } from "react";


export default function App() {
  const [introDone, setIntroDone] = React.useState(false);

 useEffect(() => {
    if (!introDone) return;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 100);
  }, [introDone]);


  return (
    <div className="bg-black">
    {!introDone && <IntroAnimation onFinish={() => setIntroDone(true)} />}
      

      {introDone && (


    <div className="relative gradient text-white">
      <CustomCursor />
      <ParticlesBackground />
      <Navbar />
      <Home />
      <About />
      <Skills />
      <Projects />
      {/* <Experience /> */}
      <Contact />
      <Footer />

    </div>
    )}
    </div>

  )
}