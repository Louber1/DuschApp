import { ShowerConfig } from '../types';

/**
 * Calculate shower configuration based on total duration
 */
export const calculateShowerConfig = (totalMinutes: number): ShowerConfig => {
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
