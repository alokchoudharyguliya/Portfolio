import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import './Draw.css';
import React from 'react';
import DrawCard from './DrawCard';
import DrawingGallery from './DrawingGallery';

const DrawSection = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const [selectedDrawing, setSelectedDrawing] = React.useState(null);

  return (
    <div className={`card`}>
      <div className='card-header' style={{ '--clr': '#00c6ff' }}>
        <h2>Draw</h2>
        <NavLink to="/" className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'} onClick={() => setIsNavBarClosed(!isNavBarClosed)}><FaBars /></NavLink>
      </div>

      <div className='card-body draw-section-body'>
        <div className="draw-column">
          {selectedDrawing ? (
            <DrawCard
              drawingId={selectedDrawing.id}
              initialTitle={selectedDrawing.title}
              onClose={() => setSelectedDrawing(null)}
            />
          ) : (
            <DrawCard />
          )}
        </div>

        <div className="gallery-column">
          <DrawingGallery onDrawingSelect={setSelectedDrawing} />
        </div>
      </div>
    </div>
  );
};

export default DrawSection;
