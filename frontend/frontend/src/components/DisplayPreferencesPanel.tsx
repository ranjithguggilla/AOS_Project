import { Button, ButtonGroup } from 'react-bootstrap';
import { useUI } from '../store/UIContext';

export default function DisplayPreferencesPanel() {
  const {
    transparencyMode,
    setTransparencyMode,
    visualStyle,
    setVisualStyle,
    isLowPowerDevice,
    isHeavyInteraction,
  } = useUI();

  return (
    <div id="display-preferences" className="profile-display-settings display-preferences-panel">
      <h4 className="display-preferences-title mb-3">Display Preferences</h4>

      <div className="display-preferences-row mb-2">
        <span className="transparency-label align-self-center">Visual Style</span>
        <ButtonGroup size="sm" className="transparency-mode-control" aria-label="Visual style mode">
          <Button
            variant={visualStyle === 'liquid' ? 'primary' : 'outline-secondary'}
            onClick={() => setVisualStyle('liquid')}
          >
            Liquid
          </Button>
          <Button
            variant={visualStyle === 'matte' ? 'primary' : 'outline-secondary'}
            onClick={() => setVisualStyle('matte')}
          >
            Matte
          </Button>
        </ButtonGroup>
      </div>
      <small className="transparency-hint d-block mb-3 ps-1 display-preferences-hint-indent">
        Matte turns off glass-style blur for a flatter, calmer interface.
      </small>

      <div className="display-preferences-row">
        <span className="transparency-label align-self-center">Transparency</span>
        <ButtonGroup size="sm" className="transparency-mode-control" aria-label="Transparency mode">
          <Button
            variant={transparencyMode === 'auto' ? 'primary' : 'outline-secondary'}
            onClick={() => setTransparencyMode('auto')}
          >
            Auto
          </Button>
          <Button
            variant={transparencyMode === 'on' ? 'primary' : 'outline-secondary'}
            onClick={() => setTransparencyMode('on')}
          >
            On
          </Button>
          <Button
            variant={transparencyMode === 'off' ? 'primary' : 'outline-secondary'}
            onClick={() => setTransparencyMode('off')}
          >
            Off
          </Button>
        </ButtonGroup>
      </div>
      {(isLowPowerDevice || isHeavyInteraction) && transparencyMode === 'auto' && (
        <small className="transparency-hint d-block mt-2">
          Auto mode is optimizing for performance/readability.
        </small>
      )}
    </div>
  );
}
