import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CardMenu from './CardMenu';
import { HomeCard, SkillsCard, EducationCard, ExperienceCard, OtherCard, MyZoneCard, GameZoneCard, ProjectCard, BlogCard, ContactCard } from './Cards';
import DrawCard from './Draw';
import { useState, useEffect } from 'react';
import ConsentBanner from './components/ConsentBanner';
import { ensureAnonId, hasConsent, sendPageView } from './lib/tracker';

function App() {
  const [isNavBarClosed, setIsNavBarClosed] = useState(true);
  // send a pageview on initial load (if consent present)
  useEffect(() => {
    if (hasConsent()) {
      ensureAnonId()
      sendPageView(window.location.pathname)
    }
  }, [])
  return (
    <div style={{
      margin: 0,
      // width:"100%",
      display: 'flex',
      flexDirection: 'row',
      // alignItems: 'end',
      justifyContent: 'center',
      // // height: '100vh',
      color: 'white',
      overflow: 'hidden',
      // textAlign: 'center',
      padding: '2rem',
      // height: 'calc(110vh - 0px)'
    }}>
      <Router>
        {/* Track route changes and send pageviews when consented */}
        <RouteTracker />
        <div style={{
          // display: 'flex', flexDirection: 'column' 
          height: '100%'
        }}>
          <CardMenu
            isNavBarClosed={isNavBarClosed}
            setIsNavBarClosed={setIsNavBarClosed}  // ✅ Pass the setter directly
          />
        </div>

        <Routes>
          {/* Pass UPDATED STATE CONSISTENTLY to all cards */}
          {/* <Route path="/" element={<CardMenu isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} /> */}
          <Route path="/home" element={<HomeCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/skills" element={<SkillsCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/education" element={<EducationCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/experience" element={<ExperienceCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/other" element={<OtherCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/myzone" element={<MyZoneCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/gamezone" element={<GameZoneCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/blog" element={<BlogCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/project" element={<ProjectCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/draw" element={<DrawCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
          <Route path="/contact" element={<ContactCard isNavBarClosed={isNavBarClosed} setIsNavBarClosed={setIsNavBarClosed} />} />
        </Routes>
        <ConsentBanner />
      </Router>
    </div>
  );
}

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (hasConsent()) sendPageView(location.pathname)
  }, [location])

  return null
}

export default App;