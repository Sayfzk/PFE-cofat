import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Bell, BellOff } from 'lucide-react';
import notificationService from '../../services/NotificationService';
import './NotificationToast.css';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showCenter, setShowCenter] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const processedNotifs = React.useRef(new Set());

  useEffect(() => {
    // Écouter les notifications
    const unsubscribe = notificationService.addListener((newNotifications) => {
      setNotifications(newNotifications);

      // Afficher les nouvelles notifications en toast (seulement celles très récentes)
      const recentNotifications = newNotifications.filter(notif => {
        const now = new Date();
        const notifTime = new Date(notif.timestamp);
        const diff = now - notifTime;

        // On autorise maintenant les toasts pour les notifications chargées ('loaded')
        // SI elles sont apparues il y a moins de 8 secondes (augmentation pour délai backend)
        // ET si elles n'ont pas déjà été traitées par un toast
        const isRecent = diff < 8000;
        const alreadyProcessed = processedNotifs.current.has(notif.id);

        if (isRecent && !alreadyProcessed) {
          processedNotifs.current.add(notif.id);
          return true;
        }
        return false;
      });

      recentNotifications.forEach(notif => {
        showToast(notif);

        // Auto-marquer comme lu après 7 secondes pour les succès/info 
        // afin de "régler le compteur" comme demandé par le client
        // On NE marque PAS comme lu les "warnings" (suppressions) car ce sont des actions critiques
        if (['success', 'info'].includes(notif.type)) {
          setTimeout(() => {
            notificationService.markAsReadAPI(notif.id);
          }, 7000);
        }
      });
    });

    // Charger les notifications existantes au démarrage
    const loadExistingNotifications = async () => {
      try {
        await notificationService.loadNotificationsFromAPI();
      } catch (error) {
        console.error('Erreur lors du chargement des notifications existantes:', error);
      }
    };

    // Charger après un court délai pour laisser l'authentification se mettre en place
    const timeoutId = setTimeout(loadExistingNotifications, 1000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const showToast = (notification) => {
    const toastId = `toast-${notification.id}`;
    const newToast = {
      id: toastId,
      ...notification,
      showing: true
    };

    setToasts(prev => [...prev, newToast]);

    // Jouer un son si activé
    if (soundEnabled) {
      playNotificationSound(notification.type);
    }

    // Auto-suppression du toast après 5 secondes
    setTimeout(() => {
      removeToast(toastId);
    }, 5000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const playNotificationSound = (type) => {
    // Créer un son simple selon le type
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Fréquences différentes selon le type
    const frequencies = {
      'success': 800,
      'error': 300,
      'warning': 600,
      'info': 400
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 400, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="notification-icon" />;
      case 'warning':
        return <AlertTriangle className="notification-icon" />;
      case 'error':
        return <AlertCircle className="notification-icon" />;
      case 'info':
      default:
        return <Info className="notification-icon" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;

    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}j`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Badge de notification dans la navbar */}
      <div className="notification-badge-container">
        <button
          className="notification-bell"
          onClick={() => setShowCenter(!showCenter)}
          title={`${unreadCount} notification(s) non lue(s)`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Centre de notifications */}
      {showCenter && (
        <div className="notification-center">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-controls">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
                title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
              >
                {soundEnabled ? <Bell size={16} /> : <BellOff size={16} />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={() => notificationService.markAllAsRead()}
                  className="mark-all-read"
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                onClick={() => setShowCenter(false)}
                className="close-center"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Info size={48} />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type}`}
                  onClick={() => notificationService.markAsReadAPI(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-main">
                      {getTypeIcon(notification.type)}
                      <div className="notification-text">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        {notification.description && (
                          <div className="notification-description">{notification.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
                      <span className="notification-module">{notification.module}</span>
                    </div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                onClick={() => notificationService.clearAllNotifications()}
                className="clear-all"
              >
                Effacer toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le centre */}
      {showCenter && (
        <div
          className="notification-overlay"
          onClick={() => setShowCenter(false)}
        />
      )}

      {/* Toasts flottants */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`notification-toast ${toast.type} ${toast.showing ? 'show' : ''}`}
          >
            <div className="toast-content">
              {getTypeIcon(toast.type)}
              <div className="toast-text">
                <div className="toast-title">{toast.title}</div>
                <div className="toast-message">{toast.message}</div>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationToast;