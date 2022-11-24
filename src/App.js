import './App.scss';
import React from 'react';

import Hero from '../src/components/Hero/Hero';
import About from './components/About/About';
import Skills from './components/Skills/Skills';
import Projects from './components/Projects/Projects';
import Contact from './components/Contact/Contact';
import Header from './components/Header/Header';

function App() {
  return (
    <div className='App'>
      <Header />
      <Hero/>
      <About/>
      <Skills/>
      <Projects />
      <Contact />
    </div>
  );
}

export default App;
