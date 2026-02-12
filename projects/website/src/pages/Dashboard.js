import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
      setError(null);
      
      // Animate values on load
      Object.keys(response.data).forEach(key => {
        if (typeof response.data[key] === 'number') {
          animateValue(key, response.data[key]);
        }
      });
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const animateValue = (key, value) => {
    let start = 0;
    const end = Math.floor(value);
    const duration = 1500;
    const increment = end / (duration / 50);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValues(prev => ({ ...prev, [key]: end }));
        clearInterval(timer);
      } else {
        setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(start) }));
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-creative"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        ⚠️ {error}
        <button className="btn btn-small" onClick={fetchAnalytics} style={{ marginLeft: '1rem' }}>Retry</button>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    if (risk < 30) return '#10b981';
    if (risk < 50) return '#f59e0b';
    if (risk < 70) return '#ef6b4a';
    return '#dc2626';
  };

  return (
    <div className="dashboard-page-creative">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏢 Portfolio Dashboard</h1>
          <p className="header-subtitle">Real-time insights and analytics for your rental properties</p>
        </div>
        <div className="header-date">
          <span className="date-badge">📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      {analytics && (
        <>
          {/* Row 1: Key Performance Indicators */}
          <div className="metrics-grid premium">
            {/* Total Properties - with icon */}
            <div className="metric-card metric-card-blue">
              <div className="metric-icon">🏠</div>
              <div className="metric-content">
                <div className="metric-label">Properties</div>
                <div className="metric-value-large metric-count">
                  {animatedValues.total_properties || analytics.total_properties}
                </div>
                <div className="metric-detail">Active rental units</div>
                <div className="metric-progress">
                  <div className="progress-bar" style={{width: `${Math.min(analytics.total_properties * 20, 100)}%`}}></div>
                </div>
              </div>
            </div>

            {/* Active Tenants */}
            <div className="metric-card metric-card-green">
              <div className="metric-icon">👥</div>
              <div className="metric-content">
                <div className="metric-label">Active Tenants</div>
                <div className="metric-value-large metric-count">
                  {animatedValues.total_tenants || analytics.total_tenants}
                </div>
                <div className="metric-detail">Currently occupying</div>
                <div className="metric-progress">
                  <div className="progress-bar success" style={{width: `${Math.min(analytics.total_tenants * 25, 100)}%`}}></div>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="metric-card metric-card-purple">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-label">Total Revenue</div>
                <div className="metric-value-large">
                  ${(animatedValues.total_revenue || analytics.total_revenue).toLocaleString()}
                </div>
                <div className="metric-detail">Cumulative income</div>
                <div className="metric-progress">
                  <div className="progress-bar warning" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>

            {/* Occupancy Rate - Circular Indicator */}
            <div className="metric-card metric-card-orange">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <div className="metric-label">Occupancy</div>
                <div className="metric-value-large">
                  {analytics.occupancy_rate.toFixed(1)}%
                </div>
                <div className="metric-detail">Portfolio utilization</div>
                <div className="metric-progress">
                  <div className="progress-bar" style={{width: `${analytics.occupancy_rate}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Risk Metrics */}
          <div className="metrics-grid">
            {/* Property Risk */}
            <div className="metric-card metric-card-risk">
              <div className="metric-icon">⚠️</div>
              <div className="metric-content">
                <div className="metric-label">Property Risk</div>
                <div className="circular-progress">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={getRiskColor(analytics.average_property_risk)} 
                      strokeWidth="8"
                      strokeDasharray={`${analytics.average_property_risk * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    ></circle>
                    <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                      {analytics.average_property_risk.toFixed(0)}
                    </text>
                  </svg>
                </div>
                <div className="metric-detail" style={{color: getRiskColor(analytics.average_property_risk)}}>
                  {analytics.average_property_risk < 30 ? '✅ Low Risk' : analytics.average_property_risk < 50 ? '⚠️ Medium Risk' : '🔴 High Risk'}
                </div>
              </div>
            </div>

            {/* Tenant Risk */}
            <div className="metric-card metric-card-risk">
              <div className="metric-icon">🛡️</div>
              <div className="metric-content">
                <div className="metric-label">Tenant Risk</div>
                <div className="circular-progress">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={getRiskColor(analytics.average_tenant_risk)} 
                      strokeWidth="8"
                      strokeDasharray={`${analytics.average_tenant_risk * 2.83} 283`}
                      transform="rotate(-90 50 50)"
                    ></circle>
                    <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
                      {analytics.average_tenant_risk.toFixed(0)}
                    </text>
                  </svg>
                </div>
                <div className="metric-detail" style={{color: getRiskColor(analytics.average_tenant_risk)}}>
                  {analytics.average_tenant_risk < 30 ? '✅ Low Risk' : analytics.average_tenant_risk < 50 ? '⚠️ Medium Risk' : '🔴 High Risk'}
                </div>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="metric-card metric-card-yellow">
              <div className="metric-icon">🔧</div>
              <div className="metric-content">
                <div className="metric-label">Maintenance</div>
                <div className="metric-value-large">
                  {analytics.maintenance_requests}
                </div>
                <div className="metric-detail">Open requests</div>
                {analytics.maintenance_requests > 0 && (
                  <div className="metric-badge danger">Action needed</div>
                )}
              </div>
            </div>

            {/* Pending Transactions */}
            <div className="metric-card metric-card-red">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <div className="metric-label">Transactions</div>
                <div className="metric-value-large">
                  {analytics.pending_transactions}
                </div>
                <div className="metric-detail">Awaiting confirmation</div>
                {analytics.pending_transactions > 0 && (
                  <div className="metric-badge warning">Pending</div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Quick Actions & Status */}
          <div className="metrics-grid">
            {/* Quick Actions Card */}
            <div className="action-card">
              <div className="action-header">
                <h3>⚡ Quick Actions</h3>
                <span className="action-badge">4 Operations</span>
              </div>
              <div className="action-buttons">
                <Link to="/properties" className="action-btn action-btn-add">
                  <span className="action-icon">➕</span>
                  <span>Add Property</span>
                </Link>
                <Link to="/tenants" className="action-btn action-btn-tenant">
                  <span className="action-icon">👤</span>
                  <span>Add Tenant</span>
                </Link>
                <Link to="/maintenance" className="action-btn action-btn-maintenance">
                  <span className="action-icon">🔧</span>
                  <span>Maintenance</span>
                </Link>
                <Link to="/risk-analysis" className="action-btn action-btn-risk">
                  <span className="action-icon">⚠️</span>
                  <span>Risk Analysis</span>
                </Link>
              </div>
            </div>

            {/* System Status Card */}
            <div className="status-card">
              <div className="status-header">
                <h3>✅ System Status</h3>
                <span className="status-indicator pulse"></span>
              </div>
              <div className="status-items">
                <div className="status-item">
                  <span className="status-dot success"></span>
                  <span>API Connected</span>
                  <span className="status-time">Live</span>
                </div>
                <div className="status-item">
                  <span className="status-dot success"></span>
                  <span>Database Active</span>
                  <span className="status-time">Synced</span>
                </div>
                <div className="status-item">
                  <span className="status-dot success"></span>
                  <span>Smart Contract</span>
                  <span className="status-time">Ready</span>
                </div>
                <div className="status-item">
                  <span className="status-dot success"></span>
                  <span>Analytics Engine</span>
                  <span className="status-time">Running</span>
                </div>
              </div>
            </div>

            {/* Portfolio Summary Card */}
            <div className="summary-card">
              <div className="summary-header">
                <h3>📊 Portfolio Summary</h3>
              </div>
              <div className="summary-stats">
                <div className="summary-item">
                  <span className="summary-label">Avg Monthly Income</span>
                  <span className="summary-value">${(analytics.total_revenue / 12).toLocaleString()}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Properties Managed</span>
                  <span className="summary-value">{analytics.total_properties}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Occupancy Health</span>
                  <span className="summary-value" style={{color: analytics.occupancy_rate > 80 ? '#10b981' : '#f59e0b'}}>
                    {analytics.occupancy_rate > 80 ? '📈 Strong' : '⚠️ Moderate'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
