import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import './style/UpdateNotification.css';

const UpdateNotification = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const hasSeenUpdate = localStorage.getItem('hasSeenUpdate_v3');
        if (!hasSeenUpdate) {
            // Petit délai pour l'animation d'entrée
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        if (dontShowAgain) {
            localStorage.setItem('hasSeenUpdate_v3', 'true');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="update-notification-overlay">
            <div className="update-notification-card">
                <button className="close-button" onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className="notification-header">
                    <div className="icon-wrapper">
                        <Bell size={24} />
                    </div>
                    <div className="header-text">
                        <h3>Quoi de neuf ?</h3>
                        <span className="date">Mise à jour du 19 Dec 2025</span>
                    </div>
                </div>

                <div className="notification-content">
                    <div className="update-item">
                        <CheckCircle size={16} className="check-icon" />
                        <p><strong>Standard Equipment :</strong> Design Premium, Traduction FR/EN, Mode Sombre, Export Excel/PDF.</p>
                    </div>
                    <div className="update-item">
                        <CheckCircle size={16} className="check-icon" />
                        <p><strong>Non Industrial Budget :</strong> Correction des bugs d'affichage et optimisation de l'interface.</p>
                    </div>
                    <div className="update-item">
                        <CheckCircle size={16} className="check-icon" />
                        <p><strong>Global Application :</strong> Nouveau Menu Latéral, Sécurisation des routes, Amélioration UX.</p>
                    </div>
                    <div className="update-item">
                        <CheckCircle size={16} className="check-icon" />
                        <p><strong>Performance :</strong> Optimisation globale et corrections sur tous les modules.</p>
                    </div>
                </div>

                <div className="notification-footer">
                    <label className="dont-show-label">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        Ne plus afficher
                    </label>
                    <button className="action-button" onClick={handleClose}>
                        Compris <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotification;
