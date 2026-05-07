'use client';

import { useState, useEffect } from 'react';
import { getAprsStats, getContractsByOrgan, getContractDashboard } from '../lib/contractsAPI';
import { getClients } from '../lib/clientsAPI';

const APR_LABELS = {
  'APRS DEFESA PREVIA':      { label: 'DEFESA PRÉVIA',           color: '#6366f1' },
  'DEFESA PREVIA - ANALISE': { label: 'DEFESA PRÉVIA - ANÁLISE', color: '#8b5cf6' },
  'APRS 1 INSTANCIA':        { label: '1ª INSTÂNCIA',            color: '#f59e0b' },
  '1 INSTANCIA - ANALISE':   { label: '1ª INSTÂNCIA - ANÁLISE',  color: '#f97316' },
  'APRS 2 INSTANCIA':        { label: '2ª INSTÂNCIA',            color: '#ef4444' },
  '2 INSTANCIA - ANALISE':   { label: '2ª INSTÂNCIA - ANÁLISE',  color: '#dc2626' },
};

export default function MultasDashboard() {
  const [stats, setStats]       = useState(null);
  const [byOrgan, setByOrgan]   = useState([]);
  const [aprStats, setAprStats] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, organData, aprsData, clientsData] = await Promise.all([
        getContractDashboard().catch(() => ({})),
        getContractsByOrgan().catch(() => []),
        getAprsStats().catch(() => []),
        getClients().catch(() => []),
      ]);
      const d = dashData?.dashboard || dashData || {};
      setStats({
        total:    parseInt(d.total_contracts) || 0,
        clientes: clientsData?.length || 0,
      });
      setByOrgan(organData || []);
      setAprStats(
        (aprsData || [])
          .map(r => ({ label: APR_LABELS[r.status]?.label || r.status, color: APR_LABELS[r.status]?.color || '#6b7280', count: parseInt(r.count) || 0 }))
          .filter(s => s.count > 0)
      );
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const getMax = (arr, key) => arr.length ? Math.max(...arr.map(o => parseInt(o[key]) || 0)) : 1;

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Carregando dashboard...</p></div>;
  if (error)   return <div className="error-container"><p>Erro: {error}</p><button onClick={load} className="btn-retry">Tentar novamente</button></div>;

  return (
    <div className="multas-dashboard">

      <div className="dashboard-grid">
        <div className="stat-card"><div className="stat-content"><h3>TOTAL DE CONTRATOS</h3><p className="stat-value">{stats?.total}</p></div></div>
        <div className="stat-card clients"><div className="stat-content"><h3>CLIENTES</h3><p className="stat-value">{stats?.clientes}</p></div></div>
      </div>

      <div className="charts-section">
        <h3 className="section-title">CLIENTES POR ESTÁGIO APR</h3>
        {aprStats.length > 0 ? (
          <div className="organ-chart">
            {aprStats.map((s, i) => (
              <div key={i} className="organ-bar-container">
                <div className="organ-label">
                  <span className="organ-name">{s.label}</span>
                  <span className="organ-count">{s.count} cliente{s.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="organ-bar-bg">
                  <div className="organ-bar-fill" style={{ width: `${(s.count / getMax(aprStats, 'count')) * 100}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-chart"><p>Nenhum cliente em estagio APR</p></div>}
      </div>

      <div className="charts-section">
        <h3 className="section-title">CONTRATOS POR ORGÃO</h3>
        {byOrgan.length > 0 ? (
          <div className="organ-chart">
            {byOrgan.map((o, i) => (
              <div key={i} className="organ-bar-container">
                <div className="organ-label">
                  <span className="organ-name">{o.organ || 'N/A'}</span>
                  <span className="organ-count">{o.count} contrato{o.count !== 1 ? 's' : ''}</span>
                </div>
                <div className="organ-bar-bg">
                  <div className="organ-bar-fill" style={{ width: `${(parseInt(o.count) / getMax(byOrgan, 'count')) * 100}%`, backgroundColor: `hsl(${i * 47}, 65%, 50%)` }} />
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-chart"><p>Nenhum contrato cadastrado ainda</p></div>}
      </div>

    </div>
  );
}
