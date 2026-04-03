import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DisplayPreferencesPanel from '../components/DisplayPreferencesPanel';

export default function SettingsPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#display-preferences') {
      requestAnimationFrame(() => {
        document.getElementById('display-preferences')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="settings-page py-2">
      <div className="settings-page-inner">
        <h2 className="mb-1">Settings</h2>
        <p className="text-muted mb-4">Adjust how BitForge looks on your device.</p>
        <div className="settings-page-panel-wrap">
          <DisplayPreferencesPanel />
        </div>
      </div>
    </div>
  );
}
