import React, { useState, useEffect } from 'react';
import { MapContainer } from './components/MapContainer';
import { GraphView } from './components/GraphView';
import { SearchPanel } from './components/SearchPanel';
import { DataPanel } from './components/DataPanel';
import { CaseManager } from './components/CaseManager';
import { RealTimeFeeds } from './components/RealTimeFeeds';
import { Map, Search, Network, FileText, AlertCircle } from 'lucide-react';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [currentCase, setCurrentCase] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [liveFeeds, setLiveFeeds] = useState({
    aircraft: [],
    vessels: [],
    satellites: []
  });

  useEffect(() => {
    // Initialize WebSocket connection for real-time data
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000');
    
    socket.on('aircraft:update', (data) => {
      setLiveFeeds(prev => ({ ...prev, aircraft: data }));
    });

    socket.on('vessel:update', (data) => {
      setLiveFeeds(prev => ({ ...prev, vessels: data }));
    });

    return () => socket.disconnect();
  }, []);

  const handleSearch = async (query, type) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/osint/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type })
      });
      
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleEntitySelect = async (entity) => {
    setSelectedEntity(entity);
    
    // Fetch detailed data and graph
    try {
      const endpoint = entity.type === 'person' 
        ? `/api/osint/person/${entity.id}`
        : `/api/osint/company/${entity.id}`;
      
      const [detailResponse, graphResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}${endpoint}`),
        fetch(`${process.env.REACT_APP_API_URL}/api/osint/graph/${entity.id}`)
      ]);

      const details = await detailResponse.json();
      const graph = await graphResponse.json();

      setSelectedEntity(details);
      setGraphData(graph);
      
      // Center map on entity
      if (entity.latitude && entity.longitude) {
        setMapCenter([entity.latitude, entity.longitude]);
      }
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }
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
        {/* Left Panel - Geospatial (God's Eye View Integration) */}
        <div className="panel left-panel">
          <div className="panel-header">
            <Map size={20} />
            <span>Geospatial Intelligence</span>
          </div>
          <MapContainer 
            center={mapCenter}
            liveFeeds={liveFeeds}
            selectedEntity={selectedEntity}
          />
        </div>

        {/* Center Panel - Search & Results */}
        <div className="panel center-panel">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search size={18} /> Search
            </button>
            <button 
              className={`tab ${activeTab === 'feeds' ? 'active' : ''}`}
              onClick={() => setActiveTab('feeds')}
            >
              <AlertCircle size={18} /> Live Feeds
            </button>
            <button 
              className={`tab ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              <FileText size={18} /> Cases
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'search' && (
              <>
                <SearchPanel 
                  onSearch={handleSearch}
                  onSelectEntity={handleEntitySelect}
                  results={searchResults}
                />
              </>
            )}
            
            {activeTab === 'feeds' && (
              <RealTimeFeeds liveFeeds={liveFeeds} />
            )}

            {activeTab === 'cases' && (
              <CaseManager 
                onCaseSelect={setCurrentCase}
                currentCase={currentCase}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Graph Visualization & Data Details */}
        <div className="panel right-panel">
          <div className="tabs">
            <button 
              className="tab active"
              onClick={() => setActiveTab('graph')}
            >
              <Network size={18} /> Relationships
            </button>
            <button 
              className="tab"
              onClick={() => setActiveTab('data')}
            >
              <FileText size={18} /> Details
            </button>
          </div>

          <div className="panel-content">
            {selectedEntity ? (
              <>
                {activeTab !== 'graph' && (
                  <DataPanel entity={selectedEntity} />
                )}
                {activeTab === 'graph' && graphData.nodes.length > 0 && (
                  <GraphView data={graphData} />
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Select an entity to view relationships and details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
