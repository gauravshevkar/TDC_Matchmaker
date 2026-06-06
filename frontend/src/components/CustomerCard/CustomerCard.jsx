// components/CustomerCard/CustomerCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../StatusBadge/StatusBadge';
import './CustomerCard.css';

const AVATARS = {
  Male:   'M', Female: 'F', Other: 'O'
};

const GENDER_COLOR = {
  Male:   'linear-gradient(135deg, #6B9FD4, #4a7ab5)',
  Female: 'linear-gradient(135deg, #C9956A, #a67850)',
  Other:  'linear-gradient(135deg, #9B6BD4, #7a4fb5)',
};

export default function CustomerCard({ customer }) {
  const navigate = useNavigate();

  const age = customer.age ?? (
    customer.dateOfBirth
      ? Math.floor((Date.now() - new Date(customer.dateOfBirth)) / 3.156e10)
      : null
  );

  const initials = `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="customer-card card" onClick={() => navigate(`/customers/${customer._id}`)}>
      <div className="customer-card-inner">
        {/* Avatar */}
        <div
          className="customer-avatar"
          style={{ background: GENDER_COLOR[customer.gender] || GENDER_COLOR.Other }}
        >
          {initials}
          {customer.verified && (
            <span className="verified-dot" title="Verified">✓</span>
          )}
        </div>

        {/* Info */}
        <div className="customer-info">
          <div className="customer-name-row">
            <h3 className="customer-name">
              {customer.firstName} {customer.lastName}
            </h3>
            <StatusBadge status={customer.status || 'New'} />
          </div>

          <div className="customer-meta">
            {age && <span className="meta-chip">{age} yrs</span>}
            {customer.gender && <span className="meta-chip gender-chip">{customer.gender}</span>}
            {customer.city && (
              <span className="meta-chip">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {customer.city}
              </span>
            )}
            {customer.maritalStatus && (
              <span className="meta-chip">{customer.maritalStatus}</span>
            )}
          </div>

          {customer.designation && (
            <p className="customer-job text-sm text-secondary">
              {customer.designation}
              {customer.currentCompany ? ` @ ${customer.currentCompany}` : ''}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="customer-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
}