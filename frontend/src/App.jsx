import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, AlertCircle, Check } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://intelligence-nexus-backend.onrender.com';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/osint/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'all' })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="background">
        <motion.div className="blob blob-1" animate={{ y: [0, 50, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="blob blob-2" animate={{ y: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      {/* Header */}
      <motion.header className="header" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="header-content">
          <h1>🛰️ Intelligence Nexus</h1>
          <p>Enterprise OSINT Platform • 9,000+ Sources • Real-time Intelligence</p>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <motion.div className="container" variants={containerVariants} initial="hidden" animate="visible">
        
        {/* Search Box */}
        <motion.form onSubmit={handleSearch} className="search-wrapper" variants={itemVariants}>
          <div className="search-input-container">
            <Search className="search-icon" size={24} />
            <input
              type="text"
              placeholder="Search people, companies, assets... (e.g., Tesla, Amazon)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="search-input"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="search-button"
          >
            {loading ? <Loader size={20} className="spinner" /> : 'Search'}
          </motion.button>
        </motion.form>

        {/* Results */}
        <motion.div className="results-container" variants={itemVariants}>
          {error && (
            <motion.div className="error-box" initial={{ x: -20 }} animate={{ x: 0 }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {loading && (
            <motion.div className="loading" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Loader size={40} />
              <p>Searching across 9,000+ sources...</p>
            </motion.div>
          )}

          {results && !error && (
            <motion.div className="results" variants={containerVariants} initial="hidden" animate="visible">
              {results.people?.length > 0 && (
                <motion.div className="result-section" variants={itemVariants}>
                  <h3>👤 People ({results.people.length})</h3>
                  <div className="result-list">
                    {results.people.slice(0, 5).map((p, i) => (
                      <motion.div key={p.id} className="result-item" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <div className="result-badge">👤</div>
                        <div>
                          <div className="result-name">{p.name}</div>
                          <div className="result-meta">{p.email}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {results.companies?.length > 0 && (
                <motion.div className="result-section" variants={itemVariants}>
                  <h3>🏢 Companies ({results.companies.length})</h3>
                  <div className="result-list">
                    {results.companies.slice(0, 5).map((c, i) => (
                      <motion.div key={c.id} className="result-item" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        <div className="result-badge">🏢</div>
                        <div>
                          <div className="result-name">{c.name}</div>
                          <div className="result-meta">{c.domain}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!results.people?.length && !results.companies?.length && (
                <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Check size={48} />
                  <p>No results found for "{query}"</p>
                  <p className="empty-hint">Try searching for a company or person name</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {!results && !loading && !error && (
            <motion.div className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Search size={48} />
              <p>Start searching to find intelligence</p>
              <p className="empty-hint">Search across people, companies, breaches, and more</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer className="footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <p>🔒 Backend: <code>{API_URL}</code></p>
        <p>Connected • Secure • Real-time</p>
      </motion.footer>
    </div>
  );
}

export default App;
