import React from 'react';
import html from '../assets/images/skills/HTML.png';
import js from '../assets/images/skills/JS.png';
import bootstrap from '../assets/images/skills/bootstrap.png';
import css from '../assets/images/skills/CSS.png';
import git from '../assets/images/skills/git.png';
import jquery from '../assets/images/skills/jquery.png';
import mongodb from '../assets/images/skills/mongodb.png';
import node from '../assets/images/skills/node.png';
import react from '../assets/images/skills/react.png';
import sql from '../assets/images/skills/sql.png';
import webpack from '../assets/images/skills/webpack.png';


function Skills() {
    return (
      <section className="skills"> 
      <h2>Technical Skills</h2>
      <div className="skill-list">
        <ul className="list">
          <li><img src={html} className="skill-icon" alt="html"/></li>
          <li><img src={js} className="skill-icon js" alt="js"/></li>
          <li><img src={bootstrap} className="skill-icon" alt="bootstrap"/></li>
          <li><img src={css} className="skill-icon css" alt="css"/></li>
          <li><img src={git} className="skill-icon" alt="git"/></li>
          <li><img src={jquery} className="skill-icon" alt="jquery"/></li>
          <li><img src={mongodb} className="skill-icon" alt="mongodb"/></li>
          <li><img src={node} className="skill-icon" alt="node"/></li>
          <li><img src={react} className="skill-icon" alt="react"/></li>
          <li><img src={sql} className="skill-icon sql" alt="sql"/></li>
          <li><img src={webpack} className="skill-icon" alt="webpack"/></li>
        </ul>
      </div>
      </section>
    );
  }




export default Skills;