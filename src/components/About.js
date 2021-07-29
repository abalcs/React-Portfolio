import React from 'react';
import newMe from '../assets/images/newme.jpg'


function About() {
    return (
      <section className="sub-section" id="about-me">
      <div class="information">
          <h2>About Me</h2>
          <p>Hi! I'm Alan. I am highly-motivated, self-driven, hard-working, and a fast learner that is constantly seeking to improve my technical skillset. I work with the latest Front-end Development tools (and some Back-End tools too!).</p>
          <p>I am motivated by the creative aspects of the development process and the ability turn almost <em>any</em> inspiring idea into something real. I mean how cool is that?</p>
      </div>
      <div class="headshot-container">
          <img class="headshot" src={newMe} alt="Alan Balcom headshot"/>
      </div>
      </section>
    );
  }




export default About;