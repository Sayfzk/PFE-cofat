import React, { useState, useEffect } from 'react';
import "./style/ScrollUp.css"; // Style pour le bouton

const ScrollUp = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    setIsVisible(window.scrollY > 50);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button 
      className={`scroll-up ${isVisible ? 'show' : ''}`} 
      onClick={scrollToTop}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="white">
        <path d="M12 4l-8 8h6v8h4v-8h6z" />
      </svg>
    </button>
  );
};

export default ScrollUp;
