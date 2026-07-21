// middlewares/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Fonction pour créer un dossier s'il n'existe pas
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé : ${dirPath}`);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    let destinationPath;
    
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      destinationPath = 'Uploads/images';
    } else if (ext === '.xlsx' || ext === '.xls') {
      destinationPath = 'Uploads/excel';
    } else if (ext === '.docx' || ext === '.doc') {
      destinationPath = 'Uploads/cdc';
    } else {
      return cb(new Error(`Type de fichier non supporté: ${ext}`), null);
    }
    
    // Créer le dossier s'il n'existe pas
    ensureDirectoryExists(destinationPath);
    
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    // Nettoyer le nom de fichier
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = Date.now() + '-' + cleanName;
    cb(null, uniqueName);
  }
});

// Configuration de multer avec validation
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB par fichier
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.xlsx', '.xls', '.docx', '.doc'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${ext}. Types autorisés: ${allowedTypes.join(', ')}`), false);
    }
  }
});

module.exports = upload;