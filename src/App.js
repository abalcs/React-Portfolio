import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import React from 'react';

import Header from './components/Header';
import Navigation from './components/Navigation';
import Project from './components/Project';
import Footer from './components/Footer';

function App() {
  return (
    <div className='App'>
      <Header/>
      <Navigation/>
      <Project/>
      <Footer/>
    </div>
  );
}

export default App;
