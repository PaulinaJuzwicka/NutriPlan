import React, { useEffect, useState } from 'react';

interface AppState {
  isMinimized: boolean;
  lastActiveTime: number;
  currentRoute: string;
}

export const AppStateManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({
    isMinimized: false,
    lastActiveTime: Date.now(),
    currentRoute: window.location.pathname
  });

  useEffect(() => {
    // Handle page visibility changes (minimize/restore)
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      const currentTime = Date.now();
      
      setAppState(prev => ({
        ...prev,
        isMinimized: isHidden,
        lastActiveTime: isHidden ? prev.lastActiveTime : currentTime
      }));

      // Save app state to localStorage
      try {
        const currentState = {
          isMinimized: isHidden,
          lastActiveTime: isHidden ? Date.now() : currentTime, // Use current time for both to avoid stale closure
          currentRoute: window.location.pathname,
          timestamp: currentTime
        };
        localStorage.setItem('nutriplan_app_state', JSON.stringify(currentState));
        
        // App state saved silently
      } catch (error) {
        // Failed to save app state handled silently
      }
    };

    // Handle window focus/blur
    const handleFocus = () => {
      handleVisibilityChange();
    };

    const handleBlur = () => {
      handleVisibilityChange();
    };

    // Handle route changes
    const handleRouteChange = () => {
      const newRoute = window.location.pathname;
      const currentTime = Date.now();
      
      setAppState(prev => ({ ...prev, currentRoute: newRoute }));
      
      try {
        const currentState = {
          isMinimized: document.hidden,
          lastActiveTime: currentTime,
          currentRoute: newRoute,
          timestamp: currentTime
        };
        localStorage.setItem('nutriplan_app_state', JSON.stringify(currentState));
      } catch (error) {
        // Failed to save route change handled silently
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Listen for route changes (for SPA)
    let unlisten: (() => void) | null = null;
    if (window.history) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        setTimeout(handleRouteChange, 0);
      };
      
      window.history.replaceState = function(...args) {
        originalReplaceState.apply(window.history, args);
        setTimeout(handleRouteChange, 0);
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      unlisten = () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', handleRouteChange);
      };
    }

    // Restore app state on mount
    try {
      const savedState = localStorage.getItem('nutriplan_app_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const timeSinceLastActive = Date.now() - parsed.lastActiveTime;
        
        // App state restored silently
        
        setAppState({
          isMinimized: document.hidden,
          lastActiveTime: parsed.lastActiveTime,
          currentRoute: parsed.currentRoute
        });
      }
    } catch (error) {
      // Failed to restore app state handled silently
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('popstate', handleRouteChange);
      if (unlisten) unlisten();
    };
  }, []); // Remove appState.lastActiveTime dependency to prevent infinite loops

  // Prevent unnecessary re-renders
  return <>{children}</>;
};
