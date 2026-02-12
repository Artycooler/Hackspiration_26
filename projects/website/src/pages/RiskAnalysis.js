import React, { useState, useEffect } from 'react';
import { riskAPI, tenantAPI, propertyAPI, analyticsAPI } from '../services/api';

function RiskAnalysis() {
  const [selectedType, setSelectedType] = useState('tenant');
  const [selectedId, setSelectedId] = useState('');
  const [items, setItems] = useState([]);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState(null);

  useEffect(() => {
    handleTypeChange(selectedType);
  }, []);

  const handleTypeChange = async (type) => {
    setSelectedType(type);
    try {
      const response = type === 'tenant' ? 
        await tenantAPI.getAll() : 
        await propertyAPI.getAll();
      setItems(response.data);
      setSelectedId('');
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
    
    try {
      const stats = await analyticsAPI.getPortfolioStats();
      setPortfolioStats(stats.data);
    } catch (error) {
      console.error('Failed to fetch portfolio stats:', error);
    }
  };

  const handleAssess = async () => {
    if (!selectedId) {
      alert('Please select an item to assess');
      return;
    }

    try {
      setLoading(true);
      const response = selectedType === 'tenant' ?
        await riskAPI.assessTenant(selectedId) :
        await riskAPI.assessProperty(selectedId);
      setRiskAssessment(response.data);
    } catch (error) {
      alert('Failed to assess risk');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'LOW': return 'risk-low';
      case 'MEDIUM': return 'risk-medium';
      case 'HIGH': return 'risk-high';
      case 'CRITICAL': return 'risk-critical';
      default: return 'risk-low';
    }
  };

  return (
    <div className="risk-analysis-page">
      <h1>⚠️ Risk Analysis</h1>

      {portfolioStats && (
        <div className="dashboard mb-4">
          <div className="stat-card">
            <div className="stat-label">Portfolio Risk Score</div>
            <div className="stat-value">{portfolioStats.portfolio_score.toFixed(1)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Avg Property Risk</div>
            <div className="stat-value">{portfolioStats.avg_property_risk.toFixed(1)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Avg Tenant Risk</div>
            <div className="stat-value">{portfolioStats.avg_tenant_risk.toFixed(1)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Occupancy Rate</div>
            <div className="stat-value">{portfolioStats.occupancy_rate.toFixed(1)}%</div>
          </div>
        </div>
      )}

      <div className="form-container">
        <h2>Individual Risk Assessment</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Assessment Type</label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="tenant">Tenant Risk</option>
              <option value="property">Property Risk</option>
            </select>
          </div>

          <div className="form-group">
            <label>Select {selectedType === 'tenant' ? 'Tenant' : 'Property'}</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Select...</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {selectedType === 'tenant' ? item.name : item.address}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleAssess}
          disabled={loading}
        >
          {loading ? 'Assessing...' : 'Run Assessment'}
        </button>
      </div>

      {riskAssessment && (
        <div className="table-container">
          <h2>Assessment Results</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-label">Risk Score</div>
              <div className="stat-value">{riskAssessment.risk_score.toFixed(1)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Risk Level</div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`risk-badge ${getRiskColor(riskAssessment.risk_level)}`}>
                  {riskAssessment.risk_level}
                </span>
              </div>
            </div>
          </div>

          <div className="form-container">
            <h3>Risk Factors</h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(riskAssessment.factors).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key.replace(/_/g, ' ').toUpperCase()}</strong></td>
                    <td>{typeof value === 'number' ? value.toFixed(1) : value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-container mt-3">
            <h3>Recommendations</h3>
            <ul>
              {riskAssessment.recommendation.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiskAnalysis;
