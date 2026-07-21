import React from 'react';
import './style/AppFooter.css';

const AppFooter = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="brand-group">COFAT</span>
          <span className="brand-name">Group</span>
        </div>

        <div className="footer-copyright">
          <p className="copyright-text">
            © {new Date().getFullYear()} <strong>COFAT Group</strong> | All Rights Reserved
          </p>
        </div>

        <div className="footer-credits">
          <p className="credits-text">
            Developed by <span className="dev-name">Said Bouchouicha</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
