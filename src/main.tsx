import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Reset Supabase instance przy odświeżeniu strony
import { resetSupabaseInstance } from './lib/supabase';

// Wykryj odświeżenie strony
if (window.performance.navigation?.type === 1) {
  console.log('🔄 Page refreshed - resetting Supabase instance');
  resetSupabaseInstance();
} else {
  console.log('🚀 Fresh page load - creating new Supabase instance');
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
