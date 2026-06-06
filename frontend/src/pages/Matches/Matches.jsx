// pages/Matches/Matches.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import MatchCard from '../../components/MatchCard/MatchCard';
import { matchService } from '../../services/matchService';
import { customerService } from '../../services/customerService';
import toast from 'react-hot-toast';
import './Matches.css';

export default function Matches() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [customer, setCustomer]   = useState(null);
  const [matches, setMatches]     = useState([]);
  const [sentMatches, setSentMatches] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [activeTab, setActiveTab] = useState('suggested');
  const [sortBy, setSortBy]       = useState('score');
  const [filterCategory, setFilterCategory] = useState('All');
  const [emailModal, setEmailModal] = useState(null); // { match, introEmail }
  const [poolSize, setPoolSize]   = useState(0);
  const [aiPoweredCount, setAiPoweredCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cust, matchData, sent] = await Promise.all([
        customerService.getById(id),
        matchService.suggest(id),
        matchService.getForCustomer(id),
      ]);
      setCustomer(cust);
      setMatches(matchData.matches || []);
      setSentMatches(sent || []);
      setPoolSize(matchData.poolSize || 0);
      const aiCount = (matchData.matches || []).filter(m => m.aiPowered).length;
      setAiPoweredCount(aiCount);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load matches';
      toast.error(msg);
      if (err.response?.status === 404) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (match) => {
    setSendingId(match.profile._id);
    try {
      const data = await matchService.send({
        customerId:    id,
        matchedWithId: match.profile._id,
        score:         match.score,
        category:      match.category,
        explanation:   match.explanation,
      });
      toast.success(`Match sent to ${customer?.firstName}! 💌`);
      setEmailModal({ match, introEmail: data.introEmail, mockEmail: data.mockEmail });
      // Refresh sent matches
      const sent = await matchService.getForCustomer(id);
      setSentMatches(sent || []);
      setActiveTab('sent');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send match';
      toast.error(msg);
    } finally {
      setSendingId(null);
    }
  };

  // Sort & filter
  const displayedMatches = [...matches]
    .filter(m => filterCategory === 'All' || m.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'age') return (a.profile.age || 99) - (b.profile.age || 99);
      return 0;
    });

  const categories = ['All', 'High Potential', 'Good Match', 'Moderate Match', 'Exploratory'];

  if (loading) return (
    <div className="matches-page">
      <Navbar />
      <div className="loading-overlay" style={{ paddingTop: 120 }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
        <p className="text-secondary" style={{ marginTop: 16 }}>
          Finding best matches using AI...
        </p>
        <p className="text-muted text-sm">Gemini is scoring compatibility...</p>
      </div>
    </div>
  );

  return (
    <div className="matches-page">
      <Navbar />
      <main className="matches-main">

        {/* Breadcrumb */}
        <div className="matches-breadcrumb">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <span className="text-muted">/</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customers/${id}`)}>
            {customer?.firstName} {customer?.lastName}
          </button>
          <span className="text-muted">/</span>
          <span className="text-secondary text-sm">Matches</span>
        </div>

        {/* Header */}
        <div className="matches-header">
          <div className="matches-header-left">
            <div className="matches-customer-badge">
              <div className="matches-avatar"
                style={{ background: customer?.gender === 'Male'
                  ? 'linear-gradient(135deg,#6B9FD4,#4a7ab5)'
                  : 'linear-gradient(135deg,#C9956A,#a67850)' }}>
                {customer?.firstName?.[0]}{customer?.lastName?.[0]}
              </div>
              <div>
                <h2 className="font-display">
                  Matches for {customer?.firstName} {customer?.lastName}
                </h2>
                <p className="text-secondary text-sm">
                  {customer?.gender} · {customer?.city} · {customer?.designation}
                </p>
              </div>
            </div>
          </div>

          <div className="matches-header-stats">
            <StatPill value={matches.length} label="Suggested" color="rose" />
            <StatPill value={aiPoweredCount} label="AI Scored ✦" color="purple" />
            <StatPill value={poolSize} label="Pool Size" color="blue" />
            <StatPill value={sentMatches.length} label="Sent" color="green" />
          </div>
        </div>

        {/* AI Banner */}
        {aiPoweredCount > 0 && (
          <div className="ai-banner fade-in">
            <div className="ai-banner-icon">✦</div>
            <div>
              <div className="ai-banner-title">Gemini AI Active</div>
              <div className="ai-banner-sub">
                Top {aiPoweredCount} matches scored by Google Gemini with detailed compatibility analysis.
                Remaining matches use rule-based algorithm.
              </div>
            </div>
            <div className="ai-banner-badge">AI Powered</div>
          </div>
        )}

        {/* Tabs */}
        <div className="matches-tabs">
          <button
            className={`match-tab ${activeTab === 'suggested' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggested')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            Suggested ({matches.length})
          </button>
          <button
            className={`match-tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Sent ({sentMatches.length})
          </button>
        </div>

        {/* Suggested Tab */}
        {activeTab === 'suggested' && (
          <>
            {/* Controls */}
            <div className="matches-controls card">
              <div className="matches-filters">
                <div className="filter-group">
                  <span className="text-muted text-sm">Category:</span>
                  <div className="category-pills">
                    {categories.map(c => (
                      <button
                        key={c}
                        className={`cat-pill ${filterCategory === c ? 'active' : ''}`}
                        onClick={() => setFilterCategory(c)}
                      >
                        {c === 'High Potential' ? '⭐' : c === 'Good Match' ? '✨' : c === 'Moderate Match' ? '💛' : c === 'Exploratory' ? '🔍' : ''} {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <span className="text-muted text-sm">Sort:</span>
                  <select
                    className="form-select"
                    style={{ width: 160 }}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="score">Highest Score</option>
                    <option value="age">Youngest First</option>
                  </select>
                </div>
              </div>
              <div className="text-muted text-sm">
                Showing <strong style={{ color: 'var(--text-primary)' }}>{displayedMatches.length}</strong> matches
              </div>
            </div>

            {displayedMatches.length === 0 ? (
              <div className="matches-empty card">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💔</div>
                <h3>No matches found</h3>
                <p className="text-secondary text-sm">
                  {filterCategory !== 'All'
                    ? `No "${filterCategory}" matches. Try a different category.`
                    : 'Load sample profiles from the Dashboard first.'}
                </p>
                {filterCategory !== 'All' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => setFilterCategory('All')}>
                    Show All
                  </button>
                )}
              </div>
            ) : (
              <div className="matches-list fade-in">
                {displayedMatches.map((match, i) => (
                  <div key={match.profile._id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in">
                    <MatchCard
                      match={match}
                      onSend={handleSend}
                      sending={sendingId === match.profile._id}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sent Tab */}
        {activeTab === 'sent' && (
          <div className="sent-matches">
            {sentMatches.length === 0 ? (
              <div className="matches-empty card">
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                <h3>No matches sent yet</h3>
                <p className="text-secondary text-sm">
                  Use the "Send Match" button on suggested matches to send them.
                </p>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('suggested')}>
                  View Suggestions
                </button>
              </div>
            ) : (
              <div className="sent-list fade-in">
                {sentMatches.map(sm => (
                  <SentMatchCard key={sm._id} match={sm} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Email Modal */}
      {emailModal && (
        <div className="modal-backdrop" onClick={() => setEmailModal(null)}>
          <div className="modal email-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--green)' }}>✓</span> Match Sent Successfully!
                </h3>
                <p className="text-secondary text-sm">AI-generated intro email preview</p>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setEmailModal(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="email-preview">
                <div className="email-field">
                  <span className="email-label">To:</span>
                  <span>{emailModal.mockEmail?.to || customer?.email}</span>
                </div>
                <div className="email-field">
                  <span className="email-label">Subject:</span>
                  <span>{emailModal.mockEmail?.subject || 'TDC Match Introduction'}</span>
                </div>
                <div className="email-divider" />
                <div className="email-body">
                  {emailModal.introEmail || emailModal.mockEmail?.body || 'Email content generated...'}
                </div>
              </div>
              <div className="ai-generated-label">
                <span>✦</span> Generated by Google Gemini AI
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                navigator.clipboard.writeText(emailModal.introEmail || '');
                toast.success('Email copied!');
              }}>
                📋 Copy Email
              </button>
              <button className="btn btn-primary" onClick={() => setEmailModal(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ value, label, color }) {
  const colorMap = {
    rose:   'var(--rose-gold)',
    green:  'var(--green)',
    blue:   'var(--blue)',
    purple: 'var(--purple)',
  };
  return (
    <div className="stat-pill">
      <span className="stat-pill-value" style={{ color: colorMap[color] }}>{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}

function SentMatchCard({ match }) {
  const p = match.matchedWith;
  if (!p) return null;
  const sentDate = new Date(match.sentAt || match.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const statusColor = {
    Sent:     'var(--blue)',
    Accepted: 'var(--green)',
    Rejected: 'var(--red)',
    'On Hold':'var(--amber)',
  };

  return (
    <div className="sent-card card">
      <div className="sent-card-inner">
        <div className="sent-avatar">
          {p.firstName?.[0]}{p.lastName?.[0]}
        </div>
        <div className="sent-info">
          <div className="sent-name">{p.firstName} {p.lastName}</div>
          <div className="sent-meta">
            {p.designation && <span>{p.designation}</span>}
            {p.city && <span>· {p.city}</span>}
          </div>
          <div className="sent-date text-xs text-muted">Sent on {sentDate}</div>
        </div>
        <div className="sent-right">
          <div className="sent-score">{match.matchScore}/100</div>
          <div className="sent-status" style={{ color: statusColor[match.status] || 'var(--text-muted)' }}>
            {match.status}
          </div>
          <div className="sent-category badge badge-explore">{match.matchCategory}</div>
        </div>
      </div>
    </div>
  );
}