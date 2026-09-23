import React, { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/osint/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'all' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults({ error: `Server error: ${response.status}` });
      }
    } catch (error) {
      setResults({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛰️ Intelligence Nexus</h1>
        <p>Enterprise OSINT Platform</p>
      </header>

      <div className="container">
        <form onSubmit={handleSearch} className="search-form">
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
        </form>

        <div className="results">
          {results?.error && <div className="error">❌ {results.error}</div>}
          
          {results && !results.error && (
            <>
              {results.people?.length > 0 && (
                <div className="section">
                  <h3>People ({results.people.length})</h3>
                  {results.people.map(p => (
                    <div key={p.id} className="item">👤 {p.name} ({p.email})</div>
                  ))}
                </div>
              )}

              {results.companies?.length > 0 && (
                <div className="section">
                  <h3>Companies ({results.companies.length})</h3>
                  {results.companies.map(c => (
                    <div key={c.id} className="item">🏢 {c.name} ({c.domain})</div>
                  ))}
                </div>
              )}

              {!results.people?.length && !results.companies?.length && (
                <div className="empty">No results found</div>
              )}
            </>
          )}

          {!results && (
            <div className="empty">
              <p>Search across 9,000+ OSINT sources</p>
              <p style={{fontSize: '12px', marginTop: '10px'}}>
                Try: Tesla, Amazon, person name, email
              </p>
            </div>
          )}
        </div>
      </div>

      <footer>
        <p>Backend: {API_URL}</p>
      </footer>
    </div>
  );
}

export default App;
