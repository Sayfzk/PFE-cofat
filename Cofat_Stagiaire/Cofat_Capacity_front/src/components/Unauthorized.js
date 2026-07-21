import React from 'react';
import "./user/pages/style/Unauthorized.css"
const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h1 className="unauthorized-title">Accès non autorisé</h1>
        <p className="unauthorized-message">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
        <a href="http://172.23.23.31:9001/SiteTable" className="unauthorized-link">
          Retourner vers Admin
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
