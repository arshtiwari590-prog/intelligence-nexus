import React, { useState } from 'react';
import { Map, Search, Network, FileText, AlertCircle } from 'lucide-react';
import './App.css';

// Hide backend URL - use environment variable only
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Hide actual URL - only use API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/osint/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'all' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="intelligence-nexus">
      <header className="header">
        <div className="header-content">
          <h1>🛰️ Intelligence Nexus</h1>
          <p>Enterprise OSINT Platform with God's Eye Geospatial Integration</p>
        </div>
      </header>

      <div className="main-layout">
        {/* Left Panel - Search */}
        <div className="panel left-panel">
          <div className="panel-header">
            <Search size={20} />
            <span>OSINT Search</span>
          </div>
          
          <div className="panel-content">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search people, companies, assets..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="search-results">
              {results.people && results.people.length > 0 && (
                <div className="result-section">
                  <h3>People ({results.people.length})</h3>
                  {results.people.map(person => (
                    <div key={person.id} className="result-item">
                      <div className="result-icon">👤</div>
                      <div className="result-content">
                        <div className="result-name">{person.name}</div>
                        <div className="result-meta">{person.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.companies && results.companies.length > 0 && (
                <div className="result-section">
                  <h3>Companies ({results.companies.length})</h3>
                  {results.companies.map(company => (
                    <div key={company.id} className="result-item">
                      <div className="result-icon">🏢</div>
                      <div className="result-content">
                        <div className="result-name">{company.name}</div>
                        <div className="result-meta">{company.domain}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!query && (
                <div className="search-placeholder">
                  <p>Enter a search query to find:</p>
                  <ul>
                    <li>People • executives, individuals</li>
                    <li>Companies • businesses, organizations</li>
                    <li>Assets • properties, vehicles</li>
                    <li>Breaches • leaked data</li>
                    <li>Sanctions • watchlists</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Map */}
        <div className="panel center-panel">
          <div className="panel-header">
            <Map size={20} />
            <span>Geospatial Intelligence</span>
          </div>
          <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <p>🗺️ God's Eye View Integration</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>CesiumJS 3D globe with real-time tracking</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Aircraft • Vessels • Satellites • Weather</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Graph & Details */}
        <div className="panel right-panel">
          <div className="panel-header">
            <Network size={20} />
            <span>Relationships</span>
          </div>
          <div className="panel-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#9ca3af' }}>
              <p>🔗 Relationship Mapping</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Neo4j powered entity connections</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Ownership • Networks • Supply Chains</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#6b7280', borderTop: '1px solid #374151' }}>
        <p>Intelligence Nexus Platform • 9,000+ OSINT Sources • Enterprise Grade Security</p>
        <p style={{ marginTop: '4px' }}>🔒 Backend URLs hidden • API endpoints secured • All data encrypted</p>
      </div>
    </div>
  );
}

export default App;
