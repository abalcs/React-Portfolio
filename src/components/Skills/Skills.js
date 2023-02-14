import React, {useRef, useState, useEffect} from 'react';
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
  const myRef = useRef();
  const [visible, setVisible] = useState();

    useEffect(() => {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        setVisible(entry.isIntersecting)
      })
      observer.observe(myRef.current)
    }, [])
    
    return (
      <section className={`${style.skills}`} id='skills' ref={myRef}> 
      {visible && (
        <>
        <h3 className={`${style.skills__h3}`}><strong>TECHNICAL SKILLS</strong></h3>

        <div className={`${style.skills__div}`}>
          <ul className={`${style.list}`}>
            <li className={`${style.list__logo}`}><a href="https://en.wikipedia.org/wiki/HTML" target="_blank" rel="noreferrer"><img src={html} className={`${style.skillIcon}`} alt="html"/></a>HTML</li>
            <li className={`${style.list__logo}`}><a href="https://www.javascript.com" target="_blank" rel="noreferrer"><img src={js} className={`${style.skillIcon}`} alt="js"/></a>JavaScript</li>
            <li className={`${style.list__logo}`}><a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src={ts} className={`${style.skillIcon}`} alt="typscript"/></a>TypeScript</li>
            <li className={`${style.list__logo}`}><a href="https://getbootstrap.com/" target="_blank" rel="noreferrer"><img src={bootstrap} className={`${style.skillIcon}`} alt="bootstrap"/></a>Bootstrap</li>
            <li className={`${style.list__logo}`}><a href="https://mui.com/" target="_blank" rel="noreferrer"><img src={mui} className={`${style.skillIcon}`} alt="material ui"/></a>Material UI</li>
            <li className={`${style.list__logo}`}><a href="https://developer.mozilla.org/en-US/docs/Web/CSS" target="_blank" rel="noreferrer"><img src={css} className={`${style.skillIcon}`} alt="css"/></a>CSS</li>
            <li className={`${style.list__logo}`}><a href="https://git-scm.com/" target="_blank" rel="noreferrer"><img src={git} className={`${style.skillIcon}`} alt="git"/></a>Git</li>
            <li className={`${style.list__logo}`}><a href="https://jquery.com/" target="_blank" rel="noreferrer"><img src={jquery} className={`${style.skillIcon}`} alt="jquery"/></a>jQuery</li>
            <li className={`${style.list__logo}`}><a href="https://www.mongodb.com/cloud/atlas/lp/try2?utm_source=google&utm_campaign=gs_americas_united_states_search_core_brand_atlas_desktop&utm_term=mongodb&utm_medium=cpc_paid_search&utm_ad=e&utm_ad_campaign_id=12212624338&gclid=CjwKCAjwo4mIBhBsEiwAKgzXOHDccwL_lR8Q00vmHOY3fEVJXLKCQigvw8Wax0IG6oBvCNB3g_QD2BoC9o0QAvD_BwE" target="_blank" rel="noreferrer"><img src={mongodb} className={`${style.skillIcon}`} alt="mongodb"/></a>MongoDB</li>
            <li className={`${style.list__logo}`}><a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src={node} className={`${style.skillIcon}`} alt="node"/></a>NodeJS</li>
            <li className={`${style.list__logo}`}><a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src={react} className={`${style.skillIcon}`} alt="react"/></a>React</li>
            <li className={`${style.list__logo}`}><a href="https://en.wikipedia.org/wiki/SQL" target="_blank" rel="noreferrer"><img src={sql} className={`${style.skillIcon}`} alt="sql"/></a>SQL</li>
          </ul>
        </div>
        </>
      )}
      

      </section>
    );
}

export default Skills;