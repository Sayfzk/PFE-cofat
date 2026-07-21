// src/components/common/TranslatedMessage.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Snackbar, Typography } from '@mui/material';

/**
 * Composant pour afficher des messages traduits avec différents types
 */
export const TranslatedMessage = ({ 
  messageKey, 
  type = 'info', 
  fallback = '', 
  values = {},
  component = 'typography',
  ...props 
}) => {
  const { t } = useTranslation();
  
  const translatedMessage = t(messageKey, fallback, values);
  
  if (component === 'alert') {
    return (
      <Alert severity={type} {...props}>
        {translatedMessage}
      </Alert>
    );
  }
  
  if (component === 'snackbar') {
    return (
      <Snackbar {...props}>
        <Alert severity={type}>
          {translatedMessage}
        </Alert>
      </Snackbar>
    );
  }
  
  return (
    <Typography {...props}>
      {translatedMessage}
    </Typography>
  );
};

/**
 * Hook personnalisé pour les messages d'erreur traduits
 */
export const useTranslatedMessages = () => {
  const { t } = useTranslation();
  
  const getErrorMessage = (errorKey, fallback = 'Une erreur est survenue') => {
    return t(errorKey, fallback);
  };
  
  const getSuccessMessage = (successKey, fallback = 'Opération réussie') => {
    return t(successKey, fallback);
  };
  
  const getInfoMessage = (infoKey, fallback = 'Information') => {
    return t(infoKey, fallback);
  };
  
  const getWarningMessage = (warningKey, fallback = 'Attention') => {
    return t(warningKey, fallback);
  };
  
  return {
    getErrorMessage,
    getSuccessMessage,
    getInfoMessage,
    getWarningMessage,
    t
  };
};

/**
 * Composant pour les messages d'erreur spécifiques
 */
export const ErrorMessage = ({ errorKey, fallback, ...props }) => (
  <TranslatedMessage 
    messageKey={errorKey} 
    type="error" 
    component="alert"
    fallback={fallback}
    {...props} 
  />
);

/**
 * Composant pour les messages de succès spécifiques
 */
export const SuccessMessage = ({ successKey, fallback, ...props }) => (
  <TranslatedMessage 
    messageKey={successKey} 
    type="success" 
    component="alert"
    fallback={fallback}
    {...props} 
  />
);

/**
 * Composant pour les messages d'information spécifiques
 */
export const InfoMessage = ({ infoKey, fallback, ...props }) => (
  <TranslatedMessage 
    messageKey={infoKey} 
    type="info" 
    component="alert"
    fallback={fallback}
    {...props} 
  />
);

/**
 * Composant pour les messages d'avertissement spécifiques
 */
export const WarningMessage = ({ warningKey, fallback, ...props }) => (
  <TranslatedMessage 
    messageKey={warningKey} 
    type="warning" 
    component="alert"
    fallback={fallback}
    {...props} 
  />
);

/**
 * Composant pour les boutons traduits
 */
export const TranslatedButton = ({ 
  textKey, 
  fallback, 
  children, 
  component: Component = 'button',
  ...props 
}) => {
  const { t } = useTranslation();
  
  const buttonText = textKey ? t(textKey, fallback) : children;
  
  return (
    <Component {...props}>
      {buttonText}
    </Component>
  );
};

/**
 * Composant pour les titres traduits
 */
export const TranslatedTitle = ({ 
  titleKey, 
  fallback, 
  level = 'h2',
  ...props 
}) => {
  const { t } = useTranslation();
  
  return (
    <Typography variant={level} {...props}>
      {t(titleKey, fallback)}
    </Typography>
  );
};

export default TranslatedMessage;
