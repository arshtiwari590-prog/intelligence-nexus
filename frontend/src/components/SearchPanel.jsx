import React, { useState } from 'react';
import { Search } from 'lucide-react';
import '../styles/SearchPanel.css';

export function SearchPanel({ onSearch, onSelectEntity, results }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    await onSearch(searchQuery, searchType);
    setIsSearching(false);
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search people, companies, assets, breaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          <button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="search-filters">
          <label>Search Type:</label>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="all">All Data</option>
            <option value="people">People</option>
            <option value="companies">Companies</option>
            <option value="assets">Assets</option>
            <option value="breaches">Breaches</option>
            <option value="sanctions">Sanctions</option>
          </select>
        </div>
      </form>

      <div className="search-results">
        {results.people && results.people.length > 0 && (
          <div className="result-section">
            <h3>People ({results.people.length})</h3>
            <div className="result-list">
              {results.people.map(person => (
                <div 
                  key={person.id} 
                  className="result-item person"
                  onClick={() => onSelectEntity(person)}
                >
                  <div className="result-icon">👤</div>
                  <div className="result-content">
                    <div className="result-name">{person.name}</div>
                    <div className="result-meta">
                      {person.email && <span>{person.email}</span>}
                      {person.location && <span>📍 {person.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.companies && results.companies.length > 0 && (
          <div className="result-section">
            <h3>Companies ({results.companies.length})</h3>
            <div className="result-list">
              {results.companies.map(company => (
                <div 
                  key={company.id} 
                  className="result-item company"
                  onClick={() => onSelectEntity(company)}
                >
                  <div className="result-icon">🏢</div>
                  <div className="result-content">
                    <div className="result-name">{company.name}</div>
                    <div className="result-meta">
                      {company.domain && <span>{company.domain}</span>}
                      {company.location && <span>📍 {company.location}</span>}
                      {company.founded && <span>Founded {company.founded}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.assets && results.assets.length > 0 && (
          <div className="result-section">
            <h3>Assets ({results.assets.length})</h3>
            <div className="result-list">
              {results.assets.map(asset => (
                <div 
                  key={asset.id} 
                  className="result-item asset"
                  onClick={() => onSelectEntity(asset)}
                >
                  <div className="result-icon">🏠</div>
                  <div className="result-content">
                    <div className="result-name">{asset.address}</div>
                    <div className="result-meta">
                      <span>Type: {asset.type}</span>
                      <span>Value: ${asset.value?.toLocaleString()}</span>
                      <span>📍 {asset.latitude}, {asset.longitude}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.breaches && results.breaches.length > 0 && (
          <div className="result-section breach-alert">
            <h3>⚠️ Breaches ({results.breaches.length})</h3>
            <div className="result-list">
              {results.breaches.map(breach => (
                <div key={breach.id} className="result-item breach">
                  <div className="result-icon">🚨</div>
                  <div className="result-content">
                    <div className="result-name">{breach.breach_name}</div>
                    <div className="result-meta">
                      <span>Date: {new Date(breach.date).toLocaleDateString()}</span>
                      <span>Records: {breach.record_count?.toLocaleString()}</span>
                      <span>Status: {breach.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.sanctions && results.sanctions.length > 0 && (
          <div className="result-section sanction-alert">
            <h3>🚫 Sanctions ({results.sanctions.length})</h3>
            <div className="result-list">
              {results.sanctions.map(sanction => (
                <div key={sanction.id} className="result-item sanction">
                  <div className="result-icon">🔒</div>
                  <div className="result-content">
                    <div className="result-name">{sanction.entity_name}</div>
                    <div className="result-meta">
                      <span>List: {sanction.list_name}</span>
                      <span>Added: {new Date(sanction.date_added).toLocaleDateString()}</span>
                      <span>Risk: {sanction.risk_level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.people?.length === 0 && 
         results.companies?.length === 0 && 
         results.assets?.length === 0 && 
         searchQuery && !isSearching && (
          <div className="empty-results">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}

        {!searchQuery && (
          <div className="search-placeholder">
            <p>Enter a search query to find:</p>
            <ul>
              <li>People • executives, individuals</li>
              <li>Companies • businesses, organizations</li>
              <li>Assets • properties, vehicles, accounts</li>
              <li>Breaches • leaked data, compromised accounts</li>
              <li>Sanctions • restricted entities, watchlists</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
