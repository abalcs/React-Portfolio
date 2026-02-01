import { Project } from '../types';

import ecfd from '../components/Projects/images/ecfd.jpg';
import spacex from '../components/Projects/images/spacex.jpg';
import marvel from '../components/Projects/images/marvel.png';
import crypto from '../components/Projects/images/crypto.png';
import weather from '../components/Projects/images/weather.png';

export const projects: Project[] = [
  {
    id: 1,
    title: 'Crypto Dash',
    description:
      'A one-stop dashboard showing the top 100 crypto coins by market cap with a scrolling carousel of the latest trending coins.',
    image: crypto,
    githubUrl: 'https://github.com/abalcs/Crypto_Dashboard',
    liveUrl: 'https://abalcs.github.io/Crypto_Dashboard/',
    technologies: ['React', 'JavaScript', 'CSS', 'CoinGecko API'],
  },
  {
    id: 2,
    title: 'SpaceX Launches',
    description:
      'Tracks and displays information on SpaceX launches using React, Express, GraphQL, and the SpaceX API.',
    image: spacex,
    githubUrl: 'https://github.com/abalcs/SpaceX_Launches',
    liveUrl: 'https://serene-hollows-53834.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'NodeJS', 'Express', 'GraphQL'],
  },
  {
    id: 3,
    title: 'Weather Dashboard',
    description:
      'A weather dashboard using the OpenWeather API to display current conditions and 5-day forecasts for any city worldwide.',
    image: weather,
    githubUrl: 'https://github.com/abalcs/Weather-Dashboard',
    liveUrl: 'https://abalcs.github.io/Weather-Dashboard/',
    technologies: ['JavaScript', 'HTML', 'CSS', 'OpenWeather API'],
  },
  {
    id: 4,
    title: 'Marvel Archive',
    description:
      'A fun project that uses the Marvel API to show background, history, media and comic book appearances of popular Marvel heroes.',
    image: marvel,
    githubUrl: 'https://github.com/abalcs/Marvel-Archive',
    liveUrl: 'https://abalcs.github.io/Marvel-Archive/',
    technologies: ['JavaScript', 'Marvel API', 'CSS', 'HTML'],
  },
  {
    id: 5,
    title: 'Erie County Fire Dept',
    description:
      'A website template created for the Erie County, NY Fire District to establish their web presence.',
    image: ecfd,
    githubUrl: 'https://github.com/abalcs/ecfd',
    liveUrl: 'https://ecfd.herokuapp.com/',
    technologies: ['React', 'JavaScript', 'CSS', 'Bootstrap', 'NodeJS'],
  },
];
