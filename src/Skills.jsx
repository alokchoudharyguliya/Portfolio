import './Skills.css';
import { useState, useEffect, useRef } from 'react';
import { FaStar, FaBars, FaExternalLinkAlt, FaUpload } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const truncate = (str, maxLen) => {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
};
const SkillsCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/skills';
  
  // Sample skills data - replace with your actual skills
  const skills = [
    {
      id: 1,
      name: 'Backend',
      image: 'https://th.bing.com/th/id/R.f81a6f373c244b1f70f4b7402b5ab372?rik=rbXh4ieLuKt%2bmA&riu=http%3a%2f%2flogos-download.com%2fwp-content%2fuploads%2f2016%2f09%2fReact_logo_logotype_emblem.png&ehk=QhGOkKcUKCU7FBQgHOajOiJqJBACUTD2Ni6LsfqzCEA%3d&risl=&pid=ImgRaw&r=0',
      certificateLink: 'https://example.com/certificate1',
      proficiency: 4, // out of 5
      description: 'Building interactive UIs with React hooks and context API',
      yearsExperience: 2,
      projectsUsed: 10
    },
    {
      id: 2,
      name: 'Frontend',
      image: 'https://media.geeksforgeeks.org/wp-content/uploads/20190906180444/How-to-Become-a-JavaScript-Developer.png',
      certificateLink: 'https://example.com/certificate2',
      proficiency: 4,
      description: 'Modern ES6+ JavaScript with functional programming',
      yearsExperience: 4,
      projectsUsed: 25
    },
    {
      id: 3,
      name: 'ML/DL',
      image: 'https://storage.googleapis.com/portfolio-pseudophoenix/10310009.png',
      certificateLink: 'https://example.com/certificate2',
      proficiency: 3,
      description: 'Modern ES6+ JavaScript with functional programming',
      yearsExperience: 4,
      projectsUsed: 25
    },
    {
      id: 4,
      name: '',
      image: 'https://contentstatic.techgig.com/photo/82905582/5-must-have-python-developer-skills-to-be-successful.jpg?91397',
      certificateLink: 'https://example.com/certificate2',
      proficiency: 4.5,
      description: 'Modern ES6+ JavaScript with functional programming',
      yearsExperience: 4,
      projectsUsed: 25
    },
    {
      id: 5,
      name: 'DevOps',
      image: 'https://storage.googleapis.com/portfolio-pseudophoenix/2648921.jpg',
      certificateLink: 'https://example.com/certificate2',
      proficiency: 4.25,
      description: 'Modern ES6+ JavaScript with functional programming',
      yearsExperience: 2,
      projectsUsed: 25
    }
    // Add more skills as needed
  ];

  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [skillsState, setSkillsState] = useState(skills);

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ff4443', '--clr': '#ff4443' }}>
        <h2>Skills</h2>
        <NavLink
          to="/"
          className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
          onClick={() => setIsNavBarClosed(!isNavBarClosed)}
        >
          <FaBars />
        </NavLink>
      </div>

      <div className='card-body skills-container skills-grid'>
        {skillsState.map((skill) => (
          <div
            key={skill.id}
            className={`skill-wrapper ${hoveredSkill === skill.id ? 'skill-hovered' : ''}`}
            onMouseEnter={() => setHoveredSkill(skill.id)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <SkillCard
              skill={skill}
              isEditing={editIndex === skill.id}
              onSave={(updatedSkill) => {
                setSkillsState(skillsState.map((s) => s.id === skill.id ? { ...updatedSkill, id: skill.id } : s));
                setEditIndex(null);
              }}
              onCancel={() => setEditIndex(null)}
              onEditClick={() => setEditIndex(skill.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Unified SkillCard - handles both view and edit mode in-place
const SkillCard = ({ skill, isEditing, onSave, onCancel, onEditClick }) => {
  const [form, setForm] = useState({ ...skill });
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setForm({ ...skill });
  }, [skill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setForm((prev) => ({ ...prev, image: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const proficiency = isEditing ? form.proficiency : skill.proficiency;

  return (
    <form
      className={`skill-card ${isVisible ? 'visible' : ''}`}
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
    >
      {/* Image + Name side by side */}
      <div className="skill-header-row">
        <div className="skill-image-container">
          <img src={isEditing ? form.image : skill.image} alt={skill.name} className="skill-image" />
          {isEditing && (
            <div className="skill-image-overlay" onClick={() => fileInputRef.current.click()}>
              <FaUpload size={20} style={{ color: '#fff' }} />
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Skill Name"
            className="skill-name skill-inline-input"
            required
          />
        ) : (
          <h3 className="skill-name">{truncate(skill.name, 20)}</h3>
        )}
      </div>

      {/* Description */}
      {isEditing ? (
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="skill-description skill-inline-input"
          rows={2}
        />
      ) : (
        <p className="skill-description">{truncate(skill.description, 80)}</p>
      )}

      {/* Meta: years / projects */}
      <div className="skill-meta">
        {isEditing ? (
          <>
            <input
              type="number"
              name="yearsExperience"
              value={form.yearsExperience}
              onChange={handleChange}
              min={0}
              className="skill-meta-item skill-inline-input skill-meta-input"
              placeholder="Yrs"
            />
            <input
              type="number"
              name="projectsUsed"
              value={form.projectsUsed}
              onChange={handleChange}
              min={0}
              className="skill-meta-item skill-inline-input skill-meta-input"
              placeholder="Projects"
            />
          </>
        ) : (
          <>
            <span className="skill-meta-item">
              <strong>{skill.yearsExperience}</strong> yr{skill.yearsExperience > 1 ? 's' : ''}
            </span>
            <span className="skill-meta-item">
              <strong>{skill.projectsUsed}</strong> project{skill.projectsUsed > 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {/* Stars */}
      <div className="skill-stars">
        {[...Array(5)].map((_, i) => (
          <FaStar
            size={16}
            key={i}
            className={i < proficiency ? 'star-filled' : 'star-empty'}
            style={isEditing ? { cursor: 'pointer' } : {}}
            onClick={isEditing ? () => setForm((prev) => ({ ...prev, proficiency: i + 1 })) : undefined}
          />
        ))}
      </div>

      {/* Proficiency bar */}
      <div className="proficiency-bar">
        <div
          className="proficiency-level"
          style={{ width: `${(proficiency / 5) * 100}%` }}
        ></div>
      </div>

      {/* Certificate link */}
      {isEditing ? (
        <input
          type="url"
          name="certificateLink"
          value={form.certificateLink}
          onChange={handleChange}
          placeholder="Certificate URL"
          className="skill-inline-input skill-cert-input"
        />
      ) : skill.certificateLink ? (
        <a href={skill.certificateLink} target="_blank" rel="noopener noreferrer" className="certificate-link">
          View Certificate <FaExternalLinkAlt />
        </a>
      ) : null}

      {/* Actions */}
      {isEditing ? (
        <div className="skill-edit-actions">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      ) : (
        <button type="button" className="edit-skill-btn" onClick={onEditClick}>Edit</button>
      )}
    </form>
  );
};

export default SkillsCard;