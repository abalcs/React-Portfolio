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
          <li><a href="https://en.wikipedia.org/wiki/HTML" target="_blank" rel="noreferrer"><img src={html} className="skill-icon" alt="html"/></a></li>
          <li><a href="https://www.javascript.com" target="_blank" rel="noreferrer"><img src={js} className="skill-icon js" alt="js"/></a></li>
          <li><a href="https://getbootstrap.com/" target="_blank" rel="noreferrer"><img src={bootstrap} className="skill-icon" alt="bootstrap"/></a></li>
          <li><a href="https://en.wikipedia.org/wiki/CSS" target="_blank" rel="noreferrer"><img src={css} className="skill-icon css" alt="css"/></a></li>
          <li><a href="https://git-scm.com/" target="_blank" rel="noreferrer"><img src={git} className="skill-icon" alt="git"/></a></li>
          <li><a href="https://jquery.com/" target="_blank" rel="noreferrer"><img src={jquery} className="skill-icon" alt="jquery"/></a></li>
          <li><a href="https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_americas_united_states_search_core_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=12212624338&gclid=CjwKCAjwo4mIBhBsEiwAKgzXOHDccwL_lR8Q00vmHOY3fEVJXLKCQigvw8Wax0IG6oBvCNB3g_QD2BoC9o0QAvD_BwE" target="_blank" rel="noreferrer"><img src={mongodb} className="skill-icon" alt="mongodb"/></a></li>
          <li><a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src={node} className="skill-icon" alt="node"/></a></li>
          <li><a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src={react} className="skill-icon" alt="react"/></a></li>
          <li><a href="https://en.wikipedia.org/wiki/SQL" target="_blank" rel="noreferrer"><img src={sql} className="skill-icon sql" alt="sql"/></a></li>
          <li><a href="https://webpack.js.org/" target="_blank" rel="noreferrer"><img src={webpack} className="skill-icon" alt="webpack"/></a></li>
        </ul>
      </div>
      </section>
    );
  }




export default Skills;