// pages/NotFound/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-content fade-in">
        {/* TDC Branding tag */}
        <span className="notfound-tag">
          <span>💑</span>
          TDC Matchmaker
        </span>

        {/* 404 number */}
        <div className="notfound-code">404</div>

        {/* Animated emoji */}
        <span className="notfound-emoji">💔</span>

        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-desc">
          Looks like this page ran away like a cold-feet bride or groom! 
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="notfound-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Go to Dashboard
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Go Back
          </button>
        </div>

        <div className="notfound-divider">or try these links</div>

        <div className="notfound-links">
          <a href="/login">Login</a>
          <a href="/">All Clients</a>
        </div>
      </div>
    </div>
  );
}

export default NotFound;