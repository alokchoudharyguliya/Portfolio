import React from 'react';
import './Profile.css';
// DrawCard and DrawingGallery moved to the dedicated Draw page

const Profile = () => {
  const [selectedDrawing, setSelectedDrawing] = React.useState(null);
  const currentLearning = [
    'Advanced System Design',
    'Kubernetes & Cloud Native Patterns',
    'Rust for systems programming'
  ];

  const habits = [
    'Daily coding (1-2 hrs)',
    'Read technical articles / books',
    'Short daily exercise or walk'
  ];

  const stats = {
    codingHoursThisWeek: 12,
    openSourceContributions: 24,
    activeProjects: 8,
    learningStreakDays: 56
  };

  const resources = [
    { id: 1, title: 'Designing Data-Intensive Applications', type: 'Book', url: 'https://dataintensive.net/' },
    { id: 2, title: 'Kubernetes Official Docs', type: 'Docs', url: 'https://kubernetes.io/docs/home/' },
    { id: 3, title: 'Rust Book', type: 'Book', url: 'https://doc.rust-lang.org/book/' }
  ];

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

      <section className="current-section">
        <div className="left-col">
          <h2>Currently Learning</h2>
          <ul className="learning-list">
            {currentLearning.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>

          <h2>Habits</h2>
          <ul className="habit-list">
            {habits.map((h, i) => (
              <li key={i}>• {h}</li>
            ))}
          </ul>
        </div>

        <div className="right-col">
          <h2>Stats</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-value">{stats.codingHoursThisWeek}h</div>
              <div className="stat-label">Coding (this week)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.openSourceContributions}</div>
              <div className="stat-label">Open-source contribs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeProjects}</div>
              <div className="stat-label">Active projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.learningStreakDays}d</div>
              <div className="stat-label">Learning streak</div>
            </div>
          </div>

          <h2>Current Resources</h2>
          <div className="resources-section">
            {resources.map((r) => (
              <div key={r.id} className="resource-item">
                <div className="resource-meta">
                  <strong>{r.title}</strong>
                  <div className="resource-type">{r.type}</div>
                </div>
                <a className="resource-btn" href={r.url} target="_blank" rel="noreferrer">Open</a>
              </div>
            ))}
          </div>
          <h2>Sketchpad</h2>
          <div style={{ marginTop: 12 }}>
            <p>Sketchpad moved to the <a href="/draw">Draw</a> page.</p>
          </div>
        </div>
      </section>

      {/* Draw gallery moved to /draw */}
    </div>
  );
};

export default Profile;
