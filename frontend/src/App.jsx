// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css'

import Login          from './pages/Login/Login';
import Dashboard      from './pages/Dashboard/Dashboard';
import CustomerDetail from './pages/CustomerDetail/CustomerDetail';
import AddCustomer    from './pages/AddCustomer/AddCustomer';
import Matches        from './pages/Matches/Matches';
import NotFound       from './pages/NotFound/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Add Customer - must be BEFORE /:id to avoid conflict */}
          <Route path="/customers/new" element={
            <ProtectedRoute><AddCustomer /></ProtectedRoute>
          } />

          <Route path="/customers/:id" element={
            <ProtectedRoute><CustomerDetail /></ProtectedRoute>
          } />

          <Route path="/customers/:id/matches" element={
            <ProtectedRoute><Matches /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>


        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: '#4CAF7D', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#D46B6B', secondary: '#fff' } },
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}