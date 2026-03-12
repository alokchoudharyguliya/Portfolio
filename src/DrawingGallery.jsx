import React from 'react';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useDrawings from './hooks/useDrawings';
import './DrawingGallery.css';

const DrawingGallery = ({ onDrawingSelect = null }) => {
  const {
    drawings,
    pagination,
    loading,
    error,
    page,
    search,
    ordering,
    goToPage,
    updateSearch,
    updateOrdering,
  } = useDrawings();

  // Debug: log what we're receiving
  console.log('🎨 DrawingGallery - drawings:', drawings, 'loading:', loading, 'error:', error);

  const handleSearchChange = (e) => {
    updateSearch(e.target.value);
  };

  const handleOrderingChange = (e) => {
    updateOrdering(e.target.value);
  };

  const handlePrevPage = () => {
    if (pagination.previous) goToPage(page - 1);
  };

  const handleNextPage = () => {
    if (pagination.next) goToPage(page + 1);
  };

  const totalPages = Math.ceil((pagination.count || 0) / 24);

  return (
    <div className="drawing-gallery">
      <h2>My Drawings</h2>

      {/* Search & Filter Controls */}
      <div className="gallery-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search drawings..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <select
          className="sort-dropdown"
          value={ordering}
          onChange={handleOrderingChange}
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="title">Name (A-Z)</option>
          <option value="-title">Name (Z-A)</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && <div className="gallery-loading">Loading drawings...</div>}

      {/* Error State */}
      {error && (
        <div className="gallery-error">
          Failed to load drawings. {error.message}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && drawings.length === 0 && (
        <div className="gallery-empty">
          <p>No drawings yet. Start sketching above! 🎨</p>
        </div>
      )}

      {/* Thumbnail Grid */}
      {!loading && !error && drawings.length > 0 && (
        <>
          <div className="gallery-grid">
            {drawings.map((drawing) => {
              console.log('🖼️ Rendering card:', drawing.id, drawing.title, 'URL:', drawing.thumbnail_url);
              return (
              <div
                key={drawing.id}
                className="gallery-card"
                onClick={() => onDrawingSelect && onDrawingSelect(drawing)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDrawingSelect && onDrawingSelect(drawing);
                  }
                }}
              >
                <div className="gallery-thumbnail">
                  {drawing.thumbnail_url ? (
                    <img
                      src={drawing.thumbnail_url}
                      alt={drawing.title}
                      className="thumbnail-image"
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <span>No preview</span>
                    </div>
                  )}
                </div>
                <div className="gallery-card-info">
                  <h3 className="gallery-title">{drawing.title}</h3>
                  <p className="gallery-meta">
                    {new Date(drawing.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="gallery-pagination">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={!pagination.previous}
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={!pagination.next}
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DrawingGallery;
