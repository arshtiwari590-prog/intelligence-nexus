import React from 'react';

export function DataPanel({ entity }) {
  return (
    <div className="data-panel">
      <h3>{entity.name}</h3>
      
      {entity.people && (
        <div className="data-section">
          <h4>People Information</h4>
          <dl>
            <dt>Email:</dt>
            <dd>{entity.email}</dd>
            <dt>Phone:</dt>
            <dd>{entity.phone}</dd>
            <dt>Location:</dt>
            <dd>{entity.location}</dd>
          </dl>
        </div>
      )}

      {entity.companies && entity.companies.length > 0 && (
        <div className="data-section">
          <h4>Associated Companies</h4>
          {entity.companies.map(company => (
            <div key={company.id} className="company-card">
              <strong>{company.name}</strong>
              <p>{company.domain}</p>
            </div>
          ))}
        </div>
      )}

      {entity.properties && entity.properties.length > 0 && (
        <div className="data-section">
          <h4>Properties</h4>
          {entity.properties.map(property => (
            <div key={property.id} className="property-card">
              <strong>{property.address}</strong>
              <p>Value: ${property.value_usd?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {entity.relationships && entity.relationships.length > 0 && (
        <div className="data-section">
          <h4>Relationships</h4>
          {entity.relationships.map((rel, idx) => (
            <div key={idx} className="relationship-item">
              <span>{rel.relationship}</span>
              <strong>{rel.connected.name}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
