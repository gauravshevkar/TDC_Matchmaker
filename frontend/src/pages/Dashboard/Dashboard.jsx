// pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import CustomerCard from '../../components/CustomerCard/CustomerCard';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_TABS = ['All', 'Active', 'New', 'Matched', 'On Hold', 'Inactive'];
const GENDER_OPTS = ['All', 'Male', 'Female'];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [stats, setStats]         = useState({});
  const [loading, setLoading]     = useState(true);
  // const [seeding, setSeeding]     = useState(false);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('All');
  const [gender, setGender]       = useState('All');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim())       params.search = search.trim();
      if (status !== 'All')    params.status = status;
      if (gender !== 'All')    params.gender = gender;

      const data = await customerService.getAll(params);
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Compute stats from all
      if (page === 1 && !search && status === 'All' && gender === 'All') {
        const allData = await customerService.getAll({ limit: 1000 });
        const all = allData.customers || [];
        const s = {};
        STATUS_TABS.slice(1).forEach(st => {
          s[st] = all.filter(c => c.status === st).length;
        });
        s.Total = allData.total || 0;
        s.Male = all.filter(c => c.gender === 'Male').length;
        s.Female = all.filter(c => c.gender === 'Female').length;
        setStats(s);
      }
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, gender]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, status, gender]);

  // const handleSeed = async () => {
  //   setSeeding(true);
  //   try {
  //     const data = await customerService.seedProfiles();
  //     toast.success(`${data.count} profiles loaded into database!`);
  //     fetchCustomers();
  //   } catch (err) {
  //     const msg = err.response?.data?.message || 'Seeding failed';
  //     if (msg.includes('already')) {
  //       toast('Profiles already seeded!', { icon: 'ℹ️' });
  //     } else {
  //       toast.error(msg);
  //     }
  //   } finally {
  //     setSeeding(false);
  //   }
  // };

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="font-display">Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="text-secondary text-sm">Manage your clients and find their perfect match</p>
          </div>
          <div className="dashboard-header-actions">
            {/* <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding}>
              {seeding ? <><span className="spinner" /> Loading...</> : (
                <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg> Load Sample Data</>
              )}
            </button> */}
            <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Customer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-in">
          <StatCard label="Total Clients" value={stats.Total ?? 0} icon="👥" color="rose" />
          <StatCard label="Active" value={stats.Active ?? 0} icon="✅" color="green" />
          <StatCard label="Matched" value={stats.Matched ?? 0} icon="💑" color="blue" />
          <StatCard label="New" value={stats.New ?? 0} icon="🌟" color="purple" />
          <StatCard label="Male" value={stats.Male ?? 0} icon="♂" color="blue" />
          <StatCard label="Female" value={stats.Female ?? 0} icon="♀" color="rose" />
        </div>

        {/* Filters */}
        <div className="dashboard-filters card">
          <div className="filter-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, city, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="filter-input"
            />
            {search && (
              <button className="filter-clear" onClick={() => setSearch('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          <div className="filter-tabs">
            {STATUS_TABS.map(s => (
              <button
                key={s}
                className={`filter-tab ${status === s ? 'active' : ''}`}
                onClick={() => setStatus(s)}
              >
                {s}
                {s !== 'All' && stats[s] !== undefined && (
                  <span className="tab-count">{stats[s]}</span>
                )}
              </button>
            ))}
          </div>

          <div className="filter-gender">
            {GENDER_OPTS.map(g => (
              <button
                key={g}
                className={`gender-btn ${gender === g ? 'active' : ''}`}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="results-meta">
          <span className="text-secondary text-sm">
            Showing <strong style={{ color: 'var(--text-primary)' }}>{customers.length}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> clients
            {search && <> for "<em style={{ color: 'var(--rose-gold)' }}>{search}</em>"</>}
          </span>
          {(search || status !== 'All' || gender !== 'All') && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setStatus('All'); setGender('All'); }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="customers-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />
            ))}
          </div>
        ) : customers.length === 0 ? (
          
        ) : (
          <div className="customers-list fade-in">
            {customers.map((c, i) => (
              <div key={c._id} style={{ animationDelay: `${i * 0.04}s` }} className="fade-in">
                <CustomerCard customer={c} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1 || loading}
            >
              ← Previous
            </button>
            <span className="page-info text-secondary text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages || loading}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    rose:   { bg: 'var(--rose-gold-glow)', text: 'var(--rose-gold)' },
    green:  { bg: 'var(--green-bg)',  text: 'var(--green)' },
    blue:   { bg: 'var(--blue-bg)',   text: 'var(--blue)' },
    purple: { bg: 'var(--purple-bg)', text: 'var(--purple)' },
  };
  const c = colorMap[color] || colorMap.rose;

  return (
    <div className="stat-card card">
      <div className="stat-icon" style={{ background: c.bg, color: c.text }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label text-muted text-sm">{label}</div>
    </div>
  );
}

<EmptyState search={search} />
function EmptyState({ search }) {
  return (
    <div className="empty-state card">
      <div className="empty-icon">💑</div>
      <h3 className="font-display">{search ? 'No results found' : 'No clients yet'}</h3>
      <p className="text-secondary text-sm">
        {search
          ? `No clients match "${search}". Try a different search.`
          : 'Add your first client using the "Add Customer" button above.'}
      </p>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
