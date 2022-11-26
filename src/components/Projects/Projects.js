import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Github from '@mui/icons-material/GitHub';
import WebIcon from '@mui/icons-material/Web';

import {Carousel} from '3d-react-carousal';

import listManager from './images/ListManager.jpg';
import ecfd from './images/ecfd.jpg';
import spacex from './images/spacex.jpg';
import marvel from './images/marvel.png';

import style from './projects.module.scss';

function Projects() {

  let slides = [
    <Card 
      sx={{ maxWidth: 345, height: 500 }}
      style={{ borderRadius: '10px', border: '1px solid black' }}
      >
      <CardHeader
        title="List Manager"
        style={{backgroundColor: "rgb(33, 119, 30)", color: 'white', textAlign: 'center'}}
      />
      <CardMedia
        component="img"
        height="194"
        image={listManager}
        alt="List Manager"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          The classic project! <br></br> I built this CRUD list manager to have an easy way for my family to keep track of the items we need.
        </Typography>
        <br></br>
        <Typography variant="body2" color="text.secondary">
          Tech Used: <em>React, JavaScript, MongoDB, NodeJS, Express</em>
        </Typography>
      </CardContent>
      <CardActions 
      disableSpacing
      style={{ display: 'flex', justifyContent: 'center' }}
      >
        <IconButton 
        aria-label="add to favorites"
        href='https://github.com/abalcs/Grocery_List'
        target='_blank'
        >
          <Github />
        </IconButton>
        <IconButton 
        aria-label="share"
        href='https://family-grocery-app.herokuapp.com/'
        target='_blank'>
          <WebIcon />
        </IconButton>
      </CardActions>
    </Card>,

    <Card 
      sx={{ maxWidth: 345, height: 500 }}
      style={{ borderRadius: '10px', border: '1px solid black' }}
      >
      <CardHeader
        title="ERIE COUNTY FIRE DEPT"
        style={{backgroundColor: "rgb(33, 119, 30)", color: 'white', textAlign: 'center'}}
      />
      <CardMedia
        component="img"
        height="194"
        image={ecfd}
        alt="ECFD Site Template"
        style={{ marginTop: '10px' }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Erie Country, NY Fire District needed a website. This is the template I created and provided to them.
        </Typography>
        <br></br>
        <Typography variant="body2" color="text.secondary">
          Tech Used: <em>React, JavaScript, CSS, Bootstrap, NodeJS, Express</em>
        </Typography>
      </CardContent>
      <CardActions 
      disableSpacing
      style={{ display: 'flex', justifyContent: 'center' }}
      >
        <IconButton 
        aria-label="add to favorites"
        href='https://github.com/abalcs/ecfd'
        target='_blank'
        >
          <Github />
        </IconButton>
        <IconButton 
        aria-label="share"
        href='http://ecfd.herokuapp.com/'
        target='_blank'>
          <WebIcon />
        </IconButton>
      </CardActions>
    </Card>,

    <Card 
      sx={{ maxWidth: 345, height: 500 }}
      style={{ borderRadius: '10px', border: '1px solid black' }}
      >
      <CardHeader
        title="SpaceX Launches"
        style={{backgroundColor: "rgb(33, 119, 30)", color: 'white', textAlign: 'center'}}
      />
      <CardMedia
        component="img"
        height="194"
        image={spacex}
        alt="List Manager"
        style={{ marginTop: '10px' }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Tracks and displays information on SpaceX launches. Uses React for front end, Express, GraphQL, and the SpaceX API.
        </Typography>
        <br></br>
        <Typography variant="body2" color="text.secondary">
          Tech Used: <em>React, JavaScript, NodeJS, Express, GraphQL, SpaceX API</em>
        </Typography>
      </CardContent>
      <CardActions 
      disableSpacing
      style={{ display: 'flex', justifyContent: 'center' }}
      >
        <IconButton 
        aria-label="add to favorites"
        href='https://github.com/abalcs/SpaceX_Launches'
        target='_blank'
        >
          <Github />
        </IconButton>
        <IconButton 
        aria-label="share"
        href='https://github.com/abalcs/SpaceX_Launches'
        target='_blank'>
          <WebIcon />
        </IconButton>
      </CardActions>
    </Card>,

    <Card 
      sx={{ maxWidth: 345, height: 500 }}
      style={{ borderRadius: '10px', border: '1px solid black' }}
      >
      <CardHeader
        title="MARVEL ARCHIVE"
        style={{backgroundColor: "rgb(33, 119, 30)", color: 'white', textAlign: 'center'}}
      />
      <CardMedia
        component="img"
        height="194"
        image={marvel}
        alt="List Manager"
        style={{ marginTop: '10px' }}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          A fun project that uses the Marvel API to show background, history, media and comic book appearances of the
          most popular heros in the Marvel universe. 
        </Typography>
        <br></br>
        <Typography variant="body2" color="text.secondary">
          Tech Used: <em>JavaScript, Marvel API, CSS, & HTML</em>
        </Typography>
      </CardContent>
      <CardActions 
      disableSpacing
      style={{ display: 'flex', justifyContent: 'center' }}
      >
        <IconButton 
        aria-label="add to favorites"
        href='https://github.com/abalcs/Marvel-Archive'
        target='_blank'
        >
          <Github />
        </IconButton>
        <IconButton 
        aria-label="share"
        href='https://abalcs.github.io/Marvel-Archive/'
        target='_blank'>
          <WebIcon />
        </IconButton>
      </CardActions>
    </Card>,
  ]

  const callback = function(index){
    console.log("callback",index);
  }

  return (
    <div id='projects' className={`${style.projects}`}>
      <h3 style={{ textAlign: 'center'}}><strong>PROJECTS</strong></h3>
      <br></br>
      <Carousel slides={slides} autoplay={true} interval={8000} onSlideChange={callback}/>
    </div>
  );
}

export default Projects;