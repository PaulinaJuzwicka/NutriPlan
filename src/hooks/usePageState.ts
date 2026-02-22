import { useState, useEffect, useRef } from 'react';

interface PageState {
  scrollPosition: number;
  formData?: any;
  selectedItems?: string[];
  filters?: any;
  expandedSections?: string[];
}

const PAGE_STATE_KEY = 'nutriplan_page_states';

export function usePageState(pageKey: string) {
  const [isRestored, setIsRestored] = useState(false);
  const stateRef = useRef<PageState>({
    scrollPosition: 0,
    formData: {},
    selectedItems: [],
    filters: {},
    expandedSections: []
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem(PAGE_STATE_KEY);
      if (savedStates) {
        const states = JSON.parse(savedStates);
        const pageState = states[pageKey];
        if (pageState) {
          stateRef.current = { ...stateRef.current, ...pageState };
          
          // Restore scroll position
          if (pageState.scrollPosition) {
            setTimeout(() => {
              window.scrollTo(0, pageState.scrollPosition);
            }, 100);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore page state:', error);
    } finally {
      setIsRestored(true);
    }
  }, [pageKey]);

  // Save state to localStorage
  const saveState = (updates: Partial<PageState>) => {
    stateRef.current = { ...stateRef.current, ...updates };
    
    try {
      const savedStates = localStorage.getItem(PAGE_STATE_KEY);
      const states = savedStates ? JSON.parse(savedStates) : {};
      states[pageKey] = stateRef.current;
      localStorage.setItem(PAGE_STATE_KEY, JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to save page state:', error);
    }
  };

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      saveState({ scrollPosition: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageKey]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveState({ scrollPosition: window.scrollY });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageKey]);

  // Visibility change detection (minimize/restore)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden/minimized
        saveState({ scrollPosition: window.scrollY });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pageKey]);

  return {
    isRestored,
    state: stateRef.current,
    saveState,
    updateFormData: (data: any) => saveState({ formData: { ...stateRef.current.formData, ...data } }),
    setSelectedItems: (items: string[]) => saveState({ selectedItems: items }),
    setFilters: (filters: any) => saveState({ filters: { ...stateRef.current.filters, ...filters } }),
    toggleExpandedSection: (section: string) => {
      const current = stateRef.current.expandedSections || [];
      const expanded = current.includes(section) 
        ? current.filter(s => s !== section)
        : [...current, section];
      saveState({ expandedSections: expanded });
    },
    clearState: () => {
      stateRef.current = {
        scrollPosition: 0,
        formData: {},
        selectedItems: [],
        filters: {},
        expandedSections: []
      };
      try {
        const savedStates = localStorage.getItem(PAGE_STATE_KEY);
        if (savedStates) {
          const states = JSON.parse(savedStates);
          delete states[pageKey];
          localStorage.setItem(PAGE_STATE_KEY, JSON.stringify(states));
        }
      } catch (error) {
        console.warn('Failed to clear page state:', error);
      }
    }
  };
}
