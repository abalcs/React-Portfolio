import React from 'react';
import html from './images/HTML.png';
import js from './images/JS.png';
import bootstrap from './images/bootstrap.png';
import css from './images/CSS.png';
import git from './images/git.png';
import jquery from './images/jquery.png';
import mongodb from './images/mongodb.png';
import node from './images/node.png';
import react from './images/react.png';
import sql from './images/sql.png';
import ts from './images/Typescript.png';
import mui from './images/mui.png'

import style from './skill.module.scss';

function Skills() {
    return (
      <section className={`${style.skills}`}> 

      <h2><strong>TECHNICAL SKILLS</strong></h2>

      <div >
        <ul className={`${style.list}`}>
          <li><a href="https://en.wikipedia.org/wiki/HTML" target="_blank" rel="noreferrer"><img src={html} className={`${style.skillIcon}`} alt="html"/></a></li>
          <li><a href="https://www.javascript.com" target="_blank" rel="noreferrer"><img src={js} className={`${style.skillIcon}`} alt="js"/></a></li>
          <li><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src={ts} className={`${style.skillIcon}`} alt="typscript"/></a></li>
          <li><a href="https://getbootstrap.com/" target="_blank" rel="noreferrer"><img src={bootstrap} className={`${style.skillIcon}`} alt="bootstrap"/></a></li>
          <li><a href="https://mui.com/" target="_blank" rel="noreferrer"><img src={mui} className={`${style.skillIcon}`} alt="material ui"/></a></li>
          <li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer"><img src={css} className={`${style.skillIcon}`} alt="css"/></a></li>
          <li><a href="https://git-scm.com/" target="_blank" rel="noreferrer"><img src={git} className={`${style.skillIcon}`} alt="git"/></a></li>
          <li><a href="https://jquery.com/" target="_blank" rel="noreferrer"><img src={jquery} className={`${style.skillIcon}`} alt="jquery"/></a></li>
          <li><a href="https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_americas_united_states_search_core_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=12212624338&gclid=CjwKCAjwo4mIBhBsEiwAKgzXOHDccwL_lR8Q00vmHOY3fEVJXLKCQigvw8Wax0IG6oBvCNB3g_QD2BoC9o0QAvD_BwE" target="_blank" rel="noreferrer"><img src={mongodb} className={`${style.skillIcon}`} alt="mongodb"/></a></li>
          <li><a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src={node} className={`${style.skillIcon}`} alt="node"/></a></li>
          <li><a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src={react} className={`${style.skillIcon}`} alt="react"/></a></li>
          <li><a href="https://en.wikipedia.org/wiki/SQL" target="_blank" rel="noreferrer"><img src={sql} className={`${style.skillIcon}`} alt="sql"/></a></li>
        </ul>
      </div>

      </section>
    );
}

export default Skills;