import "./Blog.css";
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import useBlogs from './hooks/useBlogs';
import { usePermissions } from './contexts/PermissionsProvider';

const BlogCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/blog';
  const { blogs, loading, error, refetch, createBlog, updateBlog, deleteBlog } = useBlogs();
  const { isSuperuser } = usePermissions();

  const createInitialHtml = '<h1>My Blog Post</h1>\n<p>\n\tWrite your content here...\n</p>';
  const createInitialCss = 'h1 { color: #333; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }\n' +
    'p { font-size: 16px; line-height: 1.6; font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }';
  const createInitialTitle = 'My Blog Post';

  // Create editor state (independent placeholders)
  const [createHtml, setCreateHtml] = useState(createInitialHtml);
  const [createCss, setCreateCss] = useState(createInitialCss);
  const [createTitle, setCreateTitle] = useState(createInitialTitle);

  // Edit modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editHtml, setEditHtml] = useState('');
  const [editCss, setEditCss] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [modalSize] = useState({ width: 700, height: 600 });

  const openForEdit = (blog) => {
    setEditingBlog(blog);
    setEditHtml(blog.html || '');
    setEditCss(blog.css || '');
    setEditTitle(blog.title || '');
    setIsEditorOpen(true);
  };

  const handleCreate = async () => {
    try {
      await createBlog({ title: createTitle, html: createHtml, css: createCss });
      setCreateHtml(createInitialHtml);
      setCreateCss(createInitialCss);
      setCreateTitle(createInitialTitle);
    } catch (err) {
      console.error('Failed to create blog', err);
      alert('Failed to create blog');
    }
  };

  const handleUpdate = async () => {
    if (!editingBlog) return;
    try {
      await updateBlog(editingBlog.id, { title: editTitle, html: editHtml, css: editCss });
      setIsEditorOpen(false);
      setEditingBlog(null);
    } catch (err) {
      console.error('Failed to update blog', err);
      alert('Failed to update blog');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteBlog(id);
    } catch (err) {
      console.error('Failed to delete blog', err);
      alert('Failed to delete blog');
    }
  };

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ff0dff', '--clr': '#ff0dff' }}>
        <h2>Blog Editor</h2>
        <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}>
          <FaBars />
        </NavLink>
      </div>

      <div className='card-body'>
        <div className="blog-editor-container">
          {isSuperuser && (
            <div className="blog-controls">
              <input
                type="text"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
                placeholder="Blog post title"
                className="blog-title-input"
              />
              <button onClick={handleCreate} className="save-button">Create Blog</button>
            </div>
          )}

          <div className="blog-editor-columns">
            <div className="editor-column">
              <h3>HTML Editor</h3>
              <textarea value={createHtml} onChange={(e) => setCreateHtml(e.target.value)} className="code-editor html-editor" spellCheck="false" />
            </div>

            <div className="editor-column">
              <h3>CSS Editor</h3>
              <textarea value={createCss} onChange={(e) => setCreateCss(e.target.value)} className="code-editor css-editor" spellCheck="false" />
            </div>

            <div className="preview-column">
              <h3>Live Preview</h3>
              <div className="blog-preview">
                <iframe title="blog-preview" srcDoc={`<!DOCTYPE html><html><head><style>${createCss}</style></head><body>${createHtml}</body></html>`} className="preview-iframe" />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isEditorOpen && (
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsEditorOpen(false); setEditingBlog(null); }}>
              <motion.div className="edit-modal" style={{ width: modalSize.width + 'px', height: modalSize.height + 'px' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                  <h2>Edit Blog: {editingBlog?.title}</h2>
                  <div className="header-controls">
                    <button onClick={() => { setIsEditorOpen(false); setEditingBlog(null); }} className="close-button">&times;</button>
                  </div>
                </div>

                <div className="blog-editor-container" style={{ height: 'calc(100% - 60px)' }}>
                  <div className="blog-controls">
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Blog post title" className="blog-title-input" />
                    <button onClick={handleUpdate} className="save-button" disabled={loading}>{loading ? 'Saving...' : 'Update Blog'}</button>
                  </div>

                  <div className="blog-editor-columns" style={{ height: 'calc(100% - 50px)' }}>
                    <div className="editor-column">
                      <h3>HTML Editor</h3>
                      <textarea value={editHtml} onChange={(e) => setEditHtml(e.target.value)} className="code-editor html-editor" spellCheck="false" />
                    </div>

                    <div className="editor-column">
                      <h3>CSS Editor</h3>
                      <textarea value={editCss} onChange={(e) => setEditCss(e.target.value)} className="code-editor css-editor" spellCheck="false" />
                    </div>

                    <div className="preview-column">
                      <h3>Live Preview</h3>
                      <div className="blog-preview">
                        <iframe title="blog-preview-edit" srcDoc={`<!DOCTYPE html><html><head><style>${editCss}</style></head><body>${editHtml}</body></html>`} className="preview-iframe" />
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="blog-posts-section">
          <h2>Saved Blog Posts</h2>
          {error && <div className="error-message">{error}</div>}
          {loading && blogs.length === 0 ? (
            <div>Loading blogs...</div>
          ) : (
            <div className="blog-posts-grid">
              {blogs.map((blog) => (
                <div key={blog.id} className="blog-post-card">
                  <div className="blog-post-card-top-bar">
                    <div className="blog-title" title={blog.title}>{blog.title}</div>

                    {isSuperuser && (
                      <div className="blog-actions">
                        <button className="action-btn edit" aria-label="Edit blog" onClick={() => openForEdit(blog)}>
                          <FiEdit size={18} />
                        </button>
                        <button className="action-btn delete" aria-label="Delete blog" onClick={() => handleDelete(blog.id)}>
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="blog-post-preview">
                    <iframe title={`blog-preview-${blog.id}`} srcDoc={`<!DOCTYPE html><html><head><style>${blog.css}</style></head><body>${blog.html}</body></html>`} />
                  </div>
                  <div className="blog-post-meta">
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div >
  );
};

export default BlogCard;