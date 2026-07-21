// components/AddEquipmentButton.js
import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AddEquipmentButton = ({ onEquipmentAdded }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentCode: '',
    nom: '',
    referenceEquipment: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const imageInputRef = useRef(null);

  const handleClickOpen = () => {
    setOpen(true);
    resetForm();
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      equipmentId: '',
      equipmentCode: '',
      nom: '',
      referenceEquipment: '',
      image: null,
    });
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const validationResult = validateFile(file, name);
      if (validationResult.isValid) {
        setFormData((prev) => ({ ...prev, [name]: file }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: validationResult.error }));
        e.target.value = '';
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateFile = (file, fileType) => {
    const validTypes = {
      image: {
        mimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
        extensions: ['.png', '.jpg', '.jpeg'],
        maxSize: 5 * 1024 * 1024,
        label: 'Image (PNG, JPG, JPEG)',
      }
    };
    const fileConfig = validTypes[fileType];
    if (!fileConfig) return { isValid: false, error: 'Type de fichier non reconnu' };
    if (file.size > fileConfig.maxSize) return { isValid: false, error: `Fichier trop volumineux. Taille max: ${fileConfig.maxSize / (1024 * 1024)}MB` };
    const fileName = file.name.toLowerCase();
    const hasValidExtension = fileConfig.extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
    if (!hasValidExtension) return { isValid: false, error: `Format non valide. Accepté: ${fileConfig.label}` };
    if (!fileConfig.mimeTypes.includes(file.type)) return { isValid: false, error: `Type MIME non valide. Type: ${file.type}` };
    return { isValid: true };
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.equipmentId.trim()) newErrors.equipmentId = 'ID de l\'équipement requis';
    if (!formData.equipmentCode.trim()) newErrors.equipmentCode = 'Code de l\'équipement requis';
    if (!formData.nom.trim()) newErrors.nom = 'Nom de l\'équipement requis';
    if (!formData.referenceEquipment.trim()) newErrors.referenceEquipment = 'Référence équipement requise';
    if (!formData.image) newErrors.image = 'Image requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = new FormData();
    payload.append('equipmentId', formData.equipmentId.trim());
    payload.append('equipmentCode', formData.equipmentCode.trim());
    payload.append('nom', formData.nom.trim());
    payload.append('referenceEquipment', formData.referenceEquipment.trim());
    payload.append('image', formData.image);

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://172.23.23.31:9001/api/equipment', {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSuccessMessage('Équipement ajouté avec succès !');
        if (onEquipmentAdded) onEquipmentAdded(result.data);
        setTimeout(handleClose, 1500);
      } else {
        setErrorMessage(result.message || result.errors?.join(', ') || 'Erreur lors de l\'ajout de l\'équipement');
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      setErrorMessage('Erreur de connexion au serveur. Veuillez vérifier votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({ fileType, label, acceptedFormats, currentFile, error, inputRef }) => (
    <Box sx={{
      border: error ? '2px dashed #f44336' : '2px dashed #ccc',
      p: 2,
      borderRadius: 2,
      textAlign: 'center',
      backgroundColor: currentFile ? '#f0f8f0' : 'transparent'
    }}>
      <input
        type="file"
        accept={acceptedFormats}
        name={fileType}
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <Button
        variant="outlined"
        component="span"
        onClick={() => inputRef.current?.click()}
        startIcon={currentFile ? <CheckCircleIcon /> : <CloudUploadIcon />}
        color={currentFile ? 'success' : 'primary'}
      >
        {label}
      </Button>
      <Typography variant="body2" sx={{ mt: 1, color: currentFile ? 'green' : 'text.secondary' }}>
        {currentFile ? `✓ ${currentFile.name}` : acceptedFormats.replace(/\./g, '').toUpperCase()}
      </Typography>
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </Box>
  );

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1.5 }}
      >
        Ajouter Équipement
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un nouvel équipement</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez remplir les informations du nouvel équipement.
          </DialogContentText>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField
              label="Equipment ID"
              name="equipmentId"
              placeholder="Ex: EQ001"
              value={formData.equipmentId}
              onChange={handleChange}
              error={!!errors.equipmentId}
              helperText={errors.equipmentId}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Code Équipement"
              name="equipmentCode"
              placeholder="Ex: CODE001"
              value={formData.equipmentCode}
              onChange={handleChange}
              error={!!errors.equipmentCode}
              helperText={errors.equipmentCode}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Nom Équipement"
              name="nom"
              placeholder="Ex: Pompe hydraulique"
              value={formData.nom}
              onChange={handleChange}
              error={!!errors.nom}
              helperText={errors.nom}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Référence Équipement"
              name="referenceEquipment"
              placeholder="Ex: REF1234"
              value={formData.referenceEquipment}
              onChange={handleChange}
              error={!!errors.referenceEquipment}
              helperText={errors.referenceEquipment}
              fullWidth
              disabled={loading}
            />
            <FileUploadBox
              fileType="image"
              label="UPLOAD IMAGE"
              acceptedFormats=".jpg,.jpeg,.png"
              currentFile={formData.image}
              error={errors.image}
              inputRef={imageInputRef}
            />
          </Box>
          {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>ANNULER</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ minWidth: 100 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'ENREGISTRER'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddEquipmentButton;
