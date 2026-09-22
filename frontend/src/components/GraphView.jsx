import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';

cytoscape.use(cola);

export function GraphView({ data }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.nodes.length === 0) return;

    // Transform data for Cytoscape
    const elements = [];

    // Add nodes
    data.nodes.forEach(node => {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          type: node.type
        }
      });
    });

    // Add edges
    data.edges.forEach(edge => {
      elements.push({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.type
        }
      });
    });

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#1f2937',
            'color': '#ffffff',
            'width': '80px',
            'height': '80px',
            'font-size': '12px',
            'border-width': '2px',
            'border-color': '#4b5563'
          }
        },
        {
          selector: 'node[type="Person"]',
          style: {
            'background-color': '#3b82f6',
            'border-color': '#1e40af'
          }
        },
        {
          selector: 'node[type="Company"]',
          style: {
            'background-color': '#10b981',
            'border-color': '#047857'
          }
        },
        {
          selector: 'node[type="Asset"]',
          style: {
            'background-color': '#f59e0b',
            'border-color': '#d97706'
          }
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': '#9ca3af',
            'target-arrow-color': '#9ca3af',
            'width': '2px',
            'label': 'data(label)',
            'font-size': '10px',
            'text-background-color': '#1f2937',
            'text-background-opacity': 0.8,
            'text-background-padding': '4px'
          }
        },
        {
          selector: 'edge[label="OWNS"]',
          style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'width': '3px'
          }
        },
        {
          selector: 'edge[label="WORKS_AT"]',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6'
          }
        },
        {
          selector: 'edge[label="SUPPLIES"]',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981'
          }
        }
      ],
      layout: {
        name: 'cola',
        directed: true,
        animate: true,
        animationDuration: 500,
        randomize: false,
        maxSimulationTime: 4000,
        ungrabifyWhileSimulating: false,
        fit: true,
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        nodeSpacing: 5,
        flow: { axis: 'y', minSeparation: 30 }
      }
    });

    cyRef.current = cy;

    // Interaction handlers
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      console.log('Node tapped:', node.data());
      node.style({
        'background-color': '#fbbf24'
      });
    });

    cy.on('tap', (event) => {
      if (event.target === cy) {
        cy.elements().style({
          'background-color': function(ele) {
            const type = ele.data('type');
            if (type === 'Person') return '#3b82f6';
            if (type === 'Company') return '#10b981';
            if (type === 'Asset') return '#f59e0b';
            return '#1f2937';
          }
        });
      }
    });

    // Add physics-based interactions
    cy.on('mouseover', 'edge', (event) => {
      event.target.style({
        'width': '4px'
      });
    });

    cy.on('mouseout', 'edge', (event) => {
      event.target.style({
        'width': '2px'
      });
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [data]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        background: '#111827'
      }}
    />
  );
}
