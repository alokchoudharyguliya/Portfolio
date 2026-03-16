import './Contact.css';
import { NavLink, useLocation } from 'react-router-dom';
import { FaBars, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { useState, useRef } from 'react';
import useSocialMedia from './hooks/useSocialMedia';
import { usePermissions } from './contexts/PermissionsProvider';

const Contact = ({ isNavBarClosed, setIsNavBarClosed }) => {
    const location = useLocation();
    const isActive = location.pathname === '/' || location.pathname === '/home';

    /*
    const socialMediaData = [
        {
            id: 1,
            name: 'Kaggle',
            handle: '@pseudophoenix',
            logo: 'https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-kaggle-an-online-community-of-data-scientists-and-machine-learners-owned-by-google-logo-color-tal-revivo.png',
            url: 'https://twitter.com/yourusername'
        },
        {
            id: 2,
            name: 'LinkedIn',
            handle: 'linkedin.com/in/alok-choudhary-9465401ab/',
            logo: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
            url: 'https://www.linkedin.com/in/alok-choudhary-9465401ab/'
        },
        {
            id: 3,
            name: 'GitHub',
            handle: 'github.com/Pseudophoenix',
            logo: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
            url: 'https://github.com/Pseudophoenix'
        }
    ];
    */
    const [formData, setFormData] = useState({
        mode: 'identified', // 'identified' | 'anonymous'
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        subject: '',
        description: ''
    });

    const { socialMedia, loading: smLoading, error: smError, createSocial, updateSocial, deleteSocial, refetch } = useSocialMedia();
    const { isSuperuser } = usePermissions();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
                // For now, log the payload — include mode and fields
                const payload = {
                    mode: formData.mode,
                    name: formData.mode === 'identified' ? formData.name : 'Anonymous',
                    email: formData.mode === 'identified' ? formData.email : '',
                    phone: formData.mode === 'identified' ? formData.phone : '',
                    subject: formData.subject,
                    description: formData.description,
                };
                console.log('Contact form payload:', payload);
                alert(`Message sent!\nMode: ${payload.mode}\nSubject: ${payload.subject}`);
                setFormData(fd => ({ ...fd, subject: '', description: '' }));
    };
    return (

        <div className={`card ${isActive ? 'card-visible' : ''}`}>
                        <div className='card-header' style={{ background: '#7bfb99', '--clr': '#7bfb99' }}>
                                <h2>Contact</h2>
                                <div className="header-actions">
                                    {isSuperuser && (
                                        <button className="add-social-btn" onClick={() => setShowAddForm(v => !v)} title="Add social media">
                                            <FaPlus />
                                        </button>
                                    )}
                                    <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}><FaBars /></NavLink>
                                </div>
                        </div>
            <div className="card-content">
                <div className="container">
                    <div className="two-column-container">
                                                <div className="column social-column">
                                                        <h2>Connect With Me</h2>
                                                        {showAddForm && isSuperuser && (
                                                            <AddSocialForm
                                                                onSave={async (payload) => {
                                                                    await createSocial(payload);
                                                                    setShowAddForm(false);
                                                                }}
                                                                onCancel={() => setShowAddForm(false)}
                                                            />
                                                        )}

                                                        <div className="social-media-list">
                                                                {smLoading && <p className="loading-text">Loading social links…</p>}
                                                                {smError && <p className="error-text">Error: {smError.message}</p>}
                                                                {Array.isArray(socialMedia) && socialMedia.length === 0 && !smLoading && (
                                                                    <p className="empty-text">No social links configured.</p>
                                                                )}

                                                                {Array.isArray(socialMedia) && socialMedia.map((social, index) => (
                                                                        <div
                                                                                key={social.id}
                                                                                className={`social-item ${index % 2 === 0 ? 'left-logo' : 'right-logo'}`}
                                                                        >
                                                                                {editId === social.id ? (
                                                                                    <EditSocialForm
                                                                                        initial={social}
                                                                                        onSave={async (payload) => {
                                                                                            await updateSocial(social.id, payload);
                                                                                            setEditId(null);
                                                                                        }}
                                                                                        onCancel={() => setEditId(null)}
                                                                                    />
                                                                                ) : (
                                                                                    <> 
                                                                                        {index % 2 === 0 ? (
                                                                                            <>
                                                                                                <div className="social-logo">
                                                                                                        <img src={social.icon_url || social.logo || social.image || ''} alt={social.name} />
                                                                                                </div>
                                                                                                <div className="social-details">
                                                                                                        <h3>{social.name}</h3>
                                                                                                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                                                                                                                {social.handle || social.url}
                                                                                                        </a>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <div className="social-details">
                                                                                                        <h3>{social.name}</h3>
                                                                                                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                                                                                                                {social.handle || social.url}
                                                                                                        </a>
                                                                                                </div>
                                                                                                <div className="social-logo">
                                                                                                        <img src={social.icon_url || social.logo || social.image || ''} alt={social.name} />
                                                                                                </div>
                                                                                            </>
                                                                                        )}

                                                                                        {isSuperuser && (
                                                                                            <div className="social-actions">
                                                                                                <button className="edit-btn" onClick={() => setEditId(social.id)} title="Edit">
                                                                                                    <FaEdit />
                                                                                                </button>
                                                                                                <button className="delete-btn" onClick={async () => {
                                                                                                    if (!window.confirm('Delete this social link?')) return;
                                                                                                    await deleteSocial(social.id);
                                                                                                }} title="Delete">
                                                                                                    <FaTrash />
                                                                                                </button>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}
                                                                        </div>
                                                                ))}
                                                        </div>

                                                        {/* WhatsApp QR for quick contact (dummy number) */}
                                                        <div className="whatsapp-qr">
                                                            <h4>Scan to WhatsApp</h4>
                                                            <img
                                                                src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://wa.me/919876543210"
                                                                alt="WhatsApp QR"
                                                            />
                                                            <p className="qr-text">+91 98765 43210</p>
                                                        </div>
                                                </div>

                                                <div className="column form-column">
                                                        <h2>Send Me a Message</h2>

                                                        {/* Mode toggle: Identified vs Anonymous */}
                                                        <div className="mode-toggle" role="tablist" aria-label="message mode">
                                                            <button
                                                                type="button"
                                                                className={`mode-btn ${formData.mode === 'identified' ? 'active' : ''}`}
                                                                onClick={() => setFormData(fd => ({ ...fd, mode: 'identified' , name: fd.name || 'John Doe', email: fd.email || 'john@example.com', phone: fd.phone || '+91 98765 43210' }))}
                                                            >
                                                                Identify Me
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`mode-btn ${formData.mode === 'anonymous' ? 'active' : ''}`}
                                                                onClick={() => setFormData(fd => ({ ...fd, mode: 'anonymous', name: '', email: '', phone: '' }))}
                                                            >
                                                                Anonymous
                                                            </button>
                                                        </div>

                                                        <form onSubmit={handleSubmit} className="contact-form">
                                                                {formData.mode === 'identified' && (
                                                                    <>
                                                                        <div className="form-group">
                                                                            <label htmlFor="name">Name</label>
                                                                            <input id="name" name="name" value={formData.name} onChange={handleChange} />
                                                                        </div>
                                                                        <div className="form-group">
                                                                            <label htmlFor="email">Email</label>
                                                                            <input id="email" name="email" value={formData.email} onChange={handleChange} />
                                                                        </div>
                                                                        <div className="form-group">
                                                                            <label htmlFor="phone">Phone</label>
                                                                            <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                                                                        </div>
                                                                    </>
                                                                )}

                                                                <div className="form-group">
                                                                        <label htmlFor="subject">Subject</label>
                                                                        <input
                                                                                type="text"
                                                                                id="subject"
                                                                                name="subject"
                                                                                value={formData.subject}
                                                                                onChange={handleChange}
                                                                                required
                                                                        />
                                                                </div>
                                                                <div className="form-group">
                                                                        <label htmlFor="description">Description</label>
                                                                        <textarea
                                                                                id="description"
                                                                                name="description"
                                                                                value={formData.description}
                                                                                onChange={handleChange}
                                                                                required
                                                                        />
                                                                </div>
                                                                <button type="submit" className="send-button">
                                                                        Send Message
                                                                </button>
                                                        </form>
                                                </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Contact;

// ── Add / Edit Forms ───────────────────────────────────────────────────────
const AddSocialForm = ({ onSave, onCancel }) => {
    const [form, setForm] = useState({ name: '', handle: '', url: '', icon: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };
    return (
        <div className="add-social-form">
            <form onSubmit={async (e) => { e.preventDefault(); await onSave(form); }}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name (e.g. GitHub)" required />
                <input name="handle" value={form.handle} onChange={handleChange} placeholder="Handle / display text" />
                <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." required />
                <input name="icon_url" value={form.icon} onChange={handleChange} placeholder="Icon image URL (optional)" />
                <div className="form-actions">
                    <button type="submit" className="save-btn">Add</button>
                    <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

const EditSocialForm = ({ initial, onSave, onCancel }) => {
    const [form, setForm] = useState({ ...initial });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };
    return (
        <div className="edit-social-form">
            <form onSubmit={async (e) => { e.preventDefault(); await onSave(form); }}>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
                <input name="handle" value={form.handle} onChange={handleChange} placeholder="Handle / display text" />
                <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." required />
                <input name="icon_url" value={form.icon || form.icon_url || ''} onChange={handleChange} placeholder="Icon image URL (optional)" />
                <div className="form-actions">
                    <button type="submit" className="save-btn">Save</button>
                    <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};