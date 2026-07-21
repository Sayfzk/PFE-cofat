import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import Home from './components/user/pages/Home';
import Login from './components/user/pages/Login';
import SiteTable from './components/user/pages/SiteTable';
import Contact from './components/user/pages/Contact';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Unauthorized from './components/Unauthorized';
import Layout from './components/user/pages/Layout';
import StandardEquipment from './components/user/pages/StandardEquipment';
import SpaceTable from './components/user/pages/SpaceTable';
import HrTable from './components/user/pages/HrTable';
import CofatGroup from './components/user/pages/CofatGroup';
import CofatGroupSpace from './components/user/pages/CofatGroupSpace';
import CofatGroupHr from './components/user/pages/CofatGroupHr';
import AdminDashboard from './components/admin/AdminDashboard';
import AchatDebug from './components/AchatDebug';
import NonIndustrialBudget from './components/user/pages/NonIndustrialBudgetImproved';
import ModuleSelection from './components/user/pages/ModuleSelection';
function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout showNavbar={false} showSidebar={false}>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/menu"
        element={
          <PrivateRoute>
            <ModuleSelection />
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <Layout showNavbar={false} showSidebar={false} showFooter={false}>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout showNavbar={true} showSidebar={true}>
            <Contact />
          </Layout>
        }
      />
      <Route
        path="/equipement/:site"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <SiteTable />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/equipment/:site"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <SiteTable />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/space/:site"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <SpaceTable />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/hr/:site"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <HrTable />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/cofat-group/equipment"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <CofatGroup />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/cofat-group/space"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <CofatGroupSpace />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/cofat-group/hr"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <CofatGroupHr />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/:section/:site"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'user']}>
            <Layout showNavbar={true} showSidebar={true}>
              <SiteTable />
            </Layout>
          </RoleBasedRoute>
        }
      />


      <Route
        path="/unauthorized"
        element={
          <Layout showNavbar={true} showSidebar={true}>
            <Unauthorized />
          </Layout>
        }
      />
      <Route
        path="/standard-equipment"
        element={
          <PrivateRoute>
            <Layout showNavbar={true} showSidebar={true}>
              <StandardEquipment />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/debug-achat"
        element={
          <PrivateRoute>
            <Layout showNavbar={true} showSidebar={true}>
              <AchatDebug />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Layout showNavbar={true} showSidebar={true}>
              <AdminDashboard />
            </Layout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/non-industrial-budget"
        element={
          <PrivateRoute>
            <Layout showNavbar={true} showSidebar={true}>
              <NonIndustrialBudget />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;