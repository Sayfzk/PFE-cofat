// src/components/user/pages/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBell,
  FaCog,
  FaBars,
  FaTimes,
  FaEnvelope,
  FaSignOutAlt,
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaThLarge
} from 'react-icons/fa';
import logo from '../../../img/cofat - Copie.png';
import { useAuth } from '../../../Context/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationToast from "../../notifications/NotificationToast";
import './style/NavBar.css';

const Navbar = ({ onSidebarToggle, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getUserInitial = () => {
    return user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = () => {
    logout();
    setUserMenuOpen(false);
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.navbar-user')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Section gauche - Logo et toggle */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <div className="logo-link clickable" onClick={handleLogoClick} title="Rafraîchir la page">
              <img src={logo} alt="COFAT Logo" height="40" />
            </div>
          </div>

          <button className="menu-toggle-btn" onClick={onSidebarToggle} title={t('menu', 'Menu')}>
            <FaBars />
          </button>

          <Link to="/menu" className="nav-link menu-button-modern" style={{ marginLeft: '3rem' }}>
            <FaThLarge className="nav-icon" />
            <span>{t('menu', 'Menu')}</span>
          </Link>
        </div>

        {/* Section centre - Navigation (masquée sur mobile) */}
        <div className={`navbar-center ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/contact" className="nav-link">
            <FaEnvelope className="nav-icon" />
            <span>{t('contact', 'Contact')}</span>
          </Link>
        </div>

        {/* Bouton menu mobile */}
        <div className="mobile-menu-button">
          {mobileMenuOpen ? <FaTimes onClick={toggleMobileMenu} /> : <FaBars onClick={toggleMobileMenu} />}
        </div>

        {/* Section droite - Actions */}
        <div className="navbar-right">
          {/* Notifications */}
          <NotificationToast />

          {/* Paramètres */}
          <div className="navbar-settings">
            <button className="settings-button" title={t('settings', 'Paramètres')}>
              <FaCog />
            </button>
          </div>

          {/* Utilisateur */}
          <div className="navbar-user">
            <div
              className="user-info clickable"
              onClick={toggleUserMenu}
              title="Menu utilisateur"
            >
              <div className="user-avatar">
                {getUserInitial()}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.username || 'User'}
                </div>
                <div className="user-role">
                  {t(user.role?.toLowerCase() || 'user', user.role || 'User')}
                </div>
              </div>
              <div className="dropdown-arrow">
                {userMenuOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
            </div>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <FaUser className="dropdown-icon" />
                  <span className="dropdown-username">{user.username || 'User'}</span>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item signout-item"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>{t('signout', 'Déconnexion')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;