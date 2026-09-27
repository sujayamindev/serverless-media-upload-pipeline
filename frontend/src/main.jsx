import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import { IconContext } from '@phosphor-icons/react';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Regular gives 1–1.4px lines at 16–22px, matching the theme's hairlines.
          1em lets MUI size icons via font-size. */}
      <IconContext.Provider value={{ weight: 'regular', size: '1em' }}>
        <App />
      </IconContext.Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
