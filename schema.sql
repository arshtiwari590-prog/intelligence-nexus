-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- People table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  founded_year INTEGER,
  industry VARCHAR(100),
  employee_count INTEGER,
  revenue_usd BIGINT,
  owner_id UUID REFERENCES people(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties/Assets table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_type VARCHAR(50),
  owner_id UUID REFERENCES people(id),
  company_id UUID REFERENCES companies(id),
  purchase_date DATE,
  value_usd BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  facility_type VARCHAR(100),
  company_id UUID REFERENCES companies(id),
  address VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executives table
CREATE TABLE executives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id),
  company_id UUID REFERENCES companies(id),
  title VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEC Filings table
CREATE TABLE sec_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  filing_type VARCHAR(20),
  filing_date DATE,
  filing_url VARCHAR(500),
  summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Breaches table
CREATE TABLE breaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  phone VARCHAR(20),
  breach_name VARCHAR(255),
  breach_date DATE,
  record_count INTEGER,
  status VARCHAR(50),
  data_types TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sanctions table
CREATE TABLE sanctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name VARCHAR(255),
  entity_type VARCHAR(50),
  list_name VARCHAR(255),
  date_added DATE,
  risk_level VARCHAR(20),
  country VARCHAR(100),
  person_id UUID REFERENCES people(id),
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live Aircraft tracking
CREATE TABLE live_aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icao24 VARCHAR(6),
  callsign VARCHAR(8),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  altitude INTEGER,
  velocity DECIMAL(10, 2),
  heading DECIMAL(10, 2),
  on_ground BOOLEAN,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trajectory JSONB
);

-- Live Vessels tracking
CREATE TABLE live_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mmsi VARCHAR(9),
  imo VARCHAR(7),
  name VARCHAR(255),
  callsign VARCHAR(7),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(10, 2),
  course DECIMAL(10, 2),
  destination VARCHAR(255),
  ship_type VARCHAR(100),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investigation Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID
);

-- Case Entities linking entities to cases
CREATE TABLE case_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  entity_id UUID,
  entity_type VARCHAR(50),
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_people_name ON people(name);
CREATE INDEX idx_people_email ON people(email);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_facilities_company ON facilities(company_id);
CREATE INDEX idx_breaches_email ON breaches(email);
CREATE INDEX idx_sanctions_entity ON sanctions(entity_name);
CREATE INDEX idx_aircraft_callsign ON live_aircraft(callsign);
CREATE INDEX idx_vessels_mmsi ON live_vessels(mmsi);
CREATE INDEX idx_cases_status ON cases(status);

-- Create spatial indexes
CREATE INDEX idx_properties_geom ON properties USING GIST(
  ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326)
);
CREATE INDEX idx_facilities_geom ON facilities USING GIST(
  ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326)
);
