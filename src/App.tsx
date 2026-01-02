import React, { useState, useEffect, useRef } from 'react';
import NoSleep from 'nosleep.js';
import './App.css';

type Phase = 'setup' | 'hot' | 'cold';

interface ShowerConfig {
  totalDuration: number; // in minutes
  hotDuration: number; // in seconds
  coldDuration: number; // in seconds
  totalCycles: number;
}

function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [config, setConfig] = useState<ShowerConfig | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLastPhase, setIsLastPhase] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const noSleepRef = useRef<NoSleep | null>(null);

  // Duration presets in minutes
  const durationPresets = [10, 15, 20, 25];

  // Initialize NoSleep instance
  useEffect(() => {
    noSleepRef.current = new NoSleep();
    return () => {
      if (noSleepRef.current && noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
      }
    };
  }, []);

  // Enable NoSleep to keep screen on (works on iOS!)
  const enableNoSleep = () => {
    try {
      if (noSleepRef.current && !noSleepRef.current.isEnabled) {
        noSleepRef.current.enable();
        console.log('NoSleep enabled - screen will stay on');
      }
    } catch (err) {
      console.error('NoSleep enable error:', err);
    }
  };

  // Disable NoSleep
  const disableNoSleep = () => {
    try {
      if (noSleepRef.current && noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
        console.log('NoSleep disabled');
      }
    } catch (err) {
      console.error('NoSleep disable error:', err);
    }
  };

  // Calculate shower configuration based on total duration
  const calculateConfig = (totalMinutes: number): ShowerConfig => {
    const totalSeconds = totalMinutes * 60;
    
    // Base protocol: 4 min hot, 2 min cold per cycle
    const baseHotDuration = 4 * 60; // 240 seconds
    const baseColdDuration = 2 * 60; // 120 seconds
    const baseCycleDuration = baseHotDuration + baseColdDuration; // 360 seconds
    
    // Calculate how many complete cycles fit
    let cycles = Math.floor(totalSeconds / baseCycleDuration);
    
    // Ensure at least 3 cycles, max 5
    cycles = Math.max(3, Math.min(5, cycles));
    
    // Adjust durations to fit exactly
    const adjustedCycleDuration = totalSeconds / cycles;
    const hotDuration = Math.round((adjustedCycleDuration / baseCycleDuration) * baseHotDuration);
    const coldDuration = Math.round((adjustedCycleDuration / baseCycleDuration) * baseColdDuration);
    
    return {
      totalDuration: totalMinutes,
      hotDuration,
      coldDuration,
      totalCycles: cycles
    };
  };

  // Start the shower with selected duration
  const startShower = (duration: number) => {
    const newConfig = calculateConfig(duration);
    setConfig(newConfig);
    setSelectedDuration(duration);
    setCurrentCycle(1);
    setPhase('hot');
    setTimeRemaining(newConfig.hotDuration);
    setIsPaused(false);
    setIsLastPhase(false);
    
    // Enable NoSleep to keep screen on
    enableNoSleep();
  };

  // Reset to setup screen
  const resetShower = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Disable NoSleep when stopping
    disableNoSleep();
    
    setPhase('setup');
    setConfig(null);
    setCurrentCycle(1);
    setTimeRemaining(0);
    setIsPaused(false);
    setIsLastPhase(false);
  };

  // Toggle pause/resume
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Timer logic
  useEffect(() => {
    if (phase === 'setup' || isPaused || !config) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up for current phase
          if (phase === 'hot') {
            // Switch to cold
            setPhase('cold');
            
            // Check if this is the last cold phase
            const isLast = currentCycle === config.totalCycles;
            setIsLastPhase(isLast);
            
            return config.coldDuration;
          } else {
            // Switch to hot or end
            if (currentCycle < config.totalCycles) {
              setCurrentCycle((c) => c + 1);
              setPhase('hot');
              return config.hotDuration;
            } else {
              // Shower complete
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              // Disable NoSleep when shower completes
              disableNoSleep();
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [phase, isPaused, config, currentCycle]);

  // Cleanup: Disable NoSleep when component unmounts
  useEffect(() => {
    return () => {
      disableNoSleep();
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render setup screen
  if (phase === 'setup') {
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
                  onClick={() => startShower(duration)}
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
                <span className="protocol-time">~4 min</span>
              </div>
              <div className="protocol-item cold-item">
                <span className="protocol-label">COLD</span>
                <span className="protocol-temp">10-16°C</span>
                <span className="protocol-time">~2 min</span>
              </div>
            </div>
            <p className="protocol-note">3-5 cycles • Always ends with cold</p>
          </div>
        </div>
      </div>
    );
  }

  // Render shower screen
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
            Cycle {currentCycle} of {config?.totalCycles}
          </p>
          {isLastPhase && (
            <p className="final-phase">Final cold phase</p>
          )}
        </div>

        <div className="controls">
          <button className="control-button" onClick={togglePause}>
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="control-button reset-button" onClick={resetShower}>
            ⏹ Stop
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
