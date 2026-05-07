'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const modules = [
  { key: 'leads', label: 'Leads' },
  { key: 'multas', label: 'Multas' },
  { key: 'settings', label: 'Settings' },
];

export default function Header({ user, tenant, onLogout }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState('seller');
  const dropdownRef = useRef(null);
  
  const currentModule = searchParams.get('module') || 'leads';
  const currentModuleLabel = modules.find(m => m.key === currentModule)?.label || 'Leads';

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  const moduleDefaultTabs = {
    leads: 'overview',
    multas: 'dashboard',
    settings: 'general'
  };

  const handleModuleChange = (moduleKey) => {
    setDropdownOpen(false);
    const defaultTab = moduleDefaultTabs[moduleKey] || 'overview';
    router.push(`/dashboard?module=${moduleKey}&tab=${defaultTab}`);
  };

  const getRoleBadge = () => {
    if (role === 'admin') {
      return { label: 'ADMIN', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
    }
    return { label: 'VENDEDOR', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="global-header">
      <div className="header-left">
        <div className="header-logo">
          <img 
            src="/logoChronosTech.png" 
            alt="ChronosTek" 
            className="logo-image"
          />
          <span className="logo-text">ChronosTek</span>
        </div>
      </div>

      <div className="header-right">
        {tenant && (
          <div className="tenant-badge">
            <span className="tenant-icon">[Emp]</span>
            <span>{tenant.name}</span>
          </div>
        )}

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: roleBadge.bg,
            border: `1px solid ${roleBadge.color}30`,
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '700',
            color: roleBadge.color,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          title={role === 'admin' ? 'Acesso administrativo' : 'Acesso de vendedor'}
        >
          {role === 'admin' ? '[Adm]' : '[Vend]'} {roleBadge.label}
        </div>

        <div className="module-dropdown" ref={dropdownRef}>
          <button 
            className="dropdown-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="module-icon">*</span>
            {currentModuleLabel}
            <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>v</span>
          </button>
          
          {dropdownOpen && (
          <div className="dropdown-menu">
              {modules.map((module) => (
                <button
                  key={module.key}
                  className={`dropdown-item ${currentModule === module.key ? 'active' : ''}`}
                  onClick={() => handleModuleChange(module.key)}
                >
                  {module.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="header-user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button onClick={onLogout} className="logout-btn-header">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

