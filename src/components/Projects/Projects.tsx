import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { projects } from '../../data/projects';

export default function Projects() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.05 });
  const [activeFilter, setActiveFilter] = useState('All');

  // Get unique technologies from all projects
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.technologies.forEach((tech) => techSet.add(tech));
    });
    return ['All', ...Array.from(techSet).sort()];
  }, []);

  // Filter projects based on selected technology
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((project) =>
      project.technologies.includes(activeFilter)
    );
  }, [activeFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="projects" ref={ref} className="py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          Projects
        </motion.h2>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {allTechnologies.map((tech) => (
            <button
              key={tech}
              onClick={() => setActiveFilter(tech)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeFilter === tech
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : 'bg-secondary/80 text-text-secondary hover:bg-secondary hover:text-text-primary border border-secondary'
              }`}
            >
              {tech}
            </button>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card h-full flex flex-col group bg-secondary/80 backdrop-blur-sm border border-secondary hover:border-accent/30">
                  {/* Image container with enhanced styling */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    {/* Image with gradient overlay */}
                    <div className="relative aspect-video">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                        loading="lazy"
                      />
                      {/* Permanent subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
                      {/* Hover overlay with buttons */}
                      <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="flex gap-2 sm:gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-secondary hover:bg-accent text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-accent/25"
                            aria-label={`View ${project.title} code on GitHub`}
                          >
                            <FaGithub size={18} /> Code
                          </a>
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-accent/25"
                            aria-label={`View ${project.title} live demo`}
                          >
                            <FaExternalLinkAlt size={16} /> Demo
                          </a>
                        </div>
                      </div>
                    </div>
                    {/* Accent line at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-text-primary group-hover:text-accent transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-text-secondary text-xs sm:text-sm mb-4 flex-grow leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {project.technologies.slice(0, 4).map((tech, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-colors duration-200 ${
                            activeFilter === tech
                              ? 'bg-accent/20 text-accent border-accent/50'
                              : 'bg-primary/80 text-text-secondary border-secondary hover:border-accent/30'
                          }`}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/80 rounded-full text-accent border border-accent/30">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProjects.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-text-secondary mt-8"
          >
            No projects found with {activeFilter}.
          </motion.p>
        )}
      </div>
    </section>
  );
}
