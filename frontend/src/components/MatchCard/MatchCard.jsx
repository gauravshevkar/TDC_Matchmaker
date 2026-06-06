// components/MatchCard/MatchCard.jsx
import React, { useState } from 'react';
import StatusBadge from '../StatusBadge/StatusBadge';
import './MatchCard.css';

const SCORE_COLOR = (score) => {
  if (score >= 75) return '#4CAF7D';
  if (score >= 55) return '#6B9FD4';
  if (score >= 35) return '#D4A853';
  return '#C9956A';
};

export default function MatchCard({ match, onSend, sending }) {
  const [expanded, setExpanded] = useState(false);
  const { profile, score, category, explanation, highlights = [], considerations = [], aiPowered, breakdown } = match;

  const age = profile.age ?? (
    profile.dateOfBirth
      ? Math.floor((Date.now() - new Date(profile.dateOfBirth)) / 3.156e10)
      : null
  );
  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  const scoreColor = SCORE_COLOR(score);

  return (
    <div className={`match-card card ${expanded ? 'match-card-expanded' : ''}`}>
      <div className="match-card-main">
        {/* Score Ring */}
        <div className="match-score-ring" style={{ '--score-color': scoreColor }}>
          <svg width="62" height="62" viewBox="0 0 62 62">
            <circle cx="31" cy="31" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
            <circle
              cx="31" cy="31" r="26"
              fill="none"
              stroke={scoreColor}
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - score / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 31 31)"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}60)` }}
            />
          </svg>
          <div className="match-score-value">{score}</div>
        </div>

        {/* Profile Info */}
        <div className="match-profile">
          <div className="match-avatar-name">
            <div className="match-avatar">
              {initials}
              {aiPowered && <span className="ai-badge" title="AI Scored">✦</span>}
            </div>
            <div>
              <div className="match-name">
                {profile.firstName} {profile.lastName}
                {profile.verified && <span style={{ color: 'var(--green)', fontSize: '0.75rem', marginLeft: 4 }}>✓</span>}
              </div>
              <div className="match-sub">
                {age && <span>{age} yrs</span>}
                {profile.city && <span>· {profile.city}</span>}
                {profile.maritalStatus && <span>· {profile.maritalStatus}</span>}
              </div>
            </div>
          </div>

          <div className="match-career">
            {profile.designation && (
              <span className="career-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                {profile.designation}
                {profile.currentCompany ? ` @ ${profile.currentCompany}` : ''}
              </span>
            )}
            {profile.annualIncome && (
              <span className="career-chip">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                ₹{profile.annualIncome} LPA
              </span>
            )}
            {profile.height && (
              <span className="career-chip">{profile.height} cm</span>
            )}
          </div>

          <StatusBadge status={category} type="score" />
        </div>

        {/* Actions */}
        <div className="match-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(p => !p)}
          >
            {expanded ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            )}
            {expanded ? 'Less' : 'Details'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSend(match)}
            disabled={sending}
          >
            {sending ? <span className="spinner" /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
            Send Match
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="match-details fade-in">
          <div className="match-divider" />

          {/* AI Explanation */}
          {explanation && (
            <div className="match-explanation">
              <div className="explanation-label">
                {aiPowered ? (
                  <><span className="ai-icon">✦</span> Gemini AI Analysis</>
                ) : (
                  <><span>⚙️</span> Compatibility Analysis</>
                )}
              </div>
              <p>{explanation}</p>
            </div>
          )}

          {/* Highlights & Considerations */}
          <div className="match-hc-grid">
            {highlights.length > 0 && (
              <div className="hc-col">
                <div className="hc-label green">✓ Strengths</div>
                {highlights.map((h, i) => (
                  <div key={i} className="hc-item green">{h}</div>
                ))}
              </div>
            )}
            {considerations.length > 0 && (
              <div className="hc-col">
                <div className="hc-label amber">⚠ To Discuss</div>
                {considerations.map((c, i) => (
                  <div key={i} className="hc-item amber">{c}</div>
                ))}
              </div>
            )}
          </div>

          {/* Profile extras */}
          <div className="match-extra-grid">
            {profile.religion && <InfoChip label="Religion" value={profile.religion} />}
            {profile.caste && <InfoChip label="Caste" value={profile.caste} />}
            {profile.diet && <InfoChip label="Diet" value={profile.diet} />}
            {profile.wantKids && <InfoChip label="Kids" value={profile.wantKids} />}
            {profile.openToRelocate && <InfoChip label="Relocate" value={profile.openToRelocate} />}
            {profile.highestDegree && <InfoChip label="Education" value={profile.highestDegree} />}
            {profile.familyValues && <InfoChip label="Family Values" value={profile.familyValues} />}
            {profile.languagesKnown?.length > 0 && (
              <InfoChip label="Languages" value={profile.languagesKnown.slice(0, 3).join(', ')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="info-chip">
      <span className="info-chip-label">{label}</span>
      <span className="info-chip-value">{value}</span>
    </div>
  );
}