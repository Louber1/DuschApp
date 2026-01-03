import { useEffect, useRef, useCallback } from 'react';
import NoSleep from 'nosleep.js';

/**
 * Custom hook to manage NoSleep (screen wake lock)
 */
export const useNoSleep = () => {
  const noSleepRef = useRef<NoSleep | null>(null);

  // Initialize NoSleep instance
  useEffect(() => {
    noSleepRef.current = new NoSleep();
    return () => {
      if (noSleepRef.current && noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
      }
    };
  }, []);

  const enableNoSleep = useCallback(() => {
    try {
      if (noSleepRef.current && !noSleepRef.current.isEnabled) {
        noSleepRef.current.enable();
        console.log('NoSleep enabled - screen will stay on');
      }
    } catch (err) {
      console.error('NoSleep enable error:', err);
    }
  }, []);

  const disableNoSleep = useCallback(() => {
    try {
      if (noSleepRef.current && noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
        console.log('NoSleep disabled');
      }
    } catch (err) {
      console.error('NoSleep disable error:', err);
    }
  }, []);

  return { enableNoSleep, disableNoSleep };
};
