import { useState, useEffect, useRef } from 'react';
import { Phase, ShowerConfig } from '../types';

interface UseShowerTimerReturn {
  phase: Phase;
  currentCycle: number;
  timeRemaining: number;
  isPaused: boolean;
  isLastPhase: boolean;
  togglePause: () => void;
  setPhase: (phase: Phase) => void;
  setCurrentCycle: (cycle: number) => void;
  setTimeRemaining: (time: number) => void;
  setIsPaused: (paused: boolean) => void;
  setIsLastPhase: (isLast: boolean) => void;
}

/**
 * Custom hook to manage shower timer logic
 */
export const useShowerTimer = (config: ShowerConfig | null): UseShowerTimerReturn => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLastPhase, setIsLastPhase] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  return {
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
  };
};
