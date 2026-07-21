// src/hooks/useLanguage.js
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook personnalisé pour gérer les changements de langue
 * Assure une mise à jour fiable de l'interface lors du changement de langue
 */
export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'fr');
  const [isChanging, setIsChanging] = useState(false);

  // Langues disponibles
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' }
  ];

  // Obtenir la langue courante
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // Changer de langue avec gestion d'état
  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return;

    console.log(`🌐 Changement de langue: ${currentLanguage} -> ${languageCode}`);
    setIsChanging(true);

    try {
      // Changer la langue dans i18next
      await i18n.changeLanguage(languageCode);
      
      // Persister dans localStorage
      localStorage.setItem('i18nextLng', languageCode);
      
      // Mettre à jour l'état local
      setCurrentLanguage(languageCode);
      
      // Déclencher un événement personnalisé pour forcer la mise à jour
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { 
          from: currentLanguage, 
          to: languageCode,
          timestamp: Date.now()
        }
      }));

      console.log(`✅ Langue changée avec succès: ${languageCode}`);
    } catch (error) {
      console.error('❌ Erreur lors du changement de langue:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Écouter les changements de langue
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail?.to || i18n.language;
      if (newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
        console.log(`🔄 Langue mise à jour dans useLanguage: ${newLanguage}`);
      }
    };

    // Écouter l'événement personnalisé
    window.addEventListener('languageChanged', handleLanguageChange);

    // Écouter les changements i18next
    const handleI18nChange = (lng) => {
      if (lng !== currentLanguage) {
        setCurrentLanguage(lng);
      }
    };

    i18n.on('languageChanged', handleI18nChange);

    // Cleanup
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleI18nChange);
    };
  }, [currentLanguage, i18n]);

  // Initialiser la langue au montage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'fr';
    if (savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
  }, []);

  return {
    currentLanguage,
    languages,
    getCurrentLanguage,
    changeLanguage,
    isChanging,
    t
  };
};

export default useLanguage;
