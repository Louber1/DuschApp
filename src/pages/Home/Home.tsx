import React, { useState } from 'react';
import { ShowerConfig } from '../../types';
import { calculateShowerConfig } from '../../utils/showerConfig';
import { useNoSleep } from '../../hooks/useNoSleep';
import { useShowerTimer } from '../../hooks/useShowerTimer';
import { SetupScreen } from '../../components/features/Shower/SetupScreen';
import { ShowerScreen } from '../../components/features/Shower/ShowerScreen';
import './Home.styles.css';

export const Home: React.FC = () => {
  const [config, setConfig] = useState<ShowerConfig | null>(null);
  const { enableNoSleep, disableNoSleep } = useNoSleep();
  const {
    phase,
    currentCycle,
    timeRemaining,
    isPaused,
    isLastPhase,
    togglePause,
    setPhase,
    setCurrentCycle,
    setTimeRemaining,
    setIsPaused,
    setIsLastPhase,
  } = useShowerTimer(config);

  // Re-enable NoSleep on phase changes to keep screen awake throughout all cycles
  React.useEffect(() => {
    if (phase === 'hot' || phase === 'cold') {
      enableNoSleep();
    }
  }, [phase, enableNoSleep]);

  // Duration presets in minutes
  const durationPresets = [10, 15, 20, 25];

  // Start the shower with selected duration
  const startShower = (duration: number) => {
    const newConfig = calculateShowerConfig(duration);
    setConfig(newConfig);
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
    // Disable NoSleep when stopping
    disableNoSleep();
    
    setPhase('setup');
    setConfig(null);
    setCurrentCycle(1);
    setTimeRemaining(0);
    setIsPaused(false);
    setIsLastPhase(false);
  };

  // Render setup screen
  if (phase === 'setup') {
    return <SetupScreen onStartShower={startShower} durationPresets={durationPresets} />;
  }

  // Render shower screen
  return (
    <ShowerScreen
      phase={phase}
      timeRemaining={timeRemaining}
      currentCycle={currentCycle}
      config={config!}
      isPaused={isPaused}
      isLastPhase={isLastPhase}
      onTogglePause={togglePause}
      onReset={resetShower}
    />
  );
};
