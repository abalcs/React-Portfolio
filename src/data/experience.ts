export interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
  technologies?: string[];
}

export const experiences: Experience[] = [
  {
    id: 1,
    title: 'Web Developer',
    company: 'Freelance',
    location: 'Andover, MA',
    period: '2023 - Present',
    description: [
      'Develop responsive web applications using React, TypeScript, and modern frontend technologies',
      'Build and maintain RESTful APIs with Node.js and Express',
      'Design and implement database solutions using PostgreSQL and MongoDB',
      'Collaborate with clients to gather requirements and deliver custom solutions',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB'],
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'Self-Employed',
    location: 'Remote',
    period: '2022 - 2023',
    description: [
      'Created multiple full-stack web applications from concept to deployment',
      'Implemented user authentication and authorization systems',
      'Integrated third-party APIs and services',
      'Focused on performance optimization and user experience',
    ],
    technologies: ['React', 'Express', 'GraphQL', 'Tailwind CSS'],
  },
  {
    id: 3,
    title: 'Career Transition',
    company: 'Self-Study & Bootcamps',
    location: 'Massachusetts',
    period: '2021 - 2022',
    description: [
      'Completed intensive web development training programs',
      'Built portfolio projects to demonstrate practical skills',
      'Studied computer science fundamentals and software engineering principles',
      'Contributed to open source projects on GitHub',
    ],
    technologies: ['JavaScript', 'HTML', 'CSS', 'Git', 'SQL'],
  },
];
