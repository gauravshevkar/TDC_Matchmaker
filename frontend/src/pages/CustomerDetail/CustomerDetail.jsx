// pages/CustomerDetail/CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import NotesSection from '../../components/NotesSection/NotesSection';
import { customerService } from '../../services/customerService';
import toast from 'react-hot-toast';
import './CustomerDetail.css';

const GENDER_GRADIENT = {
  Male:   'linear-gradient(135deg, #6B9FD4 0%, #4a7ab5 100%)',
  Female: 'linear-gradient(135deg, #C9956A 0%, #a67850 100%)',
  Other:  'linear-gradient(135deg, #9B6BD4 0%, #7a4fb5 100%)',
};

export default function CustomerDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) { navigate('/'); return; }
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    setLoading(true);
    try {
      const c = await customerService.getById(id);
      setCustomer(c);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const updated = await customerService.update(id, { status: newStatus });
      setCustomer(updated);
      toast.success(`Status updated to ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setStatusUpdating(false); }
  };

  const handleNotesUpdate = (newNotes) => {
    setCustomer(prev => ({ ...prev, notes: newNotes }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customerService.delete(id);
      toast.success(`${customer.firstName} deleted successfully`);
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete customer');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="detail-page">
      <Navbar />
      <div className="loading-overlay" style={{ paddingTop: 120 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <span className="text-muted">Loading profile...</span>
      </div>
    </div>
  );

  if (!customer) return null;

  const age = customer.age ?? (
    customer.dateOfBirth
      ? Math.floor((Date.now() - new Date(customer.dateOfBirth)) / 3.156e10)
      : null
  );
  const initials = `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase();
  const dob = customer.dateOfBirth
    ? new Date(customer.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="detail-page">
      <Navbar />
      <main className="detail-main">

        {/* Breadcrumb */}
        <div className="detail-breadcrumb">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>
          <span className="text-muted">/</span>
          <span className="text-secondary text-sm">{customer.firstName} {customer.lastName}</span>
        </div>

        <div className="detail-layout">
          {/* LEFT COLUMN */}
          <div className="detail-left">

            {/* Profile Hero Card */}
            <div className="profile-hero card">
              <div className="profile-hero-banner" style={{ background: GENDER_GRADIENT[customer.gender] }} />
              <div className="profile-hero-content">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar-lg" style={{ background: GENDER_GRADIENT[customer.gender] }}>
                    {initials}
                  </div>
                  {customer.verified && (
                    <span className="profile-verified-badge" title="Verified Profile">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  )}
                </div>

                <div className="profile-hero-info">
                  <div className="profile-name-status">
                    <h2 className="font-display profile-name">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <StatusBadge status={customer.status || 'New'} />
                  </div>

                  <div className="profile-quick-facts">
                    {age && <span className="qf-chip">{age} years</span>}
                    {customer.gender && <span className="qf-chip gender">{customer.gender}</span>}
                    {customer.city && <span className="qf-chip">📍 {customer.city}{customer.state ? `, ${customer.state}` : ''}</span>}
                    {customer.religion && <span className="qf-chip">{customer.religion}</span>}
                    {customer.maritalStatus && <span className="qf-chip">{customer.maritalStatus}</span>}
                  </div>

                  {customer.aiSummary && (
                    <div className="ai-summary">
                      <span className="ai-summary-label">✦ AI Profile Summary</span>
                      <p>{customer.aiSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="detail-actions card">
              <div className="detail-actions-inner">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/customers/${id}/matches`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Find Matches
                </button>

                {/* Delete Button */}
                <button
                  className="btn btn-danger"
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    background: 'linear-gradient(135deg,#D46B6B,#b85252)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  Delete Client
                </button>

                <div className="status-changer">
                  <span className="text-muted text-sm">Change Status:</span>
                  <div className="status-buttons">
                    {['Active', 'On Hold', 'Matched', 'Inactive'].map(s => (
                      <button
                        key={s}
                        className={`status-btn ${customer.status === s ? 'active' : ''}`}
                        onClick={() => handleStatusChange(s)}
                        disabled={statusUpdating || customer.status === s}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
              <div
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000, backdropFilter: 'blur(4px)', padding: '20px',
                }}
                onClick={() => !deleting && setDeleteConfirm(false)}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 18, padding: '28px 32px', maxWidth: 420, width: '100%',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
                    animation: 'slideUp 0.25s ease',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 12 }}>🗑️</div>
                  <h3 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                    Delete {customer.firstName}?
                  </h3>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
                    Ye action permanent hai. <strong>{customer.firstName} {customer.lastName}</strong> ka
                    sara data delete ho jayega aur recover nahi hoga.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn"
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{ background: 'linear-gradient(135deg,#D46B6B,#b85252)', color: '#fff', border: 'none' }}
                    >
                      {deleting ? (
                        <><span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Deleting...</>
                      ) : '🗑️ Yes, Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="card p-6">
              <NotesSection
                customerId={id}
                notes={customer.notes || []}
                onNotesUpdate={handleNotesUpdate}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Full Biodata */}
          <div className="detail-right">
            <div className="biodata-container card">
              <div className="biodata-title-bar">
                <h3>Full Biodata</h3>
                <span className="text-muted text-xs">Complete Profile Information</span>
              </div>

              <BioSection title="Personal Information" icon="👤">
                <BioRow label="Full Name"       value={`${customer.firstName} ${customer.lastName}`} />
                <BioRow label="Gender"          value={customer.gender} />
                <BioRow label="Date of Birth"   value={dob} />
                <BioRow label="Age"             value={age ? `${age} years` : '—'} />
                <BioRow label="Height"          value={customer.height ? `${customer.height} cm (${cmToFt(customer.height)})` : '—'} />
                <BioRow label="Weight"          value={customer.weight ? `${customer.weight} kg` : '—'} />
                <BioRow label="Complexion"      value={customer.complexion} />
                <BioRow label="Body Type"       value={customer.bodyType} />
                <BioRow label="Blood Group"     value={customer.bloodGroup} />
                <BioRow label="Physical Status" value={customer.physicalStatus} />
              </BioSection>

              <BioSection title="Contact Details" icon="📞">
                <BioRow label="Email"   value={customer.email} />
                <BioRow label="Phone"   value={customer.phone} />
                <BioRow label="Country" value={customer.country} />
                <BioRow label="City"    value={customer.city} />
                <BioRow label="State"   value={customer.state} />
              </BioSection>

              <BioSection title="Education" icon="🎓">
                <BioRow label="Highest Degree"    value={customer.highestDegree} />
                <BioRow label="Undergrad College" value={customer.undergradCollege} />
                <BioRow label="Undergrad Degree"  value={customer.undergradDegree} />
                <BioRow label="Field of Study"    value={customer.fieldOfStudy} />
                <BioRow label="Postgrad College"  value={customer.postgradCollege} />
                <BioRow label="Postgrad Degree"   value={customer.postgradDegree} />
              </BioSection>

              <BioSection title="Career" icon="💼">
                <BioRow label="Current Company"   value={customer.currentCompany} />
                <BioRow label="Designation"       value={customer.designation} />
                <BioRow label="Employment Type"   value={customer.employmentType} />
                <BioRow label="Annual Income"     value={customer.annualIncome ? `₹${customer.annualIncome} LPA` : '—'} />
                <BioRow label="Work Location"     value={customer.workLocation} />
              </BioSection>

              <BioSection title="Family Details" icon="🏠">
                <BioRow label="Father's Name"        value={customer.fatherName} />
                <BioRow label="Father's Occupation"  value={customer.fatherOccupation} />
                <BioRow label="Mother's Name"        value={customer.motherName} />
                <BioRow label="Mother's Occupation"  value={customer.motherOccupation} />
                <BioRow label="Siblings"             value={customer.siblings !== undefined ? String(customer.siblings) : '—'} />
                <BioRow label="Sibling Details"      value={customer.siblingDetails} />
                <BioRow label="Family Type"          value={customer.familyType} />
                <BioRow label="Family Status"        value={customer.familyStatus} />
                <BioRow label="Family Values"        value={customer.familyValues} />
              </BioSection>

              <BioSection title="Religion & Culture" icon="🙏">
                <BioRow label="Religion"        value={customer.religion} />
                <BioRow label="Caste"           value={customer.caste} />
                <BioRow label="Sub Caste"       value={customer.subCaste} />
                <BioRow label="Gotra"           value={customer.gotra} />
                <BioRow label="Mother Tongue"   value={customer.mothertongue} />
                <BioRow label="Languages Known" value={customer.languagesKnown?.join(', ')} />
              </BioSection>

              <BioSection title="Lifestyle" icon="🌿">
                <BioRow label="Diet"         value={customer.diet} />
                <BioRow label="Smoking"      value={customer.smoking} />
                <BioRow label="Drinking"     value={customer.drinking} />
                <BioRow label="Open to Pets" value={customer.openToPets} />
                <BioRow label="Hobbies"      value={customer.hobbies?.join(', ')} />
                <BioRow label="Interests"    value={customer.interests?.join(', ')} />
              </BioSection>

              <BioSection title="Marriage & Children" icon="💑">
                <BioRow label="Marital Status"      value={customer.maritalStatus} />
                <BioRow label="Have Children"       value={customer.haveChildren} />
                <BioRow label="Number of Children"  value={customer.numberOfChildren !== undefined ? String(customer.numberOfChildren) : '—'} />
                <BioRow label="Want Kids"           value={customer.wantKids} />
                <BioRow label="Open to Relocate"    value={customer.openToRelocate} />
              </BioSection>

              <BioSection title="Partner Preferences" icon="❤️">
                <BioRow label="Age Range"      value={customer.partnerAgeMin && customer.partnerAgeMax ? `${customer.partnerAgeMin} – ${customer.partnerAgeMax} years` : '—'} />
                <BioRow label="Height Range"   value={customer.partnerHeightMin && customer.partnerHeightMax ? `${customer.partnerHeightMin} – ${customer.partnerHeightMax} cm` : '—'} />
                <BioRow label="Min Income"     value={customer.partnerIncomeMin ? `₹${customer.partnerIncomeMin} LPA` : '—'} />
                <BioRow label="Religion"       value={customer.partnerReligion?.join(', ')} />
                <BioRow label="Education"      value={customer.partnerEducation} />
                <BioRow label="Location"       value={customer.partnerLocation?.join(', ')} />
                <BioRow label="Diet Pref"      value={customer.partnerDiet} />
              </BioSection>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BioSection({ title, icon, children }) {
  return (
    <div className="bio-section">
      <div className="bio-section-title">
        <span>{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className="bio-rows">{children}</div>
    </div>
  );
}

function BioRow({ label, value }) {
  const display = value && value !== 'undefined' ? value : '—';
  return (
    <div className="bio-row">
      <span className="bio-label">{label}</span>
      <span className={`bio-value ${display === '—' ? 'text-muted' : ''}`}>{display}</span>
    </div>
  );
}

function cmToFt(cm) {
  const inches = cm / 2.54;
  const ft = Math.floor(inches / 12);
  const inch = Math.round(inches % 12);
  return `${ft}'${inch}"`;
}