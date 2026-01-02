import React from 'react';
import { Phase, ShowerConfig } from '../../../types';
import { formatTime } from '../../../utils/formatTime';

interface ShowerScreenProps {
  phase: Phase;
  timeRemaining: number;
  currentCycle: number;
  config: ShowerConfig;
  isPaused: boolean;
  isLastPhase: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

export const ShowerScreen: React.FC<ShowerScreenProps> = ({
  phase,
  timeRemaining,
  currentCycle,
  config,
  isPaused,
  isLastPhase,
  onTogglePause,
  onReset,
}) => {
  const isHot = phase === 'hot';
  const phaseLabel = isHot ? 'HOT' : 'COLD';
  const tempRange = isHot ? '38-43°C' : '10-16°C';

  return (
    <div className={`app shower-screen ${phase}-phase`}>
      <div className="shower-content">
        <div className="phase-header">
          <h1 className="phase-label">{phaseLabel}</h1>
          <p className="temp-range">{tempRange}</p>
        </div>

        <div className="timer-display">
          <div className="time">{formatTime(timeRemaining)}</div>
          {timeRemaining === 0 && (
            <div className="completion-message">
              <h2>Shower Complete! 🎉</h2>
              <p>Great job following the protocol!</p>
            </div>
          )}
        </div>

        <div className="cycle-info">
          <p className="cycle-text">
            Cycle {currentCycle} of {config.totalCycles}
          </p>
          {isLastPhase && (
            <p className="final-phase">Final cold phase</p>
          )}
        </div>

        <div className="controls">
          <button className="control-button" onClick={onTogglePause}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="control-button reset-button" onClick={onReset}>
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  );
};
