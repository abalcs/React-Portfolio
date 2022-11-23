import React from 'react';
import newMe from './images/newme.jpg'

import style from './about.module.scss';


function About() {
    return (
      <section className={`${style.sub_section}`} id="about-me">
        <div>
            <h2><strong>MY STORY</strong></h2>
            <h3><em>It's never too late to follow your passion.</em></h3>
            <p  className={`${style.sub_section__p}`}>I'm a web developer living in Andover, Massachusetts. I spend my days coding, drinking coffee, and spending time my with my wife and daugher. 
              My goal is to bring creativity and great user experience to the projects I work on.</p>

            <p className={`${style.sub_section__p}`}>My main tech stack is React, Express, PostgreSQL, and NodeJS, though I have also worked with MongoDB, GraphQL, and 
              still enjoy going back to my roots of building applications with HTML, CSS, and vanilla Javascript.</p>

            <p className={`${style.sub_section__p}`}>I have worked hard building my skillset and look to learn more every day. 
              My work is my passion and I put my heart into every project I work on. If you're interested in contacting me
              I am available for freelance work.</p>
        </div>
        <div className={`${style.headshot__container}`}>
            <img className={`${style.headshot}`} src={newMe} alt="Alan Balcom headshot"/>
        </div>
      </section>
    );
  }

export default About;