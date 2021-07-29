import React from 'react';
import logo from '../assets/images/ablogo.png'

function Header() {
    return (
      <div className='header'>
        <nav>
        <img class="logo" src={logo} alt="Alan Balcom's logo"/>
            <ul id="nav-list">
                <li><a href="#about-me">About me</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact-me">Contact</a></li>
                <li><a href="src/Alan Resume.docx" download>Resume</a></li>
            </ul>
            <button class="hamburger" id="hamburger" alt="hamburger menu for small screens">
                <i class="fas fa-bars"></i>
            </button>
        </nav>
      </div>
    );
  }




export default Header;