import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../services/api';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    owner_id: '',
    monthly_rent: '',
    deposit_required: '',
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    property_type: 'apartment'
  });
  const [formFiles, setFormFiles] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAll();
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
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
      const res = await propertyAPI.create(formData);
      const created = res.data;
      // upload photos if provided
      if (formFiles && formFiles.length && created && created.id) {
        await propertyAPI.uploadPhotos(created.id, formFiles);
      }
      alert('Property created successfully!');
      setFormData({
        address: '',
        owner_id: '',
        monthly_rent: '',
        deposit_required: '',
        bedrooms: '',
        bathrooms: '',
        square_feet: '',
        property_type: 'apartment'
      });
      setFormFiles([]);
      setShowForm(false);
      fetchProperties();
    } catch (error) {
      alert('Failed to create property');
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormFiles(files);
  };

  return (
    <div className="properties-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🏘️ Properties</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Add Property'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>New Property</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Owner ID *</label>
                <input
                  type="text"
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Monthly Rent ($) *</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Deposit Required ($) *</label>
                <input
                  type="number"
                  name="deposit_required"
                  value={formData.deposit_required}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bedrooms *</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bathrooms *</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Square Feet *</label>
                <input
                  type="number"
                  name="square_feet"
                  value={formData.square_feet}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Property Type *</label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }} className="form-group">
              <label>Photos</label>
              <input type="file" name="photos" multiple accept="image/*" onChange={handleFileChange} />
            </div>

            <button type="submit" className="btn btn-success mt-3">Create Property</button>
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
                  <th>Photo</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Rent</th>
                  <th>Deposit</th>
                  <th>Beds</th>
                  <th>Baths</th>
                  <th>Sq Ft</th>
                  <th>Status</th>
                </tr>
            </thead>
            <tbody>
              {properties.map(prop => (
                <tr key={prop.id}>
                  <td style={{ width: 120 }}>
                    <img
                      src={(prop.photos && prop.photos.length) ? prop.photos[0] : 'https://picsum.photos/200/140?random=1'}
                      alt="property"
                      style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 6 }}
                    />
                  </td>
                  <td>{prop.address}</td>
                  <td>{prop.property_type}</td>
                  <td>${prop.monthly_rent}</td>
                  <td>${prop.deposit_required}</td>
                  <td>{prop.bedrooms}</td>
                  <td>{prop.bathrooms}</td>
                  <td>{(prop.square_feet || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${prop.status.toLowerCase()}`}>
                      {prop.status}
                    </span>
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

export default Properties;
