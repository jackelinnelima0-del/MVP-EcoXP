import React from 'react';
import { AppProvider, useApp } from './context';
import { AppShell } from './components/Layout';
import { Toast } from './components/ui';

// Auth views
import Landing from './views/Landing';
import Login from './views/Login';
import Notifications from './views/Notifications';

// Company views
import CompanyDashboard from './views/company/Dashboard';
import NewRequest from './views/company/NewRequest';
import MyRequests from './views/company/Requests';
import Marketplace from './views/company/Marketplace';
import Operators from './views/company/Operators';
import Impact from './views/company/Impact';
import Certificates from './views/company/Certificates';
import Plan from './views/company/Plan';

// Operator views
import OperatorDashboard from './views/operator/Dashboard';
import Opportunities from './views/operator/Opportunities';
import MyProposals from './views/operator/Proposals';
import Collections from './views/operator/Collections';
import Companies from './views/operator/Companies';
import OperatorProfile from './views/operator/Profile';

function AppContent() {
  const { role, loggedIn, view } = useApp();

  // Unauthenticated
  if (!role) return <Landing />;
  if (!loggedIn) return <Login />;

  // App shell
  const renderView = () => {
    // Shared
    if (view === 'notifications') return <Notifications />;

    // Company
    if (role === 'company') {
      if (view === 'company-dashboard') return <CompanyDashboard />;
      if (view === 'company-new-request') return <NewRequest />;
      if (view === 'company-requests') return <MyRequests />;
      if (view === 'company-marketplace') return <Marketplace />;
      if (view === 'company-operators') return <Operators />;
      if (view === 'company-impact') return <Impact />;
      if (view === 'company-certificates') return <Certificates />;
      if (view === 'company-plan') return <Plan />;
      return <CompanyDashboard />;
    }

    // Operator
    if (role === 'operator') {
      if (view === 'operator-dashboard') return <OperatorDashboard />;
      if (view === 'operator-opportunities') return <Opportunities />;
      if (view === 'operator-proposals') return <MyProposals />;
      if (view === 'operator-collections') return <Collections />;
      if (view === 'operator-companies') return <Companies />;
      if (view === 'operator-profile') return <OperatorProfile />;
      return <OperatorDashboard />;
    }

    return null;
  };

  return (
    <AppShell>
      {renderView()}
    </AppShell>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <ToastWrapper />
    </AppProvider>
  );
}

function ToastWrapper() {
  return <Toast />;
}
