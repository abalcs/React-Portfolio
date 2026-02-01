import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import profileImg from './images/profile.jpg';

export default function About() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section id="about" ref={ref} className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          About Me
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-hover rounded-full opacity-20 blur-2xl" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-accent/30">
                <img
                  src={profileImg}
                  alt="Alan Balcom"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-accent">
              It's Never Too Late To Start
            </h3>

            <p className="text-gray-300 leading-relaxed">
              I'm a web developer living in Andover, Massachusetts. I spend my
              days coding, drinking coffee, and spending time with my wife and
              daughter. My goal is to bring creativity and great user experience
              to the projects I work on.
            </p>

            <p className="text-gray-300 leading-relaxed">
              My main tech stack is React, Express, PostgreSQL, and NodeJS, and
              I have also worked with other tech such as MongoDB, GraphQL, as
              well as many NodeJS and React libraries.
            </p>

            <p className="text-gray-300 leading-relaxed">
              I have worked hard building my skillset and look to learn more
              every day. My work is my passion and I put my heart into every
              project I work on. If you're interested in contacting me, I am
              available for freelance work.
            </p>

            <div className="pt-4">
              <a href="#contact" className="btn-primary inline-block">
                Let's Work Together
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
