import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';

import './style/Sidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = user && user.role === 'admin';

  // Vérifier si l'utilisateur a le rôle Achat
  const isAchat = user && user.role === 'Achat';

  if (!user || !user.isAuthenticated) {
    return null;
  }

  // Filtrer les sites en fonction du rôle de l'utilisateur
  const getSitesForUser = () => {
    const allSites = [
      'Tunis',
      'Mateur',
      'Kairouan',
      'Maroc',
      'Brazil',
      'Cofatec',
      'Egypt',
      'Nogales'
    ];

    return allSites;
  };

  const sites = getSitesForUser();

  return (
    <div
      className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}
      onMouseLeave={() => {
        if (!collapsed) {
          onToggle();
        }
      }}
    >
      <div className="sidebar-header">
        <h2>{!collapsed && 'Menu'}</h2>
        {!collapsed && (
          <button className="collapse-btn" onClick={onToggle}>
            <i className="fas fa-angle-left"></i>
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className={isActive('/standard-equipment') ? 'active' : ''}>
            <Link to="/standard-equipment">
              <i className="fas fa-tachometer-alt"></i>
              {!collapsed && <span>Standard Equipment</span>}
            </Link>
          </li>

          {/* Non Industrial Budget - Accessible à tous les utilisateurs authentifiés */}
          <li className={isActive('/non-industrial-budget') ? 'active' : ''}>
            <Link to="/non-industrial-budget">
              <i className="fas fa-dollar-sign"></i>
              {!collapsed && <span>Non Industrial Budget</span>}
            </Link>
          </li>

          {/* Masquer les sections suivantes pour les utilisateurs Achat */}
          {!isAchat && (
            <>
              <li className={isActive('/equipment') || isActive('/equipement') ? 'active' : ''}>
                <div
                  className="menu-item"
                  onClick={() => toggleExpand('equipment')}
                >
                  <i className="fas fa-cogs"></i>
                  {!collapsed && (
                    <>
                      <span>Equipment Planning</span>
                      <i className={`fas fa-chevron-${expandedItems.equipment ? 'down' : 'right'} arrow`}></i>
                    </>
                  )}
                </div>
                {expandedItems.equipment && !collapsed && (
                  <ul className="submenu">
                    {sites.map((site, index) => (
                      <li key={`equipment-${index}`}>
                        <Link to={`/equipement/${site.toLowerCase()}`}>{site}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li className={isActive('/space') ? 'active' : ''}>
                <div
                  className="menu-item"
                  onClick={() => toggleExpand('space')}
                >
                  <i className="fas fa-building"></i>
                  {!collapsed && (
                    <>
                      <span>Space</span>
                      <i className={`fas fa-chevron-${expandedItems.space ? 'down' : 'right'} arrow`}></i>
                    </>
                  )}
                </div>
                {expandedItems.space && !collapsed && (
                  <ul className="submenu">
                    {sites.map((site, index) => (
                      <li key={`space-${index}`}>
                        <Link to={`/space/${site.toLowerCase()}`}>{site}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              <li className={isActive('/hr') ? 'active' : ''}>
                <div
                  className="menu-item"
                  onClick={() => toggleExpand('hr')}
                >
                  <i className="fas fa-users"></i>
                  {!collapsed && (
                    <>
                      <span>Human Resources</span>
                      <i className={`fas fa-chevron-${expandedItems.hr ? 'down' : 'right'} arrow`}></i>
                    </>
                  )}
                </div>
                {expandedItems.hr && !collapsed && (
                  <ul className="submenu">
                    {sites.map((site, index) => (
                      <li key={`hr-${index}`}>
                        <Link to={`/hr/${site.toLowerCase()}`}>{site}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* CofatGroup - Section dédiée (Admin et User) */}
              {(isAdmin || (user && user.role === 'user')) && (
                <li className={isActive('/cofat-group') ? 'active' : ''}>
                  <div
                    className="menu-item"
                    onClick={() => toggleExpand('cofatgroup')}
                  >
                    <i className="fas fa-network-wired"></i>
                    {!collapsed && (
                      <>
                        <span>CofatGroup</span>
                        <i className={`fas fa-chevron-${expandedItems.cofatgroup ? 'down' : 'right'} arrow`}></i>
                      </>
                    )}
                  </div>
                  {expandedItems.cofatgroup && !collapsed && (
                    <ul className="submenu">
                      <li>
                        <Link to="/cofat-group/equipment">Equipment</Link>
                      </li>
                      <li>
                        <Link to="/cofat-group/space">Space</Link>
                      </li>
                      <li>
                        <Link to="/cofat-group/hr">HR</Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}

              {/* Dashboard Admin (Admin seulement) */}
              {isAdmin && (
                <li className={isActive('/admin/dashboard') ? 'active' : ''}>
                  <Link to="/admin/dashboard">
                    <i className="fas fa-chart-line"></i>
                    {!collapsed && <span>Admin Dashboard</span>}
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
