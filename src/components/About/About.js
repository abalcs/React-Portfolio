import React, {useRef, useState, useEffect} from 'react';
import meNoBg from './images/meNoBG.png'
import bg from './images/bg.jpg'


import style from './about.module.scss';


function About() {
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
    <section className={`${style.sub_section}`} id="about-me" ref={myRef}>
    {visible && (
      <>
      <div className={`${style.sub_section__div}`} >
          
        <h3 className={`${style.sub_section__h3}`}><strong>IT'S NEVER TOO LATE TO START.</strong></h3>
        <p  className={`${style.sub_section__p}`}>I'm a web developer living in Andover, Massachusetts. I spend my days coding, drinking coffee, and spending time my with my wife and daugher. 
          My goal is to bring creativity and great user experience to the projects I work on.</p>

        <p className={`${style.sub_section__p}`}>My main tech stack is React, Express, PostgreSQL, and NodeJS, and I have also worked with other
          tech such as MongoDB, GraphQL, as well as many NodeJS and React libraries. 
        </p>

        <p className={`${style.sub_section__p}`}>I have worked hard building my skillset and look to learn more every day. 
          My work is my passion and I put my heart into every project I work on. If you're interested in contacting me
          I am available for freelance work.</p>
            
      </div>
      <div className={`${style.container}`}>
        <div className={`${style.background__container}`}>
            <img className={`${style.background}`} src={bg} alt="Alan Balcom headshot"/>
            <img className={`${style.background__me}`} src={meNoBg} alt="Alan Balcom headshot"/>
        </div>
      </div>
      
      </>
      )}
    </section>
  );
}

export default About;