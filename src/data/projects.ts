import { Project } from '../types';

import gth from '../components/Projects/images/gth.jpg';
import crypto from '../components/Projects/images/crypto.jpg';
import spacex from '../components/Projects/images/spacex.jpg';
import weather from '../components/Projects/images/weather.jpg';
import sleeper from '../components/Projects/images/sleeper.jpg';
import ecfd from '../components/Projects/images/ecfd.jpg';

export const projects: Project[] = [
  {
    id: 1,
    title: 'Global Travel Hub',
    description:
      'A modern analytics dashboard for travel agent performance metrics with data visualization, team comparisons, trend analysis, and PowerPoint export.',
    image: gth,
    githubUrl: 'https://github.com/abalcs/Global-Travel-Hub',
    liveUrl: 'https://abalcs.github.io/Global-Travel-Hub/',
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Vite'],
  },
  {
    id: 2,
    title: 'Crypto Dash',
    description:
      'A one-stop dashboard showing the top 100 crypto coins by market cap with a scrolling carousel of the latest trending coins.',
    image: crypto,
    githubUrl: 'https://github.com/abalcs/Crypto_Dashboard',
    liveUrl: 'https://abalcs.github.io/Crypto_Dashboard/',
    technologies: ['React', 'JavaScript', 'CSS', 'CoinGecko API'],
  },
  {
    id: 3,
    title: 'SpaceX Launches',
    description:
      'Tracks and displays information on SpaceX launches using React, Express, GraphQL, and the SpaceX API.',
    image: spacex,
    githubUrl: 'https://github.com/abalcs/SpaceX_Launches',
    liveUrl: 'https://serene-hollows-53834.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'NodeJS', 'Express', 'GraphQL'],
  },
  {
    id: 4,
    title: 'Weather Dashboard',
    description:
      'A weather dashboard using the OpenWeather API to display current conditions and 5-day forecasts for any city worldwide.',
    image: weather,
    githubUrl: 'https://github.com/abalcs/Weather-Dashboard',
    liveUrl: 'https://abalcs.github.io/Weather-Dashboard/',
    technologies: ['JavaScript', 'HTML', 'CSS', 'OpenWeather API'],
  },
  {
    id: 5,
    title: 'Sleeper App',
    description:
      'A full-stack fantasy football dashboard that integrates with the Sleeper API to provide league standings, weekly challenges, recaps, and position totals.',
    image: sleeper,
    githubUrl: 'https://github.com/abalcs/sleeper-app',
    liveUrl: '',
    technologies: ['React', 'JavaScript', 'Express', 'MongoDB', 'Sleeper API'],
  },
  {
    id: 6,
    title: 'Erie County Fire Dept',
    description:
      'A website template created for the Erie County, NY Fire District to establish their web presence.',
    image: ecfd,
    githubUrl: 'https://github.com/abalcs/ecfd',
    liveUrl: 'https://ecfd.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'CSS', 'Bootstrap', 'NodeJS'],
  },
];
