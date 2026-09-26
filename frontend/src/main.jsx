import React from 'react';
import ReactDOM from 'react-dom/client';
// Newsreader with the optical-size axis stands in for Signifier (DESIGN.md §3).
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
