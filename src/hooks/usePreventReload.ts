import { useEffect, useRef } from 'react';

export function usePreventReload(enabled: boolean = true) {
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVisibilityRef = useRef<boolean>(!document.hidden);

  useEffect(() => {
    if (!enabled) return;

    console.log('🔄 usePreventReload - Hook initialized');
    console.log('🔄 usePreventReload - Current hidden state:', document.hidden);
    console.log('🔄 usePreventReload - Last visibility ref:', lastVisibilityRef.current);

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      
      console.log('🔄 Visibility change detected - isHidden:', isHidden);
      
      // Clear any existing timeout
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
        reloadTimeoutRef.current = null;
      }

      if (isHidden) {
        // Page is being hidden/minimized - save current state
        console.log('🔄 Page hidden - preventing reload on restore');
        lastVisibilityRef.current = true;
      } else {
        // Page is being restored - prevent immediate reload
        console.log('🔄 Page restored - preventing data reload');
        lastVisibilityRef.current = false;
        
        // Set a timeout to allow normal operation after a delay
        reloadTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Reload prevention timeout - normal operation resumed');
          reloadTimeoutRef.current = null;
        }, 1000); // 1 second grace period
      }
    };

    const handleFocus = () => {
      console.log('🔄 Window focused during grace period');
    };

    const handleBlur = () => {
      console.log('🔄 Window blurred');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled]);

  return {
    isPreventingReload: () => {
      const preventing = reloadTimeoutRef.current !== null;
      console.log('🔄 isPreventingReload called:', preventing, 'timeout exists:', !!reloadTimeoutRef.current);
      return preventing;
    },
    wasRecentlyHidden: () => lastVisibilityRef.current,
    isRestoringFromMinimize: () => {
      // Check if we're currently in the grace period after restoration
      const restoring = reloadTimeoutRef.current !== null && !lastVisibilityRef.current;
      console.log('🔄 isRestoringFromMinimize called:', restoring);
      return restoring;
    }
  };
}
