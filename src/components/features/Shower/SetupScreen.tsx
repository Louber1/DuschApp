import React from 'react';

interface SetupScreenProps {
  onStartShower: (duration: number) => void;
  durationPresets: number[];
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartShower, durationPresets }) => {
  return (
    <div className="app setup-screen">
      <div className="setup-content">
        <h1 className="app-title">DuschApp</h1>
        <h2 className="app-subtitle">Contrast Shower Protocol</h2>
        
        <div className="info-box">
          <p className="info-text">
            A scientifically-backed shower protocol that alternates between hot and cold water to:
          </p>
          <ul className="benefits-list">
            <li>Optimize blood circulation</li>
            <li>Reduce inflammation</li>
            <li>Strengthen immune system</li>
            <li>Improve recovery</li>
          </ul>
        </div>

        <div className="duration-selector">
          <h3>Select Shower Duration</h3>
          <div className="preset-buttons">
            {durationPresets.map((duration) => (
              <button
                key={duration}
                className="preset-button"
                onClick={() => onStartShower(duration)}
              >
                {duration} min
              </button>
            ))}
          </div>
        </div>

        <div className="protocol-info">
          <h4>Protocol Overview:</h4>
          <div className="protocol-details">
            <div className="protocol-item hot-item">
              <span className="protocol-label">HOT</span>
              <span className="protocol-temp">38-43°C</span>
              <span className="protocol-time">~2-4 min</span>
            </div>
            <div className="protocol-item cold-item">
              <span className="protocol-label">COLD</span>
              <span className="protocol-temp">10-16°C</span>
              <span className="protocol-time">~1-2 min</span>
            </div>
          </div>
          <p className="protocol-note">3-4 cycles • Always ends with cold</p>
        </div>

        <div className="disclaimer">
          <p>⚠️ Important: Do not use this protocol when sick, feverish, or physically weakened. Consult a healthcare professional if you have any medical conditions.</p>
        </div>
      </div>
    </div>
  );
};
