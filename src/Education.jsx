import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaDownload, FaPlus, FaUpload } from 'react-icons/fa';
import './Education.css';
import useEducations from './hooks/useEducations';
import useAchievements from './hooks/useAchievements';
import { usePermissions } from './contexts/PermissionsProvider';
/*
const educationData = [
  {
    title: "Bachelor of Technology, Computer Science & Engineering",
    institution: "Indian Institute of Information Technology, Senapati Manipur",
    year: "2022 - 2026",
    percentage: "8.55 CPI (so far)",
    coursework: [
      "Data Structures & Algorithms", "Operating Systems", "Database Systems",
      "Computer Networks", "Machine Learning Basics",
    ],
    description:
      "Currently Pursuing and holding a CPI of 8.55 till 6th semester. " +
      "Held the position of General Secretary of Technical Board Gymkhana. " +
      "SIH'23 Finalist. GATE Qualified 24 - DSAI & CSIT",
  },
  {
    title: "Senior Secondary Education",
    institution: "Surevin International School, Niwari",
    year: "2020 - 2022",
    percentage: "94.3%",
    coursework: ["Physics", "Chemistry", "Mathematics"],
    description:
      "Completed 12th grade with PCM as main subjects and achieved 94.3% " +
      "in final examinations and ranked 5th position in school.",
  },
  {
    title: "Secondary Education",
    institution: "Dayawati Modi Public School, Modinagar",
    year: "2018 - 2020",
    percentage: "97.1%",
    coursework: ["Science", "Mathematics", "Computer Club Activities"],
    description:
      "Completed 10th grade with distinction in Science and Mathematics. " +
      "Active participant in school's computer club and robotics team. " +
      "Scored 97.1% and ranked 3rd in school.",
  },
];
*/
// ─────────────────────────────────────────────────────────────────────────────
const EducationCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/education';

  const {
    educations,
    loading,
    error,
    createEducation,
    updateEducation,
    deleteEducation,
    uploadResult,
    uploadImage: uploadEduImage,
    deleteImage: deleteEduImage,
  } = useEducations();

  // Global permissions from provider
  const { isSuperuser } = usePermissions();

  // Use backend-provided image URLs (each education may have `images` array)
  // The API returns `images` as objects; map to their `image` URL for the UI.
  const displayedEducations = educations.map((edu) => ({
    ...edu,
    images: (edu.images || []).map(imgObj => (typeof imgObj === 'string' ? imgObj : imgObj.image)),
  }));

  const [currentSlide, setCurrentSlide] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editCertificateIndex, setEditCertificateIndex] = useState(null);
  const { achievements, loading: achievementsLoading, error: achievementsError, createAchievement, updateAchievement, deleteAchievement, uploadImage, deleteImage } = useAchievements();
  const [creatingCert, setCreatingCert] = useState(false);

  const [hoveredCertId, setHoveredCertId] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const fileInputRef = useRef();

  // Auto-rotate carousel (uses first education's images length)
  useEffect(() => {
    const firstImagesLen = (displayedEducations[0]?.images?.length) || 0;
    const maxSlides = Math.max(1, firstImagesLen);
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % maxSlides);
    }, 3000);
    return () => clearInterval(interval);
  }, [displayedEducations]);

  const handleDotClick = (index) => setCurrentSlide(index);

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setDocPreview({ name: file.name, data: objectUrl, type: file.type || 'application/octet-stream', objectUrl });
    setShowDocPreview(true);
  };

  const getMimeFromUrl = (url) => {
    if (!url) return 'application/octet-stream';
    const raw = url.split('?')[0].split('#')[0];
    const ext = (raw.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      default: return 'application/octet-stream';
    }
  };

  const viewResult = async (result, educationId) => {
    if (!result) return;

    // For backend result (object with .url), fetch via download endpoint for CORS safety
    if (educationId && result && result.url) {
      try {
        const response = await fetch(`/api/education/${educationId}/download_result/`);
        if (!response.ok) {
          alert('Failed to load result');
          return;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const type = result.type || getMimeFromUrl(result.url);
        setDocPreview({ name: result.name, data: objectUrl, type, objectUrl });
        setShowDocPreview(true);
      } catch (error) {
        console.error('Error loading result:', error);
        alert('Error loading result');
      }
      return;
    }

    // Fallback for direct string URLs or File objects
    if (typeof result === 'string') {
      let url = result;
      if (url.startsWith('/')) {
        url = `${window.location.origin}${url}`;
      }
      const name = url.split('/').pop();
      const type = getMimeFromUrl(url);
      setDocPreview({ name, data: url, type });
      setShowDocPreview(true);
      return;
    }
    if (result instanceof File) {
      const objectUrl = URL.createObjectURL(result);
      setDocPreview({ name: result.name, data: objectUrl, type: result.type || 'application/octet-stream', objectUrl });
      setShowDocPreview(true);
      return;
    }
  };

  const downloadResult = async (result, educationId) => {
    if (!result) return;

    // If result has an id (backend result), use the download endpoint
    if (educationId && result.url) {
      try {
        const response = await fetch(`/api/education/${educationId}/download_result/`);
        if (!response.ok) {
          alert('Failed to download result');
          return;
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Extract filename from response header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'result';
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="([^"]+)"/);
          filename = matches ? matches[1] : 'result';
        }

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading file');
      }
      return;
    }

    // Fallback: handle direct URL download (for file objects, etc.)
    const link = document.createElement('a');
    let href, filename, isObjectUrl = false;
    if (typeof result === 'string') {
      href = result;
      filename = result.split('/').pop();
    } else if (result.url) {
      href = result.url;
      filename = result.name || result.url.split('/').pop();
    } else if (result instanceof File) {
      const objectUrl = URL.createObjectURL(result);
      href = objectUrl;
      filename = result.name;
      isObjectUrl = true;
    }
    link.href = href;
    link.download = filename || 'result';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (isObjectUrl) URL.revokeObjectURL(href);
  };

  const downloadDocument = () => {
    if (!docPreview) return;
    const link = document.createElement('a');
    link.href = docPreview.data;
    link.download = docPreview.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (docPreview.objectUrl) URL.revokeObjectURL(docPreview.objectUrl);
  };

  const handleClosePreview = () => {
    if (docPreview && docPreview.objectUrl) {
      try { URL.revokeObjectURL(docPreview.objectUrl); } catch (e) { /* ignore */ }
    }
    setDocPreview(null);
    setShowDocPreview(false);
  };

  // Reusable carousel JSX
  const renderCarousel = (edu) => {
    if (!edu.images || edu.images.length === 0) return null;
    return (
      <div className="education-image-container">
        <div className="image-carousel">
          {edu.images.map((img, imgIndex) => (
            <div
              key={imgIndex}
              className={`carousel-slide ${imgIndex === currentSlide ? 'active' : ''}`}
            >
              <img src={img} alt={`${edu.title} ${imgIndex + 1}`} className="education-image" />
            </div>
          ))}
          <div className="carousel-dots">
            {edu.images.map((_, dotIndex) => (
              <span
                key={dotIndex}
                className={`dot ${dotIndex === currentSlide ? 'active' : ''}`}
                onClick={() => handleDotClick(dotIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTextBlock = (edu) => (
    <div className="education-text">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{edu.title}</h3>
        {isSuperuser ? (
          <button className="result-btn" style={{ marginRight: 8 }} onClick={() => setEditIndex(edu.id)}>
            Edit
          </button>
        ) : null}
      </div>
      <h4>{edu.institution}</h4>
      <p className="education-year">{edu.year}</p>
      {edu.percentage && (
        <p className="education-percentage">Percentage / Score: {edu.percentage}</p>
      )}
      <p className="education-description">{edu.description}</p>
      {edu.coursework && edu.coursework.length > 0 && (
        <div className="education-coursework">
          <strong>Coursework:</strong>
          <ul>{edu.coursework.map((cw, i) => <li key={i}>{cw}</li>)}</ul>
        </div>
      )}
      {edu.result && (
        <div className="edu-buttons">
          <button className="result-btn" onClick={() => viewResult(edu.result, edu.id)}>View Result</button>
          <button className="download-result-btn" onClick={() => downloadResult(edu.result, edu.id)}>
            Download Result
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ffdd1c', '--clr': '#ffdd1c' }}>
        <h2>Education</h2>
        <div className="header-actions">
          {isSuperuser && (
            <button
              className="add-education-btn"
              onClick={() => setIsAdding(v => !v)}
              title="Add new education"
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

      {isAdding && (
        <div className="add-education-form-container">
          <EditEducationForm
            initial={{ title: '', institution: '', year: '', percentage: '', description: '', coursework: [], images: [], result: null }}
            onSave={async (newEdu) => {
              const { images: _img, result: _res, ...textFields } = newEdu;
              await createEducation(textFields);
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
            onDelete={() => setIsAdding(false)}
            uploadImage={uploadEduImage}
            deleteImage={deleteEduImage}
            serverImages={[]}
          />
        </div>
      )}

      <div className='card-body'>
        {loading && <p className="loading-text">Loading education…</p>}
        {error && <p className="error-text">Error: {error.message}</p>}

        <div className='education-content'>
          {displayedEducations.map((edu, index) => (
            <div
              key={edu.id}
              className={`education-item ${index % 2 === 0 ? 'lefta-text' : 'lefta-image'}`}
              data-aos={index % 2 === 0 ? 'fade-aright' : 'fade-aleft'}
            >
              {editIndex === edu.id ? (
                <EditEducationForm
                  initial={edu}
                  onSave={async (updated) => {
                    // images & result are mock-only — only send text fields to backend
                    const { images: _img, result: resultData, ...textFields } = updated;
                    await updateEducation(edu.id, textFields);
                    // If result file (File object) is present, upload it separately
                    if (resultData && resultData instanceof File) {
                      await uploadResult(edu.id, resultData);
                    }
                    setEditIndex(null);
                  }}
                  onCancel={() => setEditIndex(null)}
                  onDelete={async () => {
                    if (window.confirm('Delete this education entry?')) {
                      await deleteEducation(edu.id);
                      setEditIndex(null);
                    }
                  }}
                  uploadImage={uploadEduImage}
                  deleteImage={deleteEduImage}
                  serverImages={(educations[index] || {}).images || []}
                />
              ) : index % 2 === 0 ? (
                // Even → text left, carousel right
                <>{renderTextBlock(edu)}{renderCarousel(edu)}</>
              ) : (
                // Odd → carousel left, text right
                <>{renderCarousel(edu)}{renderTextBlock(edu)}</>
              )}
            </div>
          ))}

        </div>

        {/* Document Preview Modal */}
        {showDocPreview && docPreview && (
          <div className="doc-modal-overlay" onClick={() => handleClosePreview()}>
            <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{docPreview.name}</h3>
              <div className="doc-preview-container">
                {docPreview.type && docPreview.type.startsWith('image/') ? (
                  <img
                    src={docPreview.data}
                    alt="Document Preview"
                    style={{ maxWidth: '100%', maxHeight: '600px' }}
                  />
                ) : (
                  <object data={docPreview.data} type={docPreview.type || 'application/octet-stream'} style={{ width: '100%', height: '600px' }}>
                    <p>Document Preview Not Available</p>
                  </object>
                )}
              </div>
              <div className="doc-modal-actions">
                <button onClick={downloadDocument} className="download-btn">
                  <FaDownload /> Download
                </button>
                <button onClick={() => handleClosePreview()} className="close-btn">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Documents removed: upload UI is no longer used */}

        {/* Achievements Section */}
        <div className="achievements-section">
          <h2>Achievements & Certifications</h2>
          <div className="certificates-gallery">
            {achievements.map((cert) => (
              <div
                key={cert.id}
                className="certificate-card"
                onMouseEnter={() => setHoveredCertId(cert.id)}
                onMouseLeave={() => setHoveredCertId(null)}
              >
                {editCertificateIndex === cert.id ? (
                  <CertificateEditForm
                    cert={cert}
                    onSave={async (updated) => {
                      try {
                        if (updated.imageFile) {
                          const fd = new FormData();
                          if (updated.title) fd.append('title', updated.title);
                          if (updated.description) fd.append('description', updated.description);
                          if (updated.issuer) fd.append('issuer', updated.issuer);
                          if (updated.date) fd.append('date', updated.date);
                          fd.append('result', updated.imageFile, updated.imageFile.name);
                          await updateAchievement(cert.id, fd);
                        } else {
                          await updateAchievement(cert.id, { title: updated.title, description: updated.description, issuer: updated.issuer, date: updated.date });
                        }
                      } catch (err) {
                        console.error('Update achievement failed', err);
                        alert('Failed to update achievement');
                      } finally {
                        setEditCertificateIndex(null);
                      }
                    }}
                    onCancel={() => setEditCertificateIndex(null)}
                    onDelete={() => {
                      (async () => { if (window.confirm('Delete this certificate?')) { await deleteAchievement(cert.id); setEditCertificateIndex(null); } })();
                    }}
                  />
                ) : (
                  <>
                    <div className="certificate-image-wrapper">
                      <img src={cert.image || cert.image_url || cert.certificate_url || cert.result} alt={cert.title} className="certificate-image" />
                      <div className={`certificate-overlay ${hoveredCertId === cert.id ? 'visible' : ''}`}>
                        <h4>{cert.title}</h4>
                        <p>{cert.description}</p>
                      </div>
                    </div>
                    {isSuperuser ? (
                      <button className="cert-edit-btn" onClick={() => setEditCertificateIndex(cert.id)}>
                        Edit
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            ))}

            {/* Add New Certificate */}
            {isSuperuser && (
              <div className="certificate-card add-certificate">
                {creatingCert ? (
                  <CertificateEditForm
                    cert={{ title: '', description: '', image: '', issuer: '', date: '' }}
                    onSave={async (form) => {
                      // If the form contains a raw File stored as `imageFile`, send multipart
                      try {
                        if (form.imageFile) {
                          const fd = new FormData();
                          if (form.title) fd.append('title', form.title);
                          if (form.description) fd.append('description', form.description);
                          if (form.issuer) fd.append('issuer', form.issuer);
                          if (form.date) fd.append('date', form.date);
                          fd.append('result', form.imageFile, form.imageFile.name);
                          await createAchievement(fd);
                        } else {
                          await createAchievement({ title: form.title || 'Untitled', description: form.description, issuer: form.issuer, date: form.date });
                        }
                      } catch (err) {
                        console.error('Create achievement failed', err);
                        alert('Failed to create achievement');
                      } finally {
                        setCreatingCert(false);
                      }
                    }}
                    onCancel={() => setCreatingCert(false)}
                    onDelete={() => setCreatingCert(false)}
                  />
                ) : (
                  <button
                    className="add-cert-btn"
                    onClick={() => setCreatingCert(true)}
                  >
                    <FaPlus size={32} />
                    <span>Add Certificate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Certificate Edit Form ─────────────────────────────────────────────────

const CertificateEditForm = ({ cert, onSave, onCancel, onDelete }) => {
  const [form, setForm] = useState({ ...cert });
  const fileInputRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, image: ev.target.result, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="certificate-edit-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="cert-edit-image">
        {form.image && <img src={form.image} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '6px', marginBottom: '8px' }} />}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
        <button type="button" onClick={() => fileInputRef.current.click()} className="upload-btn">
          Upload Image
        </button>
      </div>
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Certificate Title"
        className="cert-input"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="cert-input"
        rows={2}
      />
      <input
        type="text"
        name="issuer"
        value={form.issuer}
        onChange={handleChange}
        placeholder="Issuer"
        className="cert-input"
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="cert-input"
      />
      <div className="cert-form-actions">
        <button type="submit" className="save-btn">Save</button>
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button type="button" className="delete-btn" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

/* Edit form for education item */
const EditEducationForm = ({ initial, onSave, onCancel, onDelete, uploadImage, deleteImage, serverImages = [] }) => {
  const [form, setForm] = useState({ ...initial });
  const [srvImages, setSrvImages] = useState(serverImages || []);
  const imagesRef = useRef();
  const resultRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseworkChange = (e) => {
    // allow comma-separated entry
    const val = e.target.value;
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    setForm(prev => ({ ...prev, coursework: arr }));
  };

  const handleImagesAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // If editing an existing education (has id), upload to server; otherwise keep as local preview
    if (initial && initial.id && uploadImage) {
      (async () => {
        for (const file of files) {
          try {
            const created = await uploadImage(initial.id, file, file.name);
            // Append returned image object to server images list
            setSrvImages(prev => [...prev, created]);
          } catch (err) {
            console.error('Upload image failed', err);
            alert('Failed to upload image');
          }
        }
      })();
    } else {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setForm(prev => ({ ...prev, images: [...(prev.images || []), ev.target.result] }));
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = null;
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleServerImageDelete = async (imgId) => {
    if (!initial || !initial.id) return;
    if (!deleteImage) return;
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteImage(initial.id, imgId);
      setSrvImages(prev => prev.filter(img => img.id !== imgId));
    } catch (err) {
      console.error('Delete image failed', err);
      alert('Failed to delete image');
    }
  };

  const handleResultUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Store the actual File object and a preview name
    setForm(prev => ({ ...prev, result: file, resultPreview: file.name }));
    e.target.value = null;
  };

  return (
    <div className="education-text">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
        <input name="title" value={form.title} onChange={handleChange} className="edu-inline-input" placeholder="Title" required />
        <input name="institution" value={form.institution} onChange={handleChange} className="edu-inline-input" placeholder="Institution" />
        <input name="year" value={form.year} onChange={handleChange} className="edu-inline-input" placeholder="Year" />
        <input name="percentage" value={form.percentage || ''} onChange={handleChange} className="edu-inline-input" placeholder="Percentage / Score" />
        <textarea name="description" value={form.description} onChange={handleChange} className="edu-inline-input" rows={3} placeholder="Description" />

        <label className="edu-small-label">Coursework (comma separated)</label>
        <input name="coursework" value={(form.coursework || []).join(', ')} onChange={handleCourseworkChange} className="edu-inline-input" placeholder="e.g. Algorithms, OS, DB" />

        <div className="image-upload-area">
          {/* Server-hosted images (editable) */}
          {srvImages && srvImages.length > 0 && (
            <div className="image-previews">
              {srvImages.map((img, i) => (
                <div className="image-preview" key={`srv-${img.id}`}>
                  <img src={img.image || img.url || img} alt={img.title || `image-${i}`} />
                  <button type="button" className="cancel-btn" onClick={() => handleServerImageDelete(img.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" multiple ref={imagesRef} onChange={handleImagesAdd} style={{ display: 'none' }} />
          <button type="button" className="upload-btn" onClick={() => imagesRef.current.click()}>Add Images</button>
        </div>

        <div className="result-upload">
          {form.result && (
            <div style={{ marginBottom: 8 }}>
              <strong>
                {form.resultPreview || (form.result?.name) || (typeof form.result === 'string' ? form.result.split('/').pop() : 'Result file')}
              </strong>
              {form.result?.url && (
                <a href={form.result.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: '0.9em', color: '#0066cc' }}>View</a>
              )}
            </div>
          )}
          <input type="file" accept=".pdf,image/*" ref={resultRef} onChange={handleResultUpload} style={{ display: 'none' }} />
          <button type="button" className="upload-btn" onClick={() => resultRef.current.click()}>Upload Result</button>
        </div>

        <div className="cert-form-actions" style={{ marginTop: 12 }}>
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button type="button" className="delete-btn" onClick={onDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
};

export default EducationCard;