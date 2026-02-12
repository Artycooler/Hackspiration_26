import React, { useState, useEffect } from 'react';
import { maintenanceAPI, propertyAPI, tenantAPI } from '../services/api';

function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    tenant_id: '',
    issue_description: '',
    urgency: 'medium',
    estimated_cost: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, propRes, tenRes] = await Promise.all([
        maintenanceAPI.getAll(),
        propertyAPI.getAll(),
        tenantAPI.getAll()
      ]);
      setRequests(reqRes.data);
      setProperties(propRes.data);
      setTenants(tenRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      await maintenanceAPI.create(formData);
      alert('Maintenance request created successfully!');
      setFormData({
        property_id: '',
        tenant_id: '',
        issue_description: '',
        urgency: 'medium',
        estimated_cost: ''
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      alert('Failed to create maintenance request');
      console.error(error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await maintenanceAPI.updateStatus(requestId, newStatus);
      alert('Status updated successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to update status');
      console.error(error);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      case 'critical': return 'risk-critical';
      default: return 'risk-low';
    }
  };

  const getPropertyName = (propId) => {
    const prop = properties.find(p => p.id === propId);
    return prop ? prop.address : 'N/A';
  };

  const getTenantName = (tenantId) => {
    const tenant = tenants.find(t => t.id === tenantId);
    return tenant ? tenant.name : 'N/A';
  };

  return (
    <div className="maintenance-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🔧 Maintenance Requests</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ New Request'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Create Maintenance Request</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label>Property *</label>
                <select
                  name="property_id"
                  value={formData.property_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tenant *</label>
                <select
                  name="tenant_id"
                  value={formData.tenant_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Urgency *</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Cost ($)</label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }} className="form-group">
                <label>Issue Description *</label>
                <textarea
                  name="issue_description"
                  value={formData.issue_description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success mt-3">Submit Request</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Tenant</th>
                <th>Issue</th>
                <th>Urgency</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td>#{req.id}</td>
                  <td>{getPropertyName(req.property_id)}</td>
                  <td>{getTenantName(req.tenant_id)}</td>
                  <td>{req.issue_description.substring(0, 30)}...</td>
                  <td>
                    <span className={`risk-badge ${getUrgencyColor(req.urgency)}`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td>${req.estimated_cost || 'TBD'}</td>
                  <td>
                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'open' && (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleStatusChange(req.id, 'in_progress')}
                      >
                        Start
                      </button>
                    )}
                    {req.status === 'in_progress' && (
                      <button
                        className="btn btn-small btn-success"
                        onClick={() => handleStatusChange(req.id, 'resolved')}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Maintenance;
