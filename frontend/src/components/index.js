export { MapContainer } from './MapContainer';
export { GraphView } from './GraphView';
export { SearchPanel } from './SearchPanel';
export { DataPanel } from './DataPanel';

// Stub components
export function CaseManager({ onCaseSelect, currentCase }) {
  return <div className="case-manager"><p>Case Management Coming Soon</p></div>;
}

export function RealTimeFeeds({ liveFeeds }) {
  return (
    <div className="realtime-feeds">
      <h3>Live Feeds</h3>
      <div>Aircraft: {liveFeeds.aircraft?.length || 0} active</div>
      <div>Vessels: {liveFeeds.vessels?.length || 0} active</div>
      <div>Satellites: {liveFeeds.satellites?.length || 0} tracked</div>
    </div>
  );
}
