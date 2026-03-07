import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>
          Hi <span role="img" aria-label="wave">👋</span>, I'm Alok
        </h1>
        <div className="badges tech-icons" >
          <span className="badge">Open Source Contributor</span>
          <span className="badge">Full Stack Developer</span>
        </div>
      </header>

      <section className="about-section">
        <h2>About Me</h2>
        <ul className="about-list">
          <li>🔭 I'm currently working on exciting projects in web and mobile development</li>
          <li>🌱 Learning advanced cloud technologies and system design</li>
          <li>👯 Looking to collaborate on open-source projects</li>
          <li>💬 Ask me about full-stack development, DevOps, or tech in general</li>
          <li>📫 How to reach me: <a href="mailto:waynerooney0089@gmail.com">waynerooney0089@gmail.com</a></li>
          <li>😄 Pronouns: He/Him</li>
        </ul>
      </section>
    </div>
  );
};

export default Profile;
