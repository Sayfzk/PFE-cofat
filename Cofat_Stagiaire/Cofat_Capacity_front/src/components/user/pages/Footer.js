import React from 'react';
import './style/footer.css';

// Assurez-vous de fournir le chemin correct vers votre image
import Img from "../../../img/cofat - Copie.png";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3>COFATHub</h3>
          <p>La plateforme tout-en-un pour optimiser vos opérations.</p>
        </div>
        <div className="footer-right">
          <img src={Img} alt="Cofat Logo" className="footer-logo-img" />
        </div>
      </div>
      <div className="footer-bottom">
        <p>Tous droits réservés © 2025 | COFAT Group
          Développé par <a href="www.linkedin.com/in/said-bouchouicha-06119317b" target="_blank" rel="noopener noreferrer">Said bouchouicha</a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
