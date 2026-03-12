import './Skills.css';
import { useState, useEffect, useRef } from 'react';
import { FaStar, FaBars, FaExternalLinkAlt, FaUpload, FaTrash, FaPlus, FaCamera } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import useSkills from './hooks/useSkills';
import { usePermissions } from './contexts/PermissionsProvider';

const truncate = (str, maxLen) => {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
};

const SkillsCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/skills';

  // Fetch skills from backend
  const { skills, loading, error, createSkill, updateSkill, deleteSkill, uploadImage, removeImage } = useSkills();
  const { isSuperuser } = usePermissions();

  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ff4443', '--clr': '#ff4443' }}>
        <h2>Skills</h2>
        <div className="header-actions">
          {isSuperuser && (
            <button
              className="add-skill-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              title="Add new skill"
            >
              <FaPlus size={18} />
            </button>
          )}
          <NavLink
            to="/"
            className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
            onClick={() => setIsNavBarClosed(!isNavBarClosed)}
          >
            <FaBars />
          </NavLink>
        </div>
      </div>

      {showAddForm && isSuperuser && (
        <AddSkillForm
          onSave={async ({ imageFile, ...newSkill }) => {
            const created = await createSkill(newSkill);
            if (imageFile) {
              await uploadImage(created.id, imageFile);
            }
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {loading && <p className="loading-text">Loading skills...</p>}
      {error && <p className="error-text">Error loading skills: {error.message}</p>}

          <div className='card-body skills-container skills-grid'>
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`skill-wrapper ${hoveredSkill === skill.id ? 'skill-hovered' : ''}`}
            onMouseEnter={() => setHoveredSkill(skill.id)}
            onMouseLeave={() => setHoveredSkill(null)}
          >
            <SkillCard
              skill={skill}
              isEditing={editIndex === skill.id}
              onSave={async (updatedSkill) => {
                await updateSkill(skill.id, updatedSkill);
                setEditIndex(null);
              }}
              onCancel={() => setEditIndex(null)}
              onEditClick={() => setEditIndex(skill.id)}
              onDelete={async () => {
                if (window.confirm('Are you sure you want to delete this skill?')) {
                  await deleteSkill(skill.id);
                }
              }}
              onUploadImage={(file) => uploadImage(skill.id, file)}
              onRemoveImage={() => removeImage(skill.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Unified SkillCard - handles both view and edit mode in-place
const SkillCard = ({ skill, isEditing, onSave, onCancel, onEditClick, onDelete, onUploadImage, onRemoveImage }) => {
  const [form, setForm] = useState({ ...skill });
  const [isVisible, setIsVisible] = useState(false);
  const [showCameraPopover, setShowCameraPopover] = useState(false);
  const [popoverFile, setPopoverFile] = useState(null);
  const [popoverPreview, setPopoverPreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const cameraInputRef = useRef();
  const { isSuperuser } = usePermissions();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setForm({ ...skill });
    setShowCameraPopover(false);
    setPopoverFile(null);
    setPopoverPreview(null);
  }, [skill]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Image is managed via the camera popover — never included in the edit payload
    await onSave({ ...form });
  };

  const handleCameraFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPopoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPopoverPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePopoverUpload = async () => {
    if (!popoverFile) return;
    setUploadingImage(true);
    try {
      await onUploadImage(popoverFile);
      setPopoverFile(null);
      setPopoverPreview(null);
      setShowCameraPopover(false);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePopoverRemove = async () => {
    if (!window.confirm('Remove image from this skill?')) return;
    setUploadingImage(true);
    try {
      await onRemoveImage();
      setPopoverFile(null);
      setPopoverPreview(null);
      setShowCameraPopover(false);
    } finally {
      setUploadingImage(false);
    }
  };

  const closeCameraPopover = () => {
    setShowCameraPopover(false);
    setPopoverFile(null);
    setPopoverPreview(null);
  };

  const proficiency = isEditing ? form.proficiency : skill.proficiency;

  return (
    <form
      className={`skill-card ${isVisible ? 'visible' : ''}`}
      onSubmit={handleSubmit}
    >
      {/* Hidden file input for camera popover — outside overflow:hidden */}
      <input
        type="file"
        accept="image/*"
        ref={cameraInputRef}
        onChange={handleCameraFileChange}
        style={{ display: 'none' }}
      />

      {/* Image + Name side by side */}
      <div className="skill-header-row">
        {/* Image wrapper — camera button and popover live here, outside overflow:hidden */}
        <div className="skill-image-wrapper">
          <div className="skill-image-container">
            {skill.image
              ? <img src={skill.image} alt={skill.name} className="skill-image" />
              : <div className="skill-image-placeholder-edit">No Image</div>
            }
          </div>

          {/* Camera icon button pinned to bottom-right corner */}
          {isSuperuser && (
            <button
              type="button"
              className={`skill-camera-btn ${showCameraPopover ? 'active' : ''}`}
              onClick={() => setShowCameraPopover(v => !v)}
              title="Manage image"
            >
              <FaCamera size={11} />
            </button>
          )}

          {/* Inline camera popover */}
          {showCameraPopover && (
            <div className="skill-camera-popover">
              <div className="camera-popover-preview">
                {popoverPreview
                  ? <img src={popoverPreview} alt="New preview" />
                  : skill.image
                    ? <img src={skill.image} alt="Current" />
                    : <div className="camera-no-image">No image</div>
                }
              </div>
              <div className="camera-popover-actions">
                <button
                  type="button"
                  className="camera-choose-btn"
                  onClick={() => cameraInputRef.current.click()}
                  disabled={uploadingImage}
                >
                  Choose
                </button>
                {popoverFile && (
                  <button
                    type="button"
                    className="camera-upload-btn"
                    onClick={handlePopoverUpload}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? '…' : 'Upload'}
                  </button>
                )}
                {skill.image && (
                  <button
                    type="button"
                    className="camera-remove-btn"
                    onClick={handlePopoverRemove}
                    disabled={uploadingImage}
                  >
                    Remove
                  </button>
                )}
                <button type="button" className="camera-close-btn" onClick={closeCameraPopover}>
                  ✕
                </button>
              </div>
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
              step={0.5}
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
      ) : (
        skill.certificateLink ? (
          <a href={skill.certificateLink} target="_blank" rel="noopener noreferrer" className="certificate-link">
            View Certificate <FaExternalLinkAlt />
          </a>
        ) : (
          <div className="certificate-placeholder" />
        )
      )}

      {/* Actions */}
      {isEditing ? (
        <div className="skill-edit-actions">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        </div>
      ) : (
        <div className="skill-view-actions">
          {isSuperuser && (
            <>
              <button type="button" className="edit-skill-btn" onClick={(e) => {
                e.preventDefault();
                onEditClick();
              }}>Edit</button>
              <button type="button" className="delete-skill-btn" onClick={onDelete} title="Delete skill">
                <FaTrash size={16} />
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
};

// Add Skill Form Component
const AddSkillForm = ({ onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    proficiency: 3,
    yearsExperience: 0,
    projectsUsed: 0,
    certificateLink: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Skill name is required');
      return;
    }
    // Pass imageFile separately — SkillsCard will call uploadImage after create
    await onSave({ ...form, imageFile });
  };

  // Check completion status
  const hasName = form.name.trim().length > 0;
  const hasDescription = form.description.trim().length > 0;
  const hasImage = imagePreview !== null;

  const recommendedComplete = hasName && hasDescription && hasImage;

  return (
    <div className="add-skill-form-container">
      <div className="add-skill-form-wrapper">
        <form className="add-skill-form" onSubmit={handleSubmit}>
          <h3>Add New Skill</h3>

          {/* Image + Name row */}
          <div className="add-skill-row">
            <div className="add-skill-image-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="add-skill-image" />
              ) : (
                <div className="add-skill-image-placeholder">No Image</div>
              )}
              <div className="add-skill-image-overlay" onClick={() => fileInputRef.current.click()}>
                <FaUpload size={20} style={{ color: '#fff' }} />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Skill Name *"
              className="add-skill-name-input"
              required
            />
          </div>

          {/* Description */}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="add-skill-textarea"
            rows={2}
          />

          {/* Meta fields */}
          <div className="add-skill-meta-row">
            <div className="add-skill-field">
              <label>Years Experience</label>
              <input
                type="number"
                name="yearsExperience"
                value={form.yearsExperience}
                onChange={handleChange}
                min={0}
                step={0.5}
                className="add-skill-input"
              />
            </div>

            <div className="add-skill-field">
              <label>Projects Used</label>
              <input
                type="number"
                name="projectsUsed"
                value={form.projectsUsed}
                onChange={handleChange}
                min={0}
                className="add-skill-input"
              />
            </div>

            <div className="add-skill-field">
              <label>Proficiency (1-5)</label>
              <div className="add-skill-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    size={18}
                    key={i}
                    className={i < form.proficiency ? 'star-filled' : 'star-empty'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setForm((prev) => ({ ...prev, proficiency: i + 1 }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Certificate URL */}
          <input
            type="url"
            name="certificateLink"
            value={form.certificateLink}
            onChange={handleChange}
            placeholder="Certificate URL (optional)"
            className="add-skill-input"
          />

          {/* Actions */}
          <div className="add-skill-actions">
            <button type="submit" className="add-skill-save-btn">Add Skill</button>
            <button type="button" className="add-skill-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>

        {/* Side Alert Panel */}
        <div className="add-skill-alert-panel">
          <h4>Required & Recommended</h4>

          <div className="add-skill-alert-item">
            <div className={`alert-checkbox ${hasName ? 'checked' : ''}`}>
              {hasName && <span>✓</span>}
            </div>
            <div className="alert-content">
              <p className="alert-label">Skill Name *</p>
              <p className="alert-hint">Required to create the skill</p>
            </div>
          </div>

          <div className="add-skill-alert-item">
            <div className={`alert-checkbox ${hasDescription ? 'checked' : ''}`}>
              {hasDescription && <span>✓</span>}
            </div>
            <div className="alert-content">
              <p className="alert-label">Description</p>
              <p className="alert-hint">Recommended for context</p>
            </div>
          </div>

          <div className="add-skill-alert-item">
            <div className={`alert-checkbox ${hasImage ? 'checked' : ''}`}>
              {hasImage && <span>✓</span>}
            </div>
            <div className="alert-content">
              <p className="alert-label">Skill Image</p>
              <p className="alert-hint">Recommended for visibility</p>
            </div>
          </div>

          {/* Completion indicator */}
          <div className={`add-skill-completion-bar ${recommendedComplete ? 'complete' : ''}`}>
            <div
              className="completion-fill"
              style={{ width: `${(Object.values({ hasName, hasDescription, hasImage }).filter(Boolean).length / 3) * 100}%` }}
            />
          </div>
          <p className="completion-text">
            {recommendedComplete ? '✓ Ready to submit!' : 'Complete recommended fields'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillsCard;