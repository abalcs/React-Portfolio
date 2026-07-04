import React from 'react';
import Layout from './components/Layout/Layout';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Experience from './components/Experience/Experience';
import Projects from './components/Projects/Projects';
import GitHubStats from './components/GitHubStats/GitHubStats';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import LoadingScreen from './components/UI/LoadingScreen';
import BackToTop from './components/UI/BackToTop';
import ScrollProgress from './components/UI/ScrollProgress';
import AscentApp from './components/AscentApp';
import { useCapabilities } from './hooks/useCapabilities';

// Classic 2D experience — also the fallback when WebGL is unavailable
// (including jsdom in tests) or the user prefers reduced motion.
function ClassicApp() {
  return (
    <Layout>
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <GitHubStats />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </Layout>
  );
}

function App() {
  const { webgl, reducedMotion } = useCapabilities();

  if (!webgl || reducedMotion) {
    return <ClassicApp />;
  }

  return <AscentApp />;
}

export default App;
