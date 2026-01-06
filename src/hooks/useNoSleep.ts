import { useEffect, useRef, useCallback } from 'react';
import NoSleep from 'nosleep.js';

/**
 * Custom hook to manage screen wake lock
 * Uses native Screen Wake Lock API when available (Chrome, Safari 16.4+)
 * Falls back to NoSleep.js for older browsers (Firefox, etc.)
 */
export const useNoSleep = () => {
  const noSleepRef = useRef<NoSleep | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isNativeWakeLockSupported = 'wakeLock' in navigator;

  // Initialize NoSleep.js fallback
  useEffect(() => {
    if (!isNativeWakeLockSupported) {
      noSleepRef.current = new NoSleep();
    }
    
    return () => {
      // Cleanup on unmount
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      if (noSleepRef.current && noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
      }
    };
  }, [isNativeWakeLockSupported]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    if (!isNativeWakeLockSupported) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current !== null) {
        try {
          // Wake lock was released when page was hidden, re-acquire it
          if (navigator.wakeLock) {
            const wakeLock = await navigator.wakeLock.request('screen');
            wakeLockRef.current = wakeLock;
            console.log('Wake Lock re-acquired after visibility change');
          }
        } catch (err) {
          console.error('Failed to re-acquire wake lock:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isNativeWakeLockSupported]);

  const enableNoSleep = useCallback(async () => {
    try {
      if (isNativeWakeLockSupported && navigator.wakeLock) {
        // Use native Screen Wake Lock API
        if (wakeLockRef.current === null) {
          const wakeLock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = wakeLock;
          console.log('Screen Wake Lock enabled (native API) - screen will stay on');
          
          wakeLock.addEventListener('release', () => {
            console.log('Screen Wake Lock released');
          });
        }
      } else {
        // Fallback to NoSleep.js
        if (noSleepRef.current && !noSleepRef.current.isEnabled) {
          noSleepRef.current.enable();
          console.log('NoSleep enabled (fallback) - screen will stay on');
        }
      }
    } catch (err) {
      console.error('Wake lock error:', err);
      // If native API fails, try NoSleep.js as fallback
      if (isNativeWakeLockSupported && noSleepRef.current && !noSleepRef.current.isEnabled) {
        noSleepRef.current = new NoSleep();
        noSleepRef.current.enable();
        console.log('Fell back to NoSleep.js after native API failure');
      }
    }
  }, [isNativeWakeLockSupported]);

  const disableNoSleep = useCallback(async () => {
    try {
      if (isNativeWakeLockSupported && wakeLockRef.current) {
        // Release native wake lock
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock disabled (native API)');
      } else if (noSleepRef.current && noSleepRef.current.isEnabled) {
        // Disable NoSleep.js fallback
        noSleepRef.current.disable();
        console.log('NoSleep disabled (fallback)');
      }
    } catch (err) {
      console.error('Wake lock disable error:', err);
    }
  }, [isNativeWakeLockSupported]);

  return { enableNoSleep, disableNoSleep };
};
