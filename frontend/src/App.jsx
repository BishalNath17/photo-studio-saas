import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import StudioPage from './pages/StudioPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155' },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/studio" replace />} />
          <Route path="/studio" element={<StudioPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/studio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
