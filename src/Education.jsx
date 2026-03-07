import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaDownload, FaPlus, FaUpload } from 'react-icons/fa';
import './Education.css';

const EducationCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editCertificateIndex, setEditCertificateIndex] = useState(null);
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: "AWS Certified Cloud Practitioner",
      description: "Cloud computing fundamentals and AWS services",
      image: "https://storage.googleapis.com/portfolio-pseudophoenix/certificate1.jpg",
      issuer: "Amazon Web Services",
      date: "2023-06"
    },
    {
      id: 2,
      title: "Google Cloud Associate",
      description: "Google Cloud Platform certification",
      image: "https://storage.googleapis.com/portfolio-pseudophoenix/certificate2.jpg",
      issuer: "Google Cloud",
      date: "2023-08"
    },
    {
      id: 3,
      title: "Linux System Administrator",
      description: "Linux system administration and management",
      image: "https://storage.googleapis.com/portfolio-pseudophoenix/certificate3.jpg",
      issuer: "Linux Foundation",
      date: "2023-10"
    }
  ]);
  const [hoveredCertId, setHoveredCertId] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const fileInputRef = useRef();
  const isActive = location.pathname === '/education';
  const educationData = [
    {
      title: "Bachelor of Technology, Computer Science & Engineering",
      institution: "Indian Institute of Information Technology, Senapati Manipur",
      year: "2022 - 2026",
      description: "Currenlty Pursuing and holding a CPI of 8.55 till 6th semester. Held the position of General Secretary of Technical Board Gymkhana. SIH'23 Finalist. GATE Qualified 24 - DSAI & CSIT",
      images: [
        "https://storage.googleapis.com/portfolio-pseudophoenix/1000006407%20(3).jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/IMG_20240201_202220.jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/al10906_SIH_MT_DAY_20122023_458_0.JPG"
      ]
    },
    {
      title: "Senior Secondary Education",
      institution: "Surevin International School, Niwari",
      year: "2020 - 2022",
      description: "Completed 12th grade with Physics, Chemistry, and Mathematics as main subjects and achieved 94.3% in final examinations and ranked 5th position in school.",
      images: [
        "https://storage.googleapis.com/portfolio-pseudophoenix/482260096_3932387313688697_4131085957098344810_n.jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20220730-WA0019.jpg",
        // "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20220730-WA0020.jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/482222098_3932598280334267_5995637256767237398_n.jpg",
        // "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20220730-WA0006.jpg",
        // "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20220730-WA0035.jpg"
      ]
    },
    {
      title: "Secondary Education",
      institution: "Dayawati Modi Public School, Modinagar",
      year: "2018 - 2020",
      description: "Completed 10th grade with distinction in Science and Mathematics. Active participant in school's computer club and robotics team. Scored 97.1% and ranked 3rd in school.",
      images: [
        "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20191024-WA0042.jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20191024-WA0086.jpg",
        "https://storage.googleapis.com/portfolio-pseudophoenix/IMG-20191 024-WA0001.jpg",
        // "https://storage.googleapis.com/portfolio-pseudophoenix/1.jpeg"  
      ]
    }
  ];

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const collegeItem = educationData.find(item => item.images);
    if (!collegeItem) return;
    console.log(collegeItem.title);
    const interval = setInterval(() => {
      setCurrentSlide(prev => ((prev + 1) % collegeItem.images.length));
    }, 3000);

    return () => clearInterval(interval);
  }, [educationData]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setDocPreview({
          name: file.name,
          data: ev.target.result,
          type: file.type
        });
        setShowDocPreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadDocument = () => {
    if (docPreview) {
      const link = document.createElement('a');
      link.href = docPreview.data;
      link.download = docPreview.name;
      link.click();
    }
  };

  return (

    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ffdd1c', '--clr': '#ffdd1c' }}>
        <h2>Education</h2>
        <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}>
          <FaBars />
        </NavLink>
      </div>
      <div className='card-body'>

        <div className='education-content'>
          {educationData.map((edu, index) => (
            <div
              key={index}
              className={`education-item ${index % 2 === 0 ? 'lefta-text' : 'lefta-image'}`}
              data-aos={index % 2 === 0 ? "fade-aright" : "fade-aleft"}
            >
              {edu.images ? (
                <>
                  <div className="education-text">
                    <h3>{edu.title}</h3>
                    <h4>{edu.institution}</h4>
                    <p className="education-year">{edu.year}</p>
                    <p className="education-description">{edu.description}</p>
                  </div>
                  <div className="education-image-container">
                    <div className="image-carousel">
                      {edu.images.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`carousel-slide ${imgIndex === currentSlide ? 'active' : ''}`}
                        >
                          {/* {console.log(images)} */}
                          <img
                            src={img}
                            alt={`${edu.title} ${imgIndex + 1}`}
                            className="education-image"
                          />
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
                </>
              ) : index % 2 === 0 ? (
                <>
                  <div className="education-text">
                    <h3>{edu.title}</h3>
                    <h4>{edu.institution}</h4>
                    <p className="education-year">{edu.year}</p>
                    <p className="education-description">{edu.description}</p>
                  </div>
                  <div className="education-image-container">
                    <div className="image-carousel">
                      {edu.images.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`carousel-slide ${imgIndex === currentSlide ? 'active' : ''}`}
                        >
                          <img
                            src={img}
                            alt={`${edu.title} ${imgIndex + 1}`}
                            className="education-image"
                          />
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
                </>
              ) : (
                <>
                  <div className="education-image-container">
                    <div className="image-carousel">
                      {edu.images.map((img, imgIndex) => (
                        <div
                          key={imgIndex}
                          className={`carousel-slide ${imgIndex === currentSlide ? 'active' : ''}`}
                        >
                          <img
                            src={img}
                            alt={`${edu.title} ${imgIndex + 1}`}
                            className="education-image"
                          />
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
                  <div className="education-text">
                    <h3>{edu.title}</h3>
                    <h4>{edu.institution}</h4>
                    <p className="education-year">{edu.year}</p>
                    <p className="education-description">{edu.description}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Document Preview Modal */}
        {showDocPreview && docPreview && (
          <div className="doc-modal-overlay" onClick={() => setShowDocPreview(false)}>
            <div className="doc-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{docPreview.name}</h3>
              <div className="doc-preview-container">
                {docPreview.type.startsWith('image/') ? (
                  <img src={docPreview.data} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: '600px' }} />
                ) : (
                  <object data={docPreview.data} type={docPreview.type} style={{ width: '100%', height: '600px' }}>
                    <p>Document Preview Not Available</p>
                  </object>
                )}
              </div>
              <div className="doc-modal-actions">
                <button onClick={downloadDocument} className="download-btn">
                  <FaDownload /> Download
                </button>
                <button onClick={() => setShowDocPreview(false)} className="close-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Section */}
        <div className="document-section">
          <h2>Documents & Certificates</h2>
          <button 
            className="doc-upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload /> Upload Document
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDocumentUpload}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
          />
          {docPreview && (
            <div className="doc-uploaded">
              <p>Uploaded: {docPreview.name}</p>
              <button onClick={() => setShowDocPreview(true)} className="preview-doc-btn">
                Preview
              </button>
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="achievements-section">
          <h2>Achievements & Certifications</h2>
          
          <div className="certificates-gallery">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="certificate-card"
                onMouseEnter={() => setHoveredCertId(cert.id)}
                onMouseLeave={() => setHoveredCertId(null)}
              >
                {editCertificateIndex === cert.id ? (
                  <CertificateEditForm
                    cert={cert}
                    onSave={(updated) => {
                      setCertificates(certificates.map(c => c.id === cert.id ? updated : c));
                      setEditCertificateIndex(null);
                    }}
                    onCancel={() => setEditCertificateIndex(null)}
                    onDelete={() => {
                      setCertificates(certificates.filter(c => c.id !== cert.id));
                      setEditCertificateIndex(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="certificate-image-wrapper">
                      <img src={cert.image} alt={cert.title} className="certificate-image" />
                      <div className={`certificate-overlay ${hoveredCertId === cert.id ? 'visible' : ''}`}>
                        <h4>{cert.title}</h4>
                        <p>{cert.description}</p>
                      </div>
                    </div>
                    <button
                      className="cert-edit-btn"
                      onClick={() => setEditCertificateIndex(cert.id)}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Add New Certificate */}
            <div className="certificate-card add-certificate">
              <button
                className="add-cert-btn"
                onClick={() => {
                  const newCert = {
                    id: Math.max(...certificates.map(c => c.id), 0) + 1,
                    title: '',
                    description: '',
                    image: '',
                    issuer: '',
                    date: ''
                  };
                  setCertificates([...certificates, newCert]);
                  setEditCertificateIndex(newCert.id);
                }}
              >
                <FaPlus size={32} />
                <span>Add Certificate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Certificate Edit Form Component */
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
        setForm((prev) => ({ ...prev, image: ev.target.result }));
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

export default EducationCard;