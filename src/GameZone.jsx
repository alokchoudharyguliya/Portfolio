import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import BalloonGame from './games/BalloonGame';
import MahjongGame from './games/MahjongGame';
import './GameZone.css';

const GameZoneCard = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const isActive = location.pathname === '/gamezone';
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    {
      id: 'balloon',
      title: 'Balloon Pop',
      description: 'Solve the math equation and pop the right balloon!',
      icon: '🎈',
      available: true,
    },
    {
      id: 'mahjong',
      title: 'Mahjong Solitaire',
      description: 'Match emoji tile pairs to clear the board!',
      icon: '🀄',
      available: true,
    },
    {
      id: 'quiz',
      title: 'Quick Quiz',
      description: 'Answer questions and earn points',
      icon: '🧩',
      available: false,
    },
    {
      id: '2048',
      title: '2048',
      description: 'Slide and combine numbered tiles',
      icon: '🎲',
      available: false,
    },
  ];

  return (
    <div className={`card ${isActive ? 'card-visible' : ''}`}>
      <div className='card-header' style={{ background: '#ff6b35', '--clr': '#ff6b35' }}>
        <h2>Game Zone</h2>
        <NavLink
          to="/"
          className={isNavBarClosed ? 'cross-button-closed' : 'cross-button-open'}
          onClick={() => setIsNavBarClosed(!isNavBarClosed)}
        >
          <FaBars />
        </NavLink>
      </div>
      <div className={`card-body gamezone-container ${activeGame ? 'game-open' : ''}`}>
        {activeGame ? (
          <div className='game-active-view'>
            <button className='back-to-games' onClick={() => setActiveGame(null)}>
              ← Back to Games
            </button>
            <div className='game-viewport'>
              {activeGame === 'balloon'  && <BalloonGame />}
              {activeGame === 'mahjong'  && <MahjongGame />}
            </div>
          </div>
        ) : (
          <div className='games-grid'>
            {games.map(game => (
              <div key={game.id} className={`game-card ${!game.available ? 'coming-soon' : ''}`}>
                <div className='game-icon'>{game.icon}</div>
                <h3>{game.title}</h3>
                <p className='game-desc'>{game.description}</p>
                {game.available ? (
                  <button className='play-btn' onClick={() => setActiveGame(game.id)}>Play Now</button>
                ) : (
                  <span className='coming-soon-badge'>Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameZoneCard;
