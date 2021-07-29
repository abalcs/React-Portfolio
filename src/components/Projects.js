import React from 'react';
import project1 from '../assets/images/planner.png'
import project2 from '../assets/images/maskeraid.png'
import project3 from '../assets/images/techblog.png'
import project4 from '../assets/images/marvel.png'
// import Project from './project'

function Projects() {
  return (
    <section class="sub-section-alternative" id="projects">
      <h2>Projects</h2>
      <br></br>
        <div class="project-container">
          <article class="project-card">
              <a href="https://abalcs.github.io/Day-Planner/" target="_blank" rel="noreferrer">
              <img class="project-image" src={project1} alt="day planner app"/></a>
              <h3>Day Planner</h3>
              <p class="subtext">Help keep your tasks on track with this workday planner made with HTML, CSS, JavaScript, and Moment.js.</p>
              <hr/>
              <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Day-Planner" target="_blank" rel="noreferrer">Github</a></p>
              <br></br>
              <p class="subtext"><a class="project-link" href="https://abalcs.github.io/Day-Planner/" target="_blank" rel="noreferrer">Deployed App</a></p>
          </article>
          <article class="project-card">
            <a href="https://aqueous-harbor-96616.herokuapp.com/" target="_blank" rel="noreferrer">
            <img class="project-image" src={project2} alt="Masker-Aid Project"/></a>
            <h3>Masker-Aid</h3>
            <p class="subtext">A facemask info app to help users prepare for their visit. Made with JavaScript, Google Places API, Express, Node.js, and MySQL</p>
            <hr/>
            <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Masker-Aid" target="_blank" rel="noreferrer">Github</a></p>
            <br></br>
            <p class="subtext"><a class="project-link" href="https://aqueous-harbor-96616.herokuapp.com/" target="_blank" rel="noreferrer">Deployed App</a></p>
          </article>
          <article class="project-card">
            <a href="https://glacial-badlands-18828.herokuapp.com/" target="_blank" rel="noreferrer">
            <img class="project-image" src={project3} alt="Tech Blog Site"/></a>
            <h3>Tech Blog Site</h3>
            <p class="subtext">A full stack CRUD blog made with the MVC model and Node.js, Handlebars, Express, & Sequelize.</p>
            <hr/>
            <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Tech-Blog" target="_blank" rel="noreferrer">Github</a></p>
            <br></br>
            <p class="subtext"><a class="project-link" href="https://glacial-badlands-18828.herokuapp.com/" target="_blank" rel="noreferrer">Deployed App</a></p>
          </article>
          <article class="project-card">
            <a href="https://abalcs.github.io/Marvel-Archive/" target="_blank" rel="noreferrer">
            <img class="project-image" src={project4} alt="Marvel App"/></a>
            <h3>Marvel Archive</h3>
            <p class="subtext">A Marvel Hero Character Information Hub made with JavaScript, Marvel API, CSS, & HTML</p>
            <hr/>
            <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Marvel-Archive" target="_blank" rel="noreferrer">Github</a></p>
            <br></br>
            <p class="subtext"><a class="project-link" href="https://abalcs.github.io/Marvel-Archive/" target="_blank" rel="noreferrer">Deployed App</a></p>
          </article>
      </div>
    </section>
  );
}

// function Projects() {
//     return (
//         <section class="sub-section-alternative" id="projects">
//           <h2>Projects</h2>
//           <div class="project-container">
//           <Project 
//           href='https://abalcs.github.io/Day-Planner/'
//           imageAlt='day planner image'
//           title="Day Planner"
//           content='Help keep your tasks on track with this workday planner made with'
//           skills='HTML, CSS, JavaScript, and Moment.js.'
//           github="https://github.com/abalcs/Day-Planner"
//           projectLink="https://abalcs.github.io/Day-Planner/"/>
        
//             <article class="project-card">
//                 <a href="https://abalcs.github.io/Day-Planner/" target="_blank">
//                 <img class="project-image" src="src/images/planner.png" alt="day planner image"/></a>
//                 <h3>Day Planner</h3>
//                 <p class="subtext">Help keep your tasks on track with this workday planner made with <span style="color: blue;">HTML, CSS, JavaScript,</span> and <span style="color: blue;">Moment.js.</span></p>
//                 <hr/>
//                 <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Day-Planner" target="_blank">Github</a></p>
//                 <br>
//                 <p class="subtext"><a class="project-link" href="https://abalcs.github.io/Day-Planner/" target="_blank">Deployed App</a></p>
//             </article>
//             <article class="project-card">
//               <a href="https://aqueous-harbor-96616.herokuapp.com/" target="_blank">
//               <img class="project-image" src="src/images/maskeraid.png" alt="Masker-Aid Image"/></a>
//               <h3>Masker-Aid</h3>
//               <p class="subtext">A facemask info app to help users prepare for their visit. Made with <span style="color: blue;">JavaScript, Google Places API, Express, Node.js,</span> and <span style="color: blue;">MySQL</span></p>
//               <hr/>
//               <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Masker-Aid" target="_blank">Github</a></p>
//               <br>
//               <p class="subtext"><a class="project-link" href="https://aqueous-harbor-96616.herokuapp.com/" target="_blank">Deployed App</a></p>
//             </article>
//             <article class="project-card">
//               <a href="https://glacial-badlands-18828.herokuapp.com/" target="_blank">
//               <img class="project-image" src="src/images/techblog.png" alt="Tech Blog Site Image"/></a>
//               <h3>Tech Blog Site</h3>
//               <p class="subtext">A full stack CRUD blog made with the MVC model and<span style="color: blue;">Node.js, Handlebars, Express, & Sequelize.</span></p>
//               <hr/>
//               <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Tech-Blog" target="_blank">Github</a></p>
//               <br>
//               <p class="subtext"><a class="project-link" href="https://glacial-badlands-18828.herokuapp.com/" target="_blank">Deployed App</a></p>
//             </article>
//             <article class="project-card">
//               <a href="https://abalcs.github.io/Marvel-Archive/" target="_blank">
//               <img class="project-image" src="src/images/marvel.png" alt="Marvel Image"/></a>
//               <h3>Marvel Archive</h3>
//               <p class="subtext">A Marvel Hero Character Information Hub made with <span style="color: blue;">JavaScript, Marvel API, CSS, & HTML</span></p>
//               <hr/>
//               <p class="subtext"><a class="project-link" href="https://github.com/abalcs/Marvel-Archive" target="_blank">Github</a></p>
//               <br>
//               <p class="subtext"><a class="project-link" href="https://abalcs.github.io/Marvel-Archive/" target="_blank">Deployed App</a></p>
//             </article>
      
//     </section>
   
//     );
//   }

export default Projects;