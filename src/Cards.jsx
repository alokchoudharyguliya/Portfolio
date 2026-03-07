import { useLocation } from 'react-router-dom';
import './Cards.css';
import SkillsCard from './Skills';
import { FaBars } from 'react-icons/fa6';
import BlogCard from './Blog';
import EducationCard from './Education';
import ExperienceCard from './Experience';
import OtherCard from './Other';
import MyZoneCard from './MyZone';
import GameZoneCard from './GameZone';
import ContactCard from './Contact';
import { NavLink } from 'react-router-dom';
import ProjectCard from './Projects';
import Profile from './Profile';
const HomeCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/' || location.pathname === '/home';

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ '--clr': ' #00ade1' }}>
        <h2>Intro</h2>
        <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}><FaBars /></NavLink>
      </div>
      <div className="card-content">
        {/* <h3>Hi! I am Alok</h3>
        A passionate Software Developer from India. */}
        <Profile></Profile>
        {/* <h1 class="about-title">OUR TEAM</h1> */}

        {/* <div class="carousel-container">
          <button class="nav-arrow left">‹</button>
          <div class="carousel-track">
            <div class="card" data-index="0">
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=3687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Team Member 1" />
            </div>
            <div class="card" data-index="1">
              <img src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Team Member 2" />
            </div>
            <div class="card" data-index="2">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmVzc2lvbmFsJTIwcGVvcGxlfGVufDB8fDB8fHww" alt="Team Member 3" />
            </div>
            <div class="card" data-index="3">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cHJvZmVzc2lvbmFsJTIwcGVvcGxlfGVufDB8fDB8fHww" alt="Team Member 4" />
            </div>
            <div class="card" data-index="4">
              <img src="https://images.unsplash.com/photo-1655249481446-25d575f1c054?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHByb2Zlc3Npb25hbCUyMHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" alt="Team Member 5" />
            </div>
            <div class="card" data-index="5">
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=3687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Team Member 6" />
            </div>
          </div>
          <button class="nav-arrow right">›</button>
        </div>

        <div class="member-info">
          <h2 class="member-name">David Kim</h2>
          <p class="member-role">Founder</p>
        </div>

        <div class="dots">
          <div class="dot active" data-index="0"></div>
          <div class="dot" data-index="1"></div>
          <div class="dot" data-index="2"></div>
          <div class="dot" data-index="3"></div>
          <div class="dot" data-index="4"></div>
          <div class="dot" data-index="5"></div>
        </div> */}
      </div>
    </div>
  );
};

export { HomeCard, SkillsCard, EducationCard, ExperienceCard, OtherCard, MyZoneCard, GameZoneCard, ProjectCard, BlogCard, ContactCard };