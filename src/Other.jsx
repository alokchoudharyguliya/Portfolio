import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './Other.css';


const OtherCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/other';

  const otherData = [
    {
      id: 1,
      title: "Hobbies & Interests",
      items: ["Photography", "Gaming", "Reading", "Traveling", "Music Production"]
    },
    {
      id: 2,
      title: "Certifications",
      items: ["AWS Cloud Practitioner", "Google Cloud Associate", "Linux System Administrator", "Docker & Kubernetes Basics"]
    },
    {
      id: 3,
      title: "Community & Recognition",
      items: ["Active GitHub Contributor", "Tech Blog Writer", "Hackathon Participant", "Speaker at Tech Meetups"]
    },
    {
      id: 4,
      title: "Languages",
      items: ["English - Fluent", "Hindi - Native", "Python", "JavaScript", "Java"]
    }
  ];

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`} style={{ background: '#fff', color: '#222', borderRadius: 16, boxShadow: '0 2px 16px 0 rgba(142,68,173,0.07)' }}>
      <div className='card-header' style={{ background: '#8e44ad', '--clr': '#8e44ad', color: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <h2 style={{ color: '#fff', fontWeight: 700 }}>Other</h2>
        <NavLink
          to="/"
          className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
          onClick={() => setIsNavBarClosed(!isNavBarClosed)}
        >
          <FaBars />
        </NavLink>
      </div>
      <div className='card-body other-container'>
        {otherData.map((section) => (
          <div key={section.id} className="other-section">
            <h3 className="section-title">{section.title}</h3>
            <div className="items-list">
              {section.items.map((item, idx) => (
                <div key={idx} className="item-badge">
                  <span className="item-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherCard;
