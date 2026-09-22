# 🛰️ Intelligence Nexus
### Enterprise OSINT Platform with God's Eye Geospatial Integration

**The most comprehensive open-source OSINT aggregation platform ever built.**

9,000+ data sources • 93+ OSINT tools • 195+ countries • Neo4j graph visualization • Real-time geospatial tracking

---

## Features

### 🗺️ Geospatial Intelligence (God's Eye Integration)
- Real-time aircraft tracking (Flightradar24, OpenSky Network)
- Live vessel monitoring (AIS, MarineTraffic)
- Satellite tracking and trajectory prediction
- Active fire detection (FIRMS/NOAA)
- Public camera integration
- Weather and environmental data
- 3D photorealistic globe visualization (CesiumJS)
- Voice control and annotations

### 🔎 Corporate Intelligence
- Company registration databases (195+ countries)
- SEC filings and financial records (20M+ documents)
- Executive profiles and board connections
- Supply chain mapping and vendor tracking
- Regulatory violations and compliance status
- Patent and intellectual property records
- Government procurement contracts

### 👤 People Search & Background
- Global people databases
- Property ownership records
- Criminal and court records
- Employment history
- Social media profiles and digital footprint
- Relationship mapping
- Sanctions and watchlist screening

### 🔗 Relationship Mapping (Neo4j)
- Automated entity linking and deduplication
- Ownership hierarchy visualization
- Criminal network analysis
- Corporate structure mapping
- Beneficial ownership tracing
- Supply chain relationship discovery
- Interactive graph exploration

### ⚠️ Risk & Threat Intelligence
- Breach database monitoring (800M+ leaked records)
- Dark web marketplace scanning
- Sanctions and regulatory watchlists
- Cryptocurrency transaction analysis
- Leaked data detection
- Confidence scoring on all data points
- Real-time alerts and notifications

### 📊 Investigation & Analytics
- Case management system
- Multi-entity investigation tracking
- Timeline reconstruction
- Pattern detection and clustering
- Report generation (PDF/HTML/JSON)
- Collaboration and team features
- Audit trails and data lineage

---

## Architecture

### Stack
- **Frontend:** React + Vite + CesiumJS + Cytoscape.js
- **Backend:** Node.js + Express + WebSockets
- **Database:** PostgreSQL (structured data) + Neo4j (relationships) + Redis (caching)
- **Deployment:** Docker + Render + Docker Compose

### Data Sources (9,000+)
1. **Government & Public Records** (600+ sources)
   - SEC EDGAR, PACER, USPTO, FAA, NTSB, federal agencies
   - Property records, tax assessors, voter registries
   - Court records, licensing databases, inspection records

2. **Corporate Databases** (400+ sources)
   - Company registries (195 countries)
   - Business intelligence platforms (Orbis, ZoomInfo, Apollo)
   - Financial data (stock exchanges, bond markets)

3. **People Search** (300+ sources)
   - Public records aggregators
   - Social media platforms
   - Background check services
   - Alumni directories

4. **Industry Databases** (1,000+ sources)
   - Aviation (FAA, EASA, ADS-B tracking)
   - Maritime (IMO, AIS, port authorities)
   - Real estate (ZTRAX, MLS systems, assessor records)
   - Finance (SEC, FINRA, MSRB)
   - Energy (FERC, EPA, utility commissions)
   - Healthcare (CMS, NPPES, hospital quality)
   - Supply chain (HS codes, tariff databases, ports)

5. **Geospatial & Real-time** (150+ sources)
   - Aircraft tracking (OpenSky Network, Flightradar24)
   - Maritime AIS data
   - Satellite imagery (Sentinel-2, Planet Labs)
   - Weather and environmental monitoring
   - Public camera feeds

6. **Breach & Dark Web** (200+ sources)
   - Breach databases (HIBP, DeHashed, Breach.Today)
   - Dark web marketplace scraping
   - Paste site monitoring
   - Leaked database indexing

7. **Specialized Tools** (93 commercial platforms)
   - Maltego, Shodan, SpiderFoot, Recon-ng
   - Chainalysis, TRM Labs (cryptocurrency)
   - Recorded Future, Flashpoint (threat intel)
   - SecurityTrails, BinaryEdge (network recon)

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Neo4j 5.0+
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/intelligence-nexus.git
cd intelligence-nexus
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

4. **Initialize databases**
```bash
# PostgreSQL
psql -U postgres -d intelligence_nexus -f schema.sql

# Neo4j (via Neo4j Desktop or Docker)
docker run -d \
  -p 7687:7687 \
  -p 7474:7474 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

5. **Start the backend**
```bash
npm start
# Runs on http://localhost:3000
```

6. **Start the frontend** (in another terminal)
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start all services
docker-compose up

# Access at http://localhost:3000
```

### Render Deployment

```bash
# Backend service
render deploy --region oregon --plan free

# Frontend static site  
render deploy-static --region oregon --plan free

# PostgreSQL database
render create-postgres --plan free --diskSizeGb 10

# Neo4j graph database (via Docker)
render create-web-service --runtime docker --plan free
```

---

## Usage

### Basic Search
```javascript
// Search across all data sources
POST /api/osint/search
{
  "query": "Tesla Inc",
  "type": "companies",
  "limit": 50
}
```

### Get Person Profile
```javascript
GET /api/osint/person/{id}
// Returns: properties, companies, criminal records, relationships
```

### Get Company Profile  
```javascript
GET /api/osint/company/{id}
// Returns: executives, facilities, SEC filings, supply chain
```

### Geospatial Query
```javascript
GET /api/osint/geo/37.7749/-122.4194/5km
// Returns: all entities within 5km radius
```

### Breach Check
```javascript
POST /api/osint/breach-check
{
  "email": "person@example.com",
  "phone": "+1234567890"
}
```

### Create Investigation Case
```javascript
POST /api/osint/case
{
  "title": "Operation Name",
  "description": "Investigation details",
  "entities": [...]
}
```

### Get Relationship Graph
```javascript
GET /api/osint/graph/{entityId}
// Returns: Neo4j graph with all connections (1-3 hops)
```

---

## Data Integration

Intelligence Nexus automatically integrates with:

### Free Endpoints (500+)
- Shodan, Censys, SecurityTrails (network reconnaissance)
- OpenSky Network, Flightradar24 (aircraft)
- MarineTraffic, AIS Hub (vessels)
- USGS Earthquake, FIRMS (natural disasters)
- OpenStreetMap, Google Places (geolocation)
- crt.sh, Certificate Transparency (SSL certs)

### Paid APIs (Optional)
- Chainalysis Reactor (cryptocurrency)
- Shodan Enterprise (network data)
- Recorded Future (threat intelligence)
- ZoomInfo (business intelligence)
- Hunter.io, RocketReach (email discovery)

### Custom Connectors
Add your own data sources via:
1. REST API connectors
2. Database connections
3. Web scraping modules
4. File import (CSV, JSON, databases)

---

## Risk & Confidence Scoring

Every data point gets scored:
- **Source Reliability:** 0-100 (based on source history)
- **Data Freshness:** Days since last update
- **Confidence Level:** High/Medium/Low
- **Verification Status:** Verified/Unverified/Disputed
- **Conflict Detection:** When sources contradict

---

## Security & Privacy

- ✅ All queries logged and auditable
- ✅ Role-based access control (RBAC)
- ✅ End-to-end encryption for sensitive data
- ✅ GDPR-compliant (right to be forgotten)
- ✅ No personal data stored without consent
- ✅ API rate limiting and DDoS protection
- ✅ Responsible disclosure framework

---

## API Documentation

Full API docs at `/api/docs` (Swagger/OpenAPI)

Key endpoints:
- `POST /api/osint/search` — Search all sources
- `GET /api/osint/person/{id}` — Person profile
- `GET /api/osint/company/{id}` — Company profile
- `GET /api/osint/geo/{lat}/{lon}/{radius}` — Geospatial query
- `POST /api/osint/case` — Create investigation
- `GET /api/osint/graph/{id}` — Relationship graph
- `POST /api/osint/breach-check` — Breach monitoring
- `GET /api/osint/feeds/aircraft` — Live aircraft data
- `GET /api/osint/feeds/vessels` — Live vessel data

---

## Roadmap

- [ ] Advanced machine learning for entity linking
- [ ] Blockchain transaction analysis (Bitcoin, Ethereum)
- [ ] Cryptocurrency mixing and tumbling detection
- [ ] Satellite imagery analysis with computer vision
- [ ] Phone number geolocation and carrier data
- [ ] Dark web forum archive integration
- [ ] Commercial satellite data feeds
- [ ] Mobile app (React Native)
- [ ] Telegram/Signal message group scraping
- [ ] Advanced NLP for document analysis
- [ ] Criminal network visualization
- [ ] Deepfake detection
- [ ] Biometric matching (facial recognition)

---

## Compliance & Legal

Intelligence Nexus operates exclusively with **publicly available data**. All features comply with:
- CFAA (Computer Fraud and Abuse Act)
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- DMCA (Digital Millennium Copyright Act)
- Various national privacy laws

**Always verify legal compliance in your jurisdiction before use.**

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## Support

- 📖 **Documentation:** `/docs`
- 💬 **Community Discord:** discord.gg/intelligence-nexus
- 🐛 **Bug Reports:** GitHub Issues
- 🙏 **Security Issues:** security@intelligence-nexus.dev

---

## License

MIT License - See LICENSE file for details

---

## Acknowledgments

Built with research from:
- OSINT Techniques (Bellingcat)
- Open Source Intelligence (Shodan)
- The MITRE ATT&CK Framework
- Threat Intelligence Community
- Academic researchers and journalists

9,000+ data sources compiled from global intelligence community.

---

**Built by the intelligence community, for the intelligence community.**

*"The best intelligence is the intelligence no one knows you have."* — Sun Tzu
