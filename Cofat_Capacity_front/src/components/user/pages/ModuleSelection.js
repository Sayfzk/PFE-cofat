import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Settings,
    Users,
    Database,
    ShoppingCart,
    Activity,
    BarChart2,
    Globe
} from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import UpdateNotification from './UpdateNotification';
import './style/ModuleSelection.css';

const ModuleSelection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    const modules = [
        {
            id: 'standard-equipment',
            title: t('standardEquipment', 'Standard Equipment'),
            icon: <Settings size={40} />,
            path: '/standard-equipment',
            description: t('standardEquipmentDesc', 'Manage standard equipment, capacities, and costs'),
            color: 'blue',
            roles: ['admin', 'user', 'Achat', 'super admin']
        },
        {
            id: 'non-industrial-budget',
            title: t('nonIndustrialBudget', 'Non-Industrial Budget'),
            icon: <ShoppingCart size={40} />,
            path: '/non-industrial-budget',
            description: t('nonIndustrialBudgetDesc', 'Track and manage non-industrial budgets'),
            color: 'emerald',
            roles: ['admin', 'user', 'Achat', 'super admin']
        },
        {
            id: 'equipment',
            title: t('equipment', 'Equipment Capacity'),
            icon: <Database size={40} />,
            path: '/equipement/tunis',
            description: t('equipmentDesc', 'Monitor equipment capacity and utilization'),
            color: 'indigo',
            roles: ['admin', 'user', 'super admin']
        },
        {
            id: 'space',
            title: t('space', 'Space Management'),
            icon: <LayoutDashboard size={40} />,
            path: '/space/tunis',
            description: t('spaceDesc', 'Optimize workspace and facility usage'),
            color: 'purple',
            roles: ['admin', 'user', 'super admin']
        },
        {
            id: 'hr',
            title: t('hr', 'Human Resources'),
            icon: <Users size={40} />,
            path: '/hr/tunis',
            description: t('hrDesc', 'Manage HR capacity and requirements'),
            color: 'pink',
            roles: ['admin', 'user', 'super admin']
        },
        {
            id: 'admin-dashboard',
            title: 'Dashboard Admin',
            icon: <Activity size={40} />,
            path: '/admin/dashboard',
            description: 'Global overview and administration',
            color: 'orange',
            roles: ['super admin', 'admin']
        },
        {
            id: 'cofat-group',
            title: 'Cofat Group',
            icon: <Globe size={40} />,
            path: '/cofat-group/equipment',
            description: 'Group-level analytics and reports',
            color: 'cyan',
            roles: ['super admin', 'admin', 'user']
        }
    ];

    const handleModuleClick = (path) => {
        navigate(path);
    };

    // Filter modules based on user role
    const filteredModules = modules.filter(module => {
        if (!user || !user.role) return false;
        return module.roles.includes(user.role) || module.roles.includes('all');
    });

    return (
        <div className="module-selection-container">
            <UpdateNotification />

            <div className="module-header">
                <h1>{t('selectModule', 'Select a Module')}</h1>
                <p>{t('welcomeMessage', 'Welcome back, choose a module to start working')}</p>
            </div>

            <div className="modules-grid">
                {filteredModules.map((module, index) => (
                    <div
                        key={module.id}
                        className={`module-card ${module.color} ${animate ? 'animate-in' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleModuleClick(module.path)}
                    >
                        <div className="module-icon">
                            {module.icon}
                        </div>
                        <div className="module-content">
                            <h3>{module.title}</h3>
                            <p>{module.description}</p>
                        </div>
                        <div className="module-arrow">
                            →
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleSelection;
