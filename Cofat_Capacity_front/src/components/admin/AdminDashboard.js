import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, Factory, MapPin,
  Package, AlertTriangle, CheckCircle, Activity, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './AdminDashboard.css';
import './AdminDashboard_dark.css';

const AdminDashboard = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const API_BASE_URL = 'http://172.23.23.31:9001';

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    // Récupérer l'utilisateur courant
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.isAuthenticated) {
          setUser(parsedUser);
          if (parsedUser.role === 'admin') {
            fetchDashboardData(parsedUser.role);
          } else {
            setError('Accès refusé. Ce dashboard est réservé aux administrateurs.');
            setLoading(false);
          }
        } else {
          setError('Utilisateur non authentifié.');
          setLoading(false);
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'utilisateur.');
        setLoading(false);
      }
    } else {
      setError('Aucun utilisateur connecté.');
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => (
    <div className={`metric-card ${color}`}>
      <div className="metric-header">
        <div className="metric-info">
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">{value}</div>
          {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        </div>
        <div className="metric-icon">
          <Icon size={32} />
        </div>
      </div>
      {trend && (
        <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-item" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertTriangle size={48} />
        <h2>Erreur</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <Package size={48} />
        <h2>Aucune donnée disponible</h2>
        <p>Le dashboard ne peut pas être généré pour le moment.</p>
      </div>
    );
  }

  const { global_metrics, equipment_distribution, site_comparison, monthly_trends } = dashboardData;

  return (
    <div className="admin-dashboard" data-theme={theme}>
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Dashboard Administrateur COFAT</h1>
          <p className="dashboard-subtitle">
            Analyse complète des équipements et capacités
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Métriques globales */}
      <div className="metrics-grid">
        <MetricCard
          title="Besoin Total en Machines"
          value={formatNumber(global_metrics.totalMachineNeed)}
          subtitle="Demande totale"
          icon={Factory}
          color="blue"
        />
        <MetricCard
          title="Machines Disponibles"
          value={formatNumber(global_metrics.totalAvailable)}
          subtitle="Capacité actuelle"
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="À Commander"
          value={formatNumber(global_metrics.totalToOrder)}
          subtitle="Besoins d'achat"
          icon={Package}
          color="orange"
        />
        <MetricCard
          title="Taux d'Utilisation"
          value={`${global_metrics.utilizationRate}%`}
          subtitle="Efficacité globale"
          icon={Activity}
          color={global_metrics.utilizationRate > 90 ? 'green' : global_metrics.utilizationRate > 70 ? 'orange' : 'red'}
        />
      </div>

      {/* Graphiques principaux */}
      <div className="charts-container">
        {/* Distribution des équipements */}
        <div className="chart-card">
          <h2 className="chart-title">Distribution des Équipements</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={equipment_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" name="Besoin" />
              <Bar dataKey="available" fill="#00C49F" name="Disponible" />
              <Bar dataKey="to_order" fill="#FF8042" name="À Commander" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparaison par sites */}
        <div className="chart-card">
          <h2 className="chart-title">Répartition par Sites</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={site_comparison}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="need"
              >
                {site_comparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tendances temporelles */}
      <div className="chart-card full-width">
        <h2 className="chart-title">Évolution Temporelle</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthly_trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total_need"
              stroke="#0088FE"
              strokeWidth={2}
              name="Besoin Total"
            />
            <Line
              type="monotone"
              dataKey="total_available"
              stroke="#00C49F"
              strokeWidth={2}
              name="Disponible"
            />
            <Line
              type="monotone"
              dataKey="total_to_order"
              stroke="#FF8042"
              strokeWidth={2}
              name="À Commander"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Détails par site */}
      <div className="details-section">
        <h2 className="section-title">Détails par Site</h2>
        <div className="details-grid">
          {site_comparison.map((site, index) => (
            <div key={site.label} className="site-detail-card">
              <div className="site-header">
                <MapPin size={24} />
                <h3>{site.label}</h3>
              </div>
              <div className="site-metrics">
                <div className="site-metric">
                  <span className="metric-label">Besoin:</span>
                  <span className="metric-value">{formatNumber(site.need)}</span>
                </div>
                <div className="site-metric">
                  <span className="metric-label">Disponible:</span>
                  <span className="metric-value">{formatNumber(site.available)}</span>
                </div>
                <div className="site-metric">
                  <span className="metric-label">À commander:</span>
                  <span className="metric-value">{formatNumber(site.to_order)}</span>
                </div>
                <div className="site-metric">
                  <span className="metric-label">Types d'équipement:</span>
                  <span className="metric-value">{site.equipment_types}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer avec métadonnées */}
      <div className="dashboard-footer">
        <div className="metadata">
          <p><strong>Généré le:</strong> {new Date(dashboardData.generated_at).toLocaleString('fr-FR')}</p>
          <p><strong>Nombre total d'entrées:</strong> {dashboardData.total_records}</p>
          <p><strong>Équipements uniques:</strong> {dashboardData.unique_equipments}</p>
          <p><strong>Sites actifs:</strong> {dashboardData.unique_sites}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;