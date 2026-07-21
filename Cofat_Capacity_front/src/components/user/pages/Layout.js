// src/components/user/pages/Layout.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './NavBar.js';
import Sidebar from './Sidebar';
import { useAuth } from '../../../Context/AuthContext';
import { useAchatRedirect } from '../../../hooks/useAchatRedirect';
import AppFooter from './AppFooter';


import './style/Layout.css';

const Layout = ({ children, showNavbar = true, showSidebar = true, showFooter = true }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { isAchatUser } = useAchatRedirect();
  const isLoggedIn = !!user && !!user.isAuthenticated && !loading;



  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen">
      {isLoggedIn && showNavbar && <Navbar onSidebarToggle={toggleSidebar} />}
      <div className="flex flex-1 overflow-hidden">
        {isLoggedIn && showSidebar && !sidebarCollapsed && (
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        )}
        <main className={`flex-1 overflow-auto ${(!showNavbar && !showSidebar) ? 'p-0' : 'p-4'} ${(!showSidebar || sidebarCollapsed) ? 'sidebar-hidden' : 'sidebar-visible'}`}>

          {children}
        </main>
      </div>
      {showFooter && <AppFooter />}
    </div>
  );
};

export default Layout;