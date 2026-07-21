import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './style/login.css';
import cofatLogo from '../../../img/cofat - Copie.png';
import backgroundImage from '../../../img/cofat-aut.jpg';
import { useAuth } from '../../../Context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      console.log('Données de connexion:', data);

      // Modifié pour positionner sous la navbar
      Swal.fire({
        icon: 'success',
        title: 'Connexion réussie',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          container: 'swal-below-navbar'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
      });

      // Updated path to ensure consistency with route definition
      navigate('/menu');
    } catch (err) {
      console.error('Erreur de connexion:', err);
      Swal.fire({
        icon: 'error',
        title: 'Échec de la connexion',
        text: err.message || 'Nom d\'utilisateur ou mot de passe incorrect',
        confirmButtonColor: '#007bff',
        customClass: {
          container: 'swal-below-navbar'
        }
      });
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-overlay">
        <div className="login-wrapper">
          <img src={cofatLogo} alt="Logo Cofat" className="login-logo-inside" />
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            {error && <p className="error-message">{error}</p>}
            <p className="register-link">
              Pas encore de compte ?{' '}
              <Link to="/Inscription" className="register-link-text">
                Inscrivez-vous ici
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;