// components/StatusBadge/StatusBadge.jsx
import React from 'react';

const STATUS_MAP = {
  Active:   { cls: 'badge-active',   dot: '#4CAF7D' },
  Inactive: { cls: 'badge-inactive', dot: '#D46B6B' },
  New:      { cls: 'badge-new',      dot: '#9B6BD4' },
  Matched:  { cls: 'badge-matched',  dot: '#6B9FD4' },
  'On Hold':{ cls: 'badge-onhold',   dot: '#D4A853' },
};

const SCORE_MAP = {
  'High Potential': { cls: 'badge-high',     emoji: '⭐' },
  'Good Match':     { cls: 'badge-good',     emoji: '✨' },
  'Moderate Match': { cls: 'badge-moderate', emoji: '💛' },
  'Exploratory':    { cls: 'badge-explore',  emoji: '🔍' },
};

export default function StatusBadge({ status, type = 'status' }) {
  if (type === 'score') {
    const cfg = SCORE_MAP[status] || SCORE_MAP['Exploratory'];
    return (
      <span className={`badge ${cfg.cls}`}>
        {cfg.emoji} {status}
      </span>
    );
  }

  const cfg = STATUS_MAP[status] || STATUS_MAP['New'];
  return (
    <span className={`badge ${cfg.cls}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot, display: 'inline-block'
      }} />
      {status}
    </span>
  );
}
