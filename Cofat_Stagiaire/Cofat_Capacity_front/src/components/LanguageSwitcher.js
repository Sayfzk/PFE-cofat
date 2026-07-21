// src/components/LanguageSwitcher.js
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    {
      code: 'fr',
      name: 'Français',
      flag: '🇫🇷',
      nativeName: 'Français'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      nativeName: 'English'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Forcer le rechargement des traductions
    setTimeout(() => {
      window.dispatchEvent(new Event('languageChanged'));
    }, 100);
  };

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button 
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('changeLanguage', 'Changer de langue')}
      >
        <FaGlobe className="globe-icon" />
        <span className="current-language">
          <span className="flag">{currentLanguage.flag}</span>
          <span className="language-code">{currentLanguage.code.toUpperCase()}</span>
        </span>
        <FaChevronDown className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="dropdown-header">
            <FaGlobe className="header-icon" />
            <span>{t('selectLanguage', 'Sélectionner la langue')}</span>
          </div>
          
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${language.code === i18n.language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <span className="flag">{language.flag}</span>
              <div className="language-info">
                <span className="language-name">{language.nativeName}</span>
                <span className="language-code-small">{language.code.toUpperCase()}</span>
              </div>
              {language.code === i18n.language && (
                <div className="active-indicator">✓</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
