const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 9001;

// 🚀 Import des routes
const AuthRouters = require('./routers/Auth-routers.js');
const secureRoutes = require('./routers/secureRoutes.js');
const equipmentRoutes = require('./routers/equipmentRoutes.js');
const equipmentplaningRoutes = require('./routers/equipmentplaningRoutes.js');
const StandardEquipmentRoutes = require('./routers/StandardEquipmentRoutes.js');
const siteRoutes = require('./routers/siteRoutes.js');
const Space = require('./routers/spaceRoutes.js');
const hrRoutes = require('./routers/hrRoutes.js');
const dashboardRoutes = require('./routers/dashboardRoutes.js');
const cofatGroupRoutes = require('./routers/cofatGroupRoutes.js');
const notificationRoutes = require('./routers/notifications.js');
const nonIndustrialBudgetRoutes = require('./routers/nonIndustrialBudgetRoutes.js');
const standardInvestmentRoutes = require('./routers/standardInvestmentRoutes.js');
const standardInvestmentV2Routes = require('./routers/standardInvestmentV2Routes.js');

// Import de la fonction de synchronisation Sequelize
const { syncDatabase } = require('./models');

// Middleware global
app.use(express.json());
app.use(cookieParser());

// 🌍 Middleware CORS - CORRIGÉ POUR VOTRE VM
app.use(cors({
  origin: [
    "http://172.23.23.31:4200",     // ✅ Frontend React sur votre VM
    "http://172.23.23.31:9001",     // ✅ Backend sur la VM (nouveau port)
    "http://localhost:4200",         // Dev local
    "http://localhost:4000",         // Dev local (User's current port)
    "http://127.0.0.1:4200",         // Dev local alternative
    "http://localhost:3200",         // Dev local backend
    "http://localhost:9001",         // Nouveau port local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-user-role', 'x-user-name', 'x-user-id']
}));

// 📁 Middleware pour exposer les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// 🧪 Route de diagnostic
app.get('/check-file/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, 'Uploads', type, filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: `Fichier non trouvé: ${filePath}`,
      checkedPath: filePath
    });
  }
});

app.get('/direct-file/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'Uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: `Fichier non trouvé: ${filePath}`,
      checkedPath: filePath
    });
  }
});

app.get('/api/debug/uploads-structure', (req, res) => {
  const uploadsPath = path.join(__dirname, 'Uploads');

  const exploreDir = (dir, basePath = '') => {
    const result = {};
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        result[item] = exploreDir(itemPath, path.join(basePath, item));
      } else {
        const relativePath = path.join(basePath, item);
        result[item] = {
          size: stats.size,
          path: relativePath,
          url: `/uploads/${relativePath.replace(/\\/g, '/')}`
        };
      }
    });

    return result;
  };

  try {
    const structure = {
      uploadsPath,
      structure: fs.existsSync(uploadsPath) ? exploreDir(uploadsPath) : 'Dossier non trouvé'
    };
    res.json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'exploration du dossier Uploads',
      error: error.message
    });
  }
});

// 🌐 Définir les routes
app.use('/', AuthRouters);
app.use('/auth', AuthRouters);
app.use('/api/secure', secureRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/equipment-planning', equipmentplaningRoutes);
app.use('/api/standard-equipment', StandardEquipmentRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/space', require('./routers/spaceRoutes.js'));
app.use('/api/hr', hrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cofat-group', cofatGroupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/non-industrial-budget', nonIndustrialBudgetRoutes);
app.use('/api/standard-investments', standardInvestmentRoutes);
app.use('/api/standard-investments-v2', standardInvestmentV2Routes); // ✅ Table V2 (version 15)

// 🚨 Middleware de gestion des erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    details: err.message
  });
});

// 🔁 Synchroniser et démarrer
syncDatabase()
  .then(() => {
    console.log('✅ Base de données synchronisée');

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 ===== SERVEUR BACKEND DÉMARRÉ (LOCAL) =====`);
      console.log(`📍 URL Frontend: http://localhost:4000`);
      console.log(`📍 URL Backend: http://localhost:${PORT}`);
      console.log(`📍 API signin: http://localhost:${PORT}/signin`);
      console.log(`\n📡 CORS autorisé pour: http://localhost:4000, http://localhost:4200`);
      console.log(`=====================================\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur sync DB:', err);
  });

module.exports = app;
