import React, { useState, useEffect } from 'react';
import { tenantAPI, propertyAPI, riskAPI } from '../services/api';

function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [assessingRisk, setAssessingRisk] = useState(null);
  const [formData, setFormData] = useState({
    property_id: '',
    wallet_address: '',
    name: '',
    email: '',
    credit_score: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tenantsRes, propertiesRes] = await Promise.all([
        tenantAPI.getAll(),
        propertyAPI.getAll()
      ]);
      setTenants(tenantsRes.data || []);
      setProperties(propertiesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('⚠️ Failed to load tenants. Connection issue or backend not running.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tenantAPI.create({
        ...formData,
        property_id: parseInt(formData.property_id),
        credit_score: formData.credit_score ? parseInt(formData.credit_score) : 0
      });
      alert('✅ Tenant added successfully!');
      setFormData({
        property_id: '',
        wallet_address: '',
        name: '',
        email: '',
        credit_score: ''
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('❌ Failed to add tenant: ' + (error.response?.data?.detail || error.message));
      console.error(error);
    }
  };

  const handleAssessRisk = async (tenantId) => {
    try {
      setAssessingRisk(tenantId);
      const response = await riskAPI.assessTenant(tenantId);
      alert(`⚠️ Risk Assessment\n\nScore: ${response.data.risk_score.toFixed(1)}\nLevel: ${response.data.risk_level}`);
    } catch (error) {
      alert('❌ Risk assessment failed: ' + error.message);
    } finally {
      setAssessingRisk(null);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'risk-low';
    if (score >= 60) return 'risk-medium';
    if (score >= 40) return 'risk-high';
    return 'risk-critical';
  };

  const getPropertyAddress = (propertyId) => {
    const prop = properties.find(p => p.id === propertyId);
    return prop ? prop.address : 'Unknown';
  };

  return (
    <div className="tenants-page">
      <div className="page-header">
        <h1>👥 Tenants Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Add Tenant'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-small" onClick={fetchData} style={{ marginLeft: '1rem' }}>Retry</button>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>Add New Tenant</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Wallet Address *</label>
                <input
                  type="text"
                  name="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleInputChange}
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f42778"
                  required
                />
              </div>

              <div className="form-group">
                <label>Credit Score (300-850)</label>
                <input
                  type="number"
                  name="credit_score"
                  value={formData.credit_score}
                  onChange={handleInputChange}
                  placeholder="750"
                  min="300"
                  max="850"
                />
              </div>

              <div className="form-group">
                <label>Property *</label>
                <select
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a Property</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.address} - ${prop.monthly_rent}/mo
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-success">Save Tenant</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div><p>Loading tenants...</p></div>
      ) : tenants.length === 0 ? (
        <div className="empty-state">
          <p>📭 No tenants yet. Click "Add Tenant" to get started.</p>
        </div>
      ) : (
        <div className="table-container table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Credit</th>
                <th>Property</th>
                <th>Status</th>
                <th>Reputation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} onClick={() => setSelectedTenant(tenant)}>
                  <td><strong>{tenant.name}</strong></td>
                  <td>{tenant.email}</td>
                  <td>{tenant.credit_score || '—'}</td>
                  <td>{getPropertyAddress(tenant.property_id)}</td>
                  <td>
                    <span className={`status-badge status-${tenant.is_active ? 'active' : 'inactive'}`}>
                      {tenant.is_active ? '✓ Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge ${getRiskColor(tenant.reputation_score)}`}>
                      {tenant.reputation_score.toFixed(0)}/100
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-small btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssessRisk(tenant.id);
                      }}
                      disabled={assessingRisk === tenant.id}
                    >
                      {assessingRisk === tenant.id ? '⏳' : '⚠️ Risk'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedTenant(null)}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTenant.name}</h2>
            <p><strong>Email:</strong> {selectedTenant.email}</p>
            <p><strong>Wallet:</strong> {selectedTenant.wallet_address.substring(0, 20)}...</p>
            <p><strong>Credit Score:</strong> {selectedTenant.credit_score || 'N/A'}</p>
            <p><strong>Reputation:</strong> {selectedTenant.reputation_score.toFixed(1)}/100</p>
            <p><strong>Move-in:</strong> {new Date(selectedTenant.move_in_date).toLocaleDateString()}</p>
            <button className="btn btn-primary" onClick={() => setSelectedTenant(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tenants;
