import { NavLink } from 'react-router-dom';
import './CardMenu.css';
import alok from './assets/alok.jpg';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

const navItems = [
  { to: '/contact',    label: 'Contact',    clr: '#7bfb99' },
  { to: '/myzone',     label: 'MyZone',     clr: '#f39c12' },
  { to: '/draw',       label: 'Draw',       clr: '#00c6ff' },
  { to: '/gamezone',   label: 'GameZone',   clr: '#ff6b35' },
  { to: '/other',      label: 'Other',      clr: '#8e44ad' },
  { to: '/experience', label: 'Experience', clr: '#ff6b35' },
  { to: '/home',       label: 'Intro',      clr: '#00ade1' },  // CENTER at index 5
  { to: '/project',    label: 'Project',    clr: '#39bd00' },
  { to: '/blog',       label: 'Blog',       clr: '#ff0dff' },
  { to: '/education',  label: 'Education',  clr: '#ffdd1c' },
  { to: '/skills',     label: 'Skills',     clr: '#ff4443' },
];

const ITEM_HEIGHT = 45; // px gap between each conveyor item

const CardMenu = ({ isNavBarClosed, setIsNavBarClosed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const menuRef = useRef(null);
  const wheelAccum = useRef(0);
  const [scrollIndex, setScrollIndex] = useState(5);  // Intro is at center

  const handleImageClick = () => {
    navigate('/');
  };

  // Keep conveyor centered on the active route
  useEffect(() => {
    const idx = navItems.findIndex(item => item.to === location.pathname);
    if (idx !== -1) setScrollIndex(idx);
  }, [location.pathname]);

  // Wheel + touch conveyor scroll
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    let touchStartY = 0;
    let lastStep = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      wheelAccum.current += e.deltaY;
      const now = Date.now();
      // Only step once per 350ms AND require 80px accumulated scroll
      if (Math.abs(wheelAccum.current) >= 80 && now - lastStep > 350) {
        const dir = wheelAccum.current > 0 ? 1 : -1;
        setScrollIndex(prev => (prev + dir + navItems.length) % navItems.length);
        wheelAccum.current = 0;
        lastStep = now;
      }
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) > 55) {
        const dir = delta > 0 ? 1 : -1;
        setScrollIndex(prev => (prev + dir + navItems.length) % navItems.length);
      }
    };

    menu.addEventListener('wheel', handleWheel, { passive: false });
    menu.addEventListener('touchstart', handleTouchStart, { passive: true });
    menu.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      menu.removeEventListener('wheel', handleWheel);
      menu.removeEventListener('touchstart', handleTouchStart);
      menu.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleMouseMove = (e) => {
      const rect = image.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 15;
      const rotateY = -((centerX - x) / centerX) * 15;

      const shadowX = ((centerX - x) / centerX) * 20;
      const shadowY = ((y - centerY) / centerY) * 20;

      gsap.to(image, {
        rotationX: rotateX,
        rotationY: rotateY,
        boxShadow: `${shadowX}px ${shadowY}px  rgba(255, 255, 255, 5)`,
        transformPerspective: 1000,
        duration: 0.02,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(image, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.02,
      });
    };

    image.addEventListener('mousemove', handleMouseMove);
    image.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      image.removeEventListener('mousemove', handleMouseMove);
      image.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      // className={`menu-container ${isNavBarClosed ? 'menu-container-visible' : 'menu-container-hidden'}`}
      className={`menu-container ${isNavBarClosed ? 'menu-container-visible' : 'menu-container-hidden'}`}
      style={location.pathname === '/' ? { width: '100%' } : { width: "" }}
    >
      <ul ref={menuRef} className="menu">
        {navItems.map((item, i) => {
          // Wrap distance calculation for infinite loop using modulo
          const rawDistance = i - scrollIndex;
          // Choose shorter path around the circle
          let distance;
          if (rawDistance > navItems.length / 2) {
            distance = rawDistance - navItems.length;
          } else if (rawDistance < -navItems.length / 2) {
            distance = rawDistance + navItems.length;
          } else {
            distance = rawDistance;
          }
          
          const absDistance = Math.abs(distance);
          // Only start receding/fading beyond ±3 — inner 7 items are identical
          const fadeDist    = Math.max(0, absDistance - 3);
          // Z-translate only for items beyond ±3; center items stay flat
          const zTranslate  = -(fadeDist * fadeDist) * 40;
          // RotateX: 0 for flat (no tilt) - creates a flat list effect
          const rotateX     = 0;
          // Scale: identical for same absDistance - symmetric convergence
          const scale       = fadeDist > 0 ? Math.max(0.55, 1 - fadeDist * 0.22) : (1 - absDistance * 0.05);
          const opacity     = Math.max(0,    1 - fadeDist * 0.6);

          return (
            <li
              key={item.to}
              style={{
                '--clr': item.clr,
                position: 'absolute',
                top: `${185 + distance * ITEM_HEIGHT}px`,
                left: 0,
                width: 'fit-content',
                transform: `translateZ(${zTranslate}px) rotateX(${rotateX}deg) scale(${scale})`,
                opacity,
                transition: 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease, top 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
                pointerEvents: absDistance > 3 ? 'none' : 'auto',
                transformOrigin: 'left top',
              }}
            >
              <NavLink
                to={item.to}
                data-text={`\u00a0${item.label}`}
                onClick={() => {
                  setScrollIndex(i);
                  setIsNavBarClosed(!isNavBarClosed);
                }}
              >
                &nbsp;{item.label}&nbsp;
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="menu-background">
        <img
          ref={imageRef}
          src={alok}
          alt="Profile"
          onClick={handleImageClick}
          style={{ transformStyle: 'preserve-3d' }}
        />
      </div>
    </div>
  );
};

export default CardMenu;