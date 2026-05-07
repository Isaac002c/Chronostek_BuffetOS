'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import ModuleLayout from '../components/ModuleLayout';

// Leads
import LeadsOverview     from '../leads/Overview';
import LeadsAcquisition  from '../leads/Acquisition';
import LeadsPipeline     from '../leads/Pipeline';
import LeadsLeaderboard  from '../leads/Leaderboard';
import LeadsExport       from '../leads/Export';
import LeadsPerformance  from '../leads/Performance';
import LeadsReports      from '../leads/Reports';

// Multas â€” sem Documents
import MultasDashboard from '../multas/Dashboard';
import MultasClients   from '../multas/Clients';
import MultasHistory   from '../multas/History';

// Settings
import SettingsPage from '../settings/page';

const ComingSoon = ({ moduleName }) => (
  <div className="coming-soon">
    <div className="coming-soon-icon">[Em Breve]</div>
    <h2>{moduleName} em breve</h2>
    <p>Este modulo esta em desenvolvimento</p>
  </div>
);

const modulePages = {
  leads: {
    name: 'Leads',
    pages: {
      overview:     LeadsOverview,
      acquisition:  LeadsAcquisition,
      pipeline:     LeadsPipeline,
      leaderboard:  LeadsLeaderboard,
      export:       LeadsExport,
      performance:  LeadsPerformance,
      reports:      LeadsReports,
    }
  },
  multas: {
    name: 'Multas',
    pages: {
      dashboard: MultasDashboard,
      clients:   MultasClients,
      history:   MultasHistory,
    }
  },
  settings: {
    name: 'Settings',
    pages: {
      general:      SettingsPage,
      team:         () => <ComingSoon moduleName="Equipe" />,
      integrations: () => <ComingSoon moduleName="Integracoes" />,
    }
  },
};

const getDefaultTab = (module) => {
  const defaults = { leads: 'overview', multas: 'dashboard', settings: 'general' };
  return defaults[module] || 'overview';
};

// Renderiza todas as abas mas sÃ³ exibe a ativa â€” evita remontar ao trocar aba
function CachedTabs({ moduleKey, activeTab }) {
  const moduleData = modulePages[moduleKey] || modulePages.leads;
  const mountedRef = useRef({});

  return (
    <>
      {Object.entries(moduleData.pages).map(([key, Page]) => {
        const isActive = key === activeTab;
        if (!isActive && !mountedRef.current[key]) return null;
        mountedRef.current[key] = true;
        return (
          <div key={key} style={{ display: isActive ? 'block' : 'none' }}>
            <Page />
          </div>
        );
      })}
    </>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser]       = useState(null);
  const [tenant, setTenant]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const currentModule = searchParams.get('module') || 'multas';
  const urlTab = searchParams.get('tab') || getDefaultTab(currentModule);

  useEffect(() => {
    const token    = document.cookie.includes('auth-token');
    const userData = localStorage.getItem('user');
    const tenantData = localStorage.getItem('tenant');
    if (!token || !userData) { router.push('/login'); return; }
    setUser(JSON.parse(userData));
    setTenant(JSON.parse(tenantData || '{}'));
    setLoading(false);
  }, [router]);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    } finally {
      ['user','tenant','token','auth-token','tenantId','tenant-id'].forEach(k => localStorage.removeItem(k));
      ['token','auth-token','tenantId'].forEach(k => {
        document.cookie = `${k}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
      });
      router.push('/login');
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    router.push(`/dashboard?module=${currentModule}&tab=${tabKey}`);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Carregando ChronosTek...</p>
    </div>
  );

  const moduleData = modulePages[currentModule] || modulePages.leads;

  return (
    <div className="app-container">
      <Header user={user} tenant={tenant} onLogout={handleLogout} />
      <main className="main-area">
        <ModuleLayout
          moduleKey={currentModule}
          moduleName={moduleData.name}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        >
          <CachedTabs moduleKey={currentModule} activeTab={activeTab} />
        </ModuleLayout>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Carregando...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
