import { useLocation, NavLink } from 'react-router-dom';
import { FaBars, FaGithub, FaExternalLinkAlt, FaEdit, FaTrash, FaPlus, FaUpload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import './Projects.css';

const ProjectCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/projects';
  
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with cart functionality.",
      tools: ["React", "Node.js", "MongoDB"],
      githubLink: "https://github.com/yourusername/ecommerce",
      liveLink: "https://tnp-web.vercel.app/",
      media: {
        erd: "https://storage.googleapis.com/portfolio-pseudophoenix/erd1.png",
        architecture: "https://storage.googleapis.com/portfolio-pseudophoenix/architecture1.png",
        demo: "https://storage.googleapis.com/portfolio-pseudophoenix/demo1.mp4",
        screenshots: []
      },
      lessonsLearned: "Learned the importance of database optimization and scalable architecture design",
      challenges: "Managing real-time inventory updates across multiple concurrent users"
    },
    {
      id: 2,
      title: "Portfolio Website",
      description: "A responsive portfolio with smooth animations.",
      tools: ["React", "GSAP", "Tailwind"],
      githubLink: "https://github.com/yourusername/portfolio",
      liveLink: "https://alok-nine.vercel.app/",
      media: {
        erd: "https://storage.googleapis.com/portfolio-pseudophoenix/erd2.png",
        architecture: "https://storage.googleapis.com/portfolio-pseudophoenix/architecture2.png",
        demo: "https://storage.googleapis.com/portfolio-pseudophoenix/demo2.mp4",
        screenshots: []
      },
      lessonsLearned: "Understanding WebSocket communication and real-time data synchronization",
      challenges: "Handling concurrent updates and conflict resolution in collaborative editing"
    }
  ]);

  const [editProjectIndex, setEditProjectIndex] = useState(null);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [activeMediaTab, setActiveMediaTab] = useState('erd');

  return (
    <motion.div
      className={`card ${isActive ? 'card-visible' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className='card-header' style={{ background: '#39bd00', '--clr': '#39bd00' }}>
        <h2>Projects</h2>
        <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}>
          <FaBars />
        </NavLink>
      </div>

      <div className='card-body'>
        <div className="projects-header">
          <button 
            className="add-project-btn"
            onClick={() => {
              const newProject = {
                id: Math.max(...projects.map(p => p.id), 0) + 1,
                title: '',
                description: '',
                tools: [],
                githubLink: '',
                liveLink: '',
                media: { erd: '', architecture: '', demo: '', screenshots: [] },
                lessonsLearned: '',
                challenges: ''
              };
              setProjects([...projects, newProject]);
              setEditProjectIndex(newProject.id);
            }}
          >
            <FaPlus /> Add Project
          </button>
        </div>

        <div className="projects-container">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className={`project-item ${expandedProjectId === project.id ? 'expanded' : ''}`}
              layout
              transition={{ type: "spring", damping: 25 }}
            >
              {editProjectIndex === project.id ? (
                <ProjectEditForm
                  project={project}
                  onSave={(updated) => {
                    setProjects(projects.map(p => p.id === project.id ? updated : p));
                    setEditProjectIndex(null);
                  }}
                  onCancel={() => setEditProjectIndex(null)}
                  onDelete={() => {
                    setProjects(projects.filter(p => p.id !== project.id));
                    setEditProjectIndex(null);
                  }}
                />
              ) : (
                <>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="tools-used">
                      {project.tools?.map(tool => (
                        <span key={tool} className="tool-tag">{tool}</span>
                      ))}
                    </div>
                    <div className="project-links">
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="github-link">
                          <FaGithub /> Code
                        </a>
                      )}
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="live-link">
                          <FaExternalLinkAlt /> Live
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedProjectId(expandedProjectId === project.id ? null : project.id)}
                        className="expand-btn"
                      >
                        {expandedProjectId === project.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => setEditProjectIndex(project.id)}
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedProjectId === project.id && (
                      <motion.div
                        className="project-details-expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Media Gallery */}
                        <div className="media-section">
                          <div className="media-tabs">
                            {project.media?.erd && (
                              <button
                                className={`media-tab ${activeMediaTab === 'erd' ? 'active' : ''}`}
                                onClick={() => setActiveMediaTab('erd')}
                              >
                                ERD
                              </button>
                            )}
                            {project.media?.architecture && (
                              <button
                                className={`media-tab ${activeMediaTab === 'architecture' ? 'active' : ''}`}
                                onClick={() => setActiveMediaTab('architecture')}
                              >
                                Architecture
                              </button>
                            )}
                            {project.media?.demo && (
                              <button
                                className={`media-tab ${activeMediaTab === 'demo' ? 'active' : ''}`}
                                onClick={() => setActiveMediaTab('demo')}
                              >
                                Demo
                              </button>
                            )}
                            {project.media?.screenshots && project.media.screenshots.length > 0 && (
                              <button
                                className={`media-tab ${activeMediaTab === 'screenshots' ? 'active' : ''}`}
                                onClick={() => setActiveMediaTab('screenshots')}
                              >
                                Screenshots
                              </button>
                            )}
                          </div>

                          <div className="media-display">
                            {activeMediaTab === 'erd' && project.media?.erd && (
                              <img src={project.media.erd} alt="Entity Relationship Diagram" />
                            )}
                            {activeMediaTab === 'architecture' && project.media?.architecture && (
                              <img src={project.media.architecture} alt="System Architecture" />
                            )}
                            {activeMediaTab === 'demo' && project.media?.demo && (
                              <video controls>
                                <source src={project.media.demo} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {activeMediaTab === 'screenshots' && project.media?.screenshots && (
                              <div className="screenshots-grid">
                                {project.media.screenshots.map((screenshot, idx) => (
                                  <img key={idx} src={screenshot} alt={`Screenshot ${idx + 1}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lessons & Challenges */}
                        <div className="lessons-challenges">
                          {project.lessonsLearned && (
                            <div className="lesson-box">
                              <h4>📚 Lessons Learned</h4>
                              <p>{project.lessonsLearned}</p>
                            </div>
                          )}
                          {project.challenges && (
                            <div className="challenge-box">
                              <h4>⚡ Challenges</h4>
                              <p>{project.challenges}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* Project Edit Form Component */
const ProjectEditForm = ({ project, onSave, onCancel, onDelete }) => {
  const [form, setForm] = useState({ ...project });
  const [toolsInput, setToolsInput] = useState(form.tools?.join(', ') || '');
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleToolsChange = (e) => {
    const inputValue = e.target.value;
    setToolsInput(inputValue);
    // Only update form.tools on blur or save, not on every keystroke
  };

  const handleToolsBlur = () => {
    // Parse tools when user leaves the field
    const tools = toolsInput.split(',').map(t => t.trim()).filter(t => t);
    setForm(prev => ({ ...prev, tools }));
  };

  const handleMediaUpload = (e, mediaType) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (mediaType === 'screenshots') {
          setForm(prev => ({
            ...prev,
            media: {
              ...prev.media,
              screenshots: [...(prev.media.screenshots || []), ev.target.result]
            }
          }));
        } else {
          setForm(prev => ({
            ...prev,
            media: { ...prev.media, [mediaType]: ev.target.result }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="project-edit-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="form-group">
        <label>Project Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="form-textarea"
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label>Technologies (comma-separated)</label>
        <input
          type="text"
          value={toolsInput}
          onChange={handleToolsChange}
          onBlur={handleToolsBlur}
          className="form-input"
          placeholder="React, Node.js, MongoDB"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>GitHub URL</label>
          <input
            type="url"
            name="githubLink"
            value={form.githubLink}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Live Demo URL</label>
          <input
            type="url"
            name="liveLink"
            value={form.liveLink}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      {/* Media Upload */}
      <div className="media-upload-section">
        <h4>Media & Documentation</h4>
        
        <div className="media-upload-group">
          <label>ERD Diagram</label>
          <div className="upload-preview">
            {form.media?.erd && typeof form.media.erd === 'string' && form.media.erd.startsWith('data:') && (
              <img src={form.media.erd} alt="ERD Preview" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="upload-icon-btn">
              <FaUpload />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleMediaUpload(e, 'erd')}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="media-upload-group">
          <label>Architecture Diagram</label>
          <div className="upload-preview">
            {form.media?.architecture && typeof form.media.architecture === 'string' && form.media.architecture.startsWith('data:') && (
              <img src={form.media.architecture} alt="Architecture Preview" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
            )}
            <button type="button" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => handleMediaUpload(e, 'architecture');
              input.click();
            }} className="upload-icon-btn">
              <FaUpload />
            </button>
          </div>
        </div>

        <div className="media-upload-group">
          <label>Demo Video</label>
          <div className="upload-preview">
            {form.media?.demo && typeof form.media.demo === 'string' && form.media.demo.startsWith('data:') && (
              <video style={{ width: '100px', height: '100px', objectFit: 'contain' }} controls>
                <source src={form.media.demo} type="video/mp4" />
              </video>
            )}
            <button type="button" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'video/*';
              input.onchange = (e) => handleMediaUpload(e, 'demo');
              input.click();
            }} className="upload-icon-btn">
              <FaUpload />
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Lessons Learned</label>
        <textarea
          name="lessonsLearned"
          value={form.lessonsLearned}
          onChange={handleChange}
          className="form-textarea"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label>Challenges Faced</label>
        <textarea
          name="challenges"
          value={form.challenges}
          onChange={handleChange}
          className="form-textarea"
          rows={2}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-save">Save Project</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn-delete" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

export default ProjectCard;