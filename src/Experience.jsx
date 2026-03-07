import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './Experience.css';

const ExperienceCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/experience';

  const experienceData = [
    {
      id: 1,
      position: "Junior Developer",
      company: "Tech Company XYZ",
      duration: "Jan 2025 - Present",
      description: "Working on full-stack web development projects using React, Node.js, and databases. Contributing to feature development and bug fixes.",
      skills: ["React", "Node.js", "MongoDB", "REST APIs"],
      achievements: [
        "Developed 5+ features used by 1000+ users",
        "Reduced API response time by 40%",
        "Mentored 2 junior developers"
      ]
    },
    {
      id: 2,
      position: "Frontend Intern",
      company: "Startup ABC",
      duration: "Jun 2024 - Dec 2024",
      description: "Built responsive UI components and implemented state management. Collaborated with design team to implement pixel-perfect designs.",
      skills: ["React", "CSS", "JavaScript", "Redux"],
      achievements: [
        "Created 15+ reusable components",
        "Improved website performance by 35%",
        "Completed all projects on schedule"
      ]
    },
    {
      id: 3,
      position: "Open Source Contributor",
      company: "Various Projects",
      duration: "2023 - Present",
      description: "Contributing to open-source projects and building personal projects. Actively engaged in code reviews and documentation.",
      skills: ["Git", "JavaScript", "Python", "Documentation"],
      achievements: [
        "50+ commits across multiple repositories",
        "Merged pull requests in 3 major projects",
        "Active community participant"
      ]
    }
  ];

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ff6b35', '--clr': '#ff6b35' }}>
        <h2>Experience</h2>
        <NavLink
          to="/"
          className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
          onClick={() => setIsNavBarClosed(!isNavBarClosed)}
        >
          <FaBars />
        </NavLink>
      </div>
      <div className='card-body experience-container'>
        {experienceData.map((exp, index) => (
          <div key={exp.id} className={`experience-item ${index % 2 === 0 ? 'left-align' : 'right-align'}`}>
            <div className="experience-header">
              <h3 className="position">{exp.position}</h3>
              <p className="company">{exp.company}</p>
              <p className="duration">{exp.duration}</p>
            </div>
            <div className="experience-content">
              <p className="description">{exp.description}</p>
              
              <div className="skills-section">
                <h4>Skills Used:</h4>
                <div className="skills-tags">
                  {exp.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="achievements-section">
                <h4>Key Achievements:</h4>
                <ul className="achievements-list">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceCard;
