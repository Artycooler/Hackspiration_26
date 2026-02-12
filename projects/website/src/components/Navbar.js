import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <span>🏠</span> RentWise
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none' }}
        >
          ☰
        </button>
        <ul className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>📊 Dashboard</Link></li>
          <li><Link to="/properties" onClick={() => setMobileMenuOpen(false)}>🏘️ Properties</Link></li>
          <li><Link to="/tenants" onClick={() => setMobileMenuOpen(false)}>👥 Tenants</Link></li>
          <li><Link to="/transactions" onClick={() => setMobileMenuOpen(false)}>💳 Transactions</Link></li>
          <li><Link to="/maintenance" onClick={() => setMobileMenuOpen(false)}>🔧 Maintenance</Link></li>
          <li><Link to="/risk-analysis" onClick={() => setMobileMenuOpen(false)}>⚠️ Risk</Link></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
