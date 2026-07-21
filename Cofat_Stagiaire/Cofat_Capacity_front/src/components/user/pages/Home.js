import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaDatabase,
  FaChartBar,
  FaSearch,
  FaArrowRight,
  FaUser,
  FaRobot,
  FaGlobe,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import './style/home.css';
import cofatLogo from '../../../img/cofat - Copie.png';

const studies = [
  {
    id: 1,
    title: "Analyse de capacité industrielle",
    researcher: "Dr. Michel Laurent",
    facility: "Laboratoire Alpha",
    type: "Capacité",
    confidenceLevel: 95,
    createdAt: new Date(2025, 2, 15)
  },
  {
    id: 2,
    title: "Étude comparative de performance",
    researcher: "Prof. Sarah Dupont",
    facility: "Centre d'Analyse Beta",
    type: "Benchmark",
    confidenceLevel: 92,
    createdAt: new Date(2025, 3, 10)
  }
];

const formatDate = (date) =>
  new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

export default function Home() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="home-container">

      {/* ── NAVBAR ── */}
      <nav className="navbar" style={{
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.1)' : undefined,
      }}>
        <div className="navbar-container">
          <a href="https://cofat.com/" target="_blank" rel="noopener noreferrer" className="navbar-logo">
            <img src={cofatLogo} alt="Cofat Logo" />
          </a>
          <div className="navbar-actions">
            <Link to="/login" className="home-btn home-btn-outline">
              <FaUser style={{ fontSize: '0.8rem' }} />
              {t('login', 'Connexion')}
            </Link>
            <Link to="/register" className="home-btn home-btn-primary">
              {t('register', "S'inscrire")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Plateforme industrielle nouvelle génération
            </div>

            <h1>
              Optimisez vos capacités,{' '}
              <span className="text-gradient">efficacement.</span>
            </h1>

            <p>
              {t('heroSubtitle', "Pilotez la capacité de tous vos sites COFAT en temps réel. Consolidation, prédiction IA, et analyses avancées en un seul outil.")}
            </p>

            <div className="button-group">
              <Link to="/login" className="home-btn home-btn-primary">
                {t('accessPlatform', 'Accéder à la plateforme')} <FaArrowRight />
              </Link>
              <Link to="/register" className="home-btn home-btn-outline-light">
                {t('createStudy', 'Créer un compte')}
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">7+</div>
                <div className="hero-stat-label">Sites actifs</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Données temps réel</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">2030</div>
                <div className="hero-stat-label">Projections IA</div>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="search-card">
            <h2>{t('findStudy', 'Accès rapide')}</h2>
            <div className="search-form">
              <div className="form-group">
                <label>{t('analysisType', "Type d'analyse")}</label>
                <input type="text" placeholder={t('capacityPerformance', 'Capacité, Space, HR...')} />
              </div>
              <div className="form-group">
                <label>{t('sector', 'Site')}</label>
                <input type="text" placeholder={t('industryResearch', 'Tunis, Mateur, Kairouan...')} />
              </div>
              <div className="form-group">
                <label>{t('date', 'Période')}</label>
                <input type="date" />
              </div>
              <Link to="/login" className="home-btn home-btn-full">
                <FaSearch style={{ fontSize: '0.85rem' }} />
                {t('search', 'Rechercher')}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="section-header-block">
          <div className="section-tag">Fonctionnalités</div>
          <h2 className="section-title">
            {t('whyChooseCofat', 'Pourquoi Cofat Capacity Study ?')}
          </h2>
        </div>
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaDatabase className="feature-icon" />
            </div>
            <h3>{t('massiveData', 'Consolidation Multi-Sites')}</h3>
            <p>{t('massiveDataDesc', 'Regroupez les données Space et RH de tous vos sites COFAT en une vue consolidée, claire et exportable.')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaRobot className="feature-icon" />
            </div>
            <h3>{t('aiPrediction', 'Prédiction IA')}</h3>
            <p>{t('aiPredictionDesc', "Notre assistant IA analyse les tendances et projette les effectifs et l'occupation jusqu'en 2030 par régression linéaire.")}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaChartBar className="feature-icon" />
            </div>
            <h3>{t('realTimeViz', 'Visualisation en temps réel')}</h3>
            <p>{t('realTimeVizDesc', 'Suivez vos analyses avec des graphiques dynamiques, interactifs et synchronisés avec vos données de production.')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaGlobe className="feature-icon" />
            </div>
            <h3>{t('globalSites', 'Sites Internationaux')}</h3>
            <p>{t('globalSitesDesc', 'Couvrez tous vos sites : Tunis, Mateur, Kairouan, Mexique, Brésil, Égypte, Maroc et bien plus encore.')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaShieldAlt className="feature-icon" />
            </div>
            <h3>{t('secureData', 'Sécurité & Rôles')}</h3>
            <p>{t('secureDataDesc', 'Contrôle d\'accès par rôle (Admin, Super Admin, Utilisateur) pour protéger la confidentialité des données.')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaSearch className="feature-icon" />
            </div>
            <h3>{t('validatedMethods', 'Exports & Rapports')}</h3>
            <p>{t('validatedMethodsDesc', 'Exportez en Excel et PDF avec mise en forme professionnelle pour vos rapports de comité de direction.')}</p>
          </div>

        </div>
      </section>

      {/* ── RECENT STUDIES ── */}
      <section className="studies-section">
        <div className="section-header">
          <h2>{t('recentStudies', 'Analyses récentes')}</h2>
          <Link to="/login" className="view-all-link">
            {t('viewAll', 'Voir toutes')} <FaArrowRight />
          </Link>
        </div>
        <div className="studies-grid">
          {studies.map((study) => (
            <div className="study-card" key={study.id}>
              <div className="study-header">
                <div className="study-icon-wrapper">
                  <FaChartBar className="study-icon" />
                </div>
                <div>
                  <div className="study-badge">{study.type}</div>
                  <h3>{study.title}</h3>
                </div>
              </div>
              <div className="study-meta">
                <p><strong>{t('date', 'Date')} :</strong> {formatDate(study.createdAt)}</p>
                <p><strong>{t('responsible', 'Responsable')} :</strong> {study.researcher}</p>
                <p><strong>{t('site', 'Site')} :</strong> {study.facility}</p>
                <p><strong>{t('confidence', 'Fiabilité')} :</strong>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>
                    {' '}<FaCheckCircle style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {study.confidenceLevel}%
                  </span>
                </p>
              </div>
              <Link to={`/login`} className="home-btn home-btn-full">
                {t('viewDetails', 'Voir les détails')} <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="process-section">
        <h2 className="section-title">
          {t('howItWorks', 'Comment ça fonctionne ?')}
        </h2>
        <div className="process-grid">
          <div className="process-card">
            <div className="step">1</div>
            <h3>{t('defineStudy', 'Connectez-vous')}</h3>
            <p>{t('defineStudyDesc', 'Accédez à la plateforme avec vos identifiants sécurisés. Votre rôle détermine votre niveau d\'accès.')}</p>
          </div>
          <div className="process-card">
            <div className="step">2</div>
            <h3>{t('launchAnalysis', 'Consultez vos modules')}</h3>
            <p>{t('launchAnalysisDesc', 'Naviguez entre Space, RH, Équipements et Budget. Chaque module offre une vue complète avec consolidation globale.')}</p>
          </div>
          <div className="process-card">
            <div className="step">3</div>
            <h3>{t('exploitResults', 'Analysez & Décidez')}</h3>
            <p>{t('exploitResultsDesc', 'Utilisez les graphiques IA, les exports et l\'assistant intelligent pour prendre des décisions éclairées.')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>{t('readyToOptimize', 'Prêt à piloter vos capacités ?')}</h2>
        <p>{t('joinUsToday', "Rejoignez la plateforme COFAT Capacity Study et transformez vos données industrielles en décisions stratégiques.")}</p>
        <div className="cta-buttons">
          <Link to="/register" className="home-btn home-btn-secondary">
            {t('registerFree', "Créer un compte")}
          </Link>
          <Link to="/login" className="home-btn home-btn-outline-light">
            {t('learnMore', 'Se connecter')} <FaArrowRight />
          </Link>
        </div>
      </section>

    </div>
  );
}
