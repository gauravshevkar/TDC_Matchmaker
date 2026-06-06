// pages/AddCustomer/AddCustomer.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { customerService } from '../../services/customerService';
import toast from 'react-hot-toast';
import './AddCustomer.css';

// ── Component ke BAHAR define karo ──────────────────────────
const F = ({ name, label, required, type = 'text', form, errors, onChange, ...rest }) => (
  <div className="form-group">
    <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
    <input
      type={type}
      name={name}
      value={form[name]}
      onChange={onChange}
      className="form-input"
      style={errors[name] ? { borderColor: 'var(--red, #D46B6B)' } : {}}
      {...rest}
    />
    {errors[name] && (
      <span style={{ fontSize: '0.72rem', color: 'var(--red, #D46B6B)' }}>{errors[name]}</span>
    )}
  </div>
);

const S = ({ name, label, required, children, form, errors, onChange }) => (
  <div className="form-group">
    <label className={`form-label${required ? ' required' : ''}`}>{label}</label>
    <select
      name={name}
      value={form[name]}
      onChange={onChange}
      className="form-select"
      style={errors[name] ? { borderColor: 'var(--red, #D46B6B)' } : {}}
    >
      {children}
    </select>
    {errors[name] && (
      <span style={{ fontSize: '0.72rem', color: 'var(--red, #D46B6B)' }}>{errors[name]}</span>
    )}
  </div>
);
// ────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  firstName: '', lastName: '', gender: '', dateOfBirth: '',
  email: '', phone: '',
  country: 'India', city: '', state: '', openToRelocate: 'Maybe',
  height: '', weight: '', complexion: '', bodyType: '', bloodGroup: '',
  highestDegree: '', undergradCollege: '', undergradDegree: '', fieldOfStudy: '',
  postgradCollege: '', postgradDegree: '',
  currentCompany: '', designation: '', employmentType: '', annualIncome: '', workLocation: '',
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  siblings: 0, siblingDetails: '', familyType: '', familyStatus: '', familyValues: '',
  religion: '', caste: '', subCaste: '', gotra: '', mothertongue: '',
  languagesKnown: '',
  diet: '', smoking: 'No', drinking: 'No', openToPets: 'Maybe', hobbies: '', interests: '',
  maritalStatus: 'Never Married', haveChildren: 'No', numberOfChildren: 0,
  wantKids: 'Maybe',
  partnerAgeMin: '', partnerAgeMax: '', partnerHeightMin: '', partnerHeightMax: '',
  partnerIncomeMin: '', partnerReligion: '', partnerEducation: '', partnerLocation: '',
  partnerDiet: '',
};

export default function AddCustomer() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!form.gender)           e.gender    = 'Required';
    if (!form.dateOfBirth)      e.dateOfBirth = 'Required';
    if (!form.email.trim())     e.email     = 'Required';
    if (!form.phone.trim())     e.phone     = 'Required';
    if (!form.city.trim())      e.city      = 'Required';
    if (!form.maritalStatus)    e.maritalStatus = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fill in all required fields.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        height:           form.height       ? Number(form.height)       : undefined,
        weight:           form.weight       ? Number(form.weight)       : undefined,
        annualIncome:     form.annualIncome ? Number(form.annualIncome) : undefined,
        siblings:         Number(form.siblings)         || 0,
        numberOfChildren: Number(form.numberOfChildren) || 0,
        partnerAgeMin:    form.partnerAgeMin    ? Number(form.partnerAgeMin)    : undefined,
        partnerAgeMax:    form.partnerAgeMax    ? Number(form.partnerAgeMax)    : undefined,
        partnerHeightMin: form.partnerHeightMin ? Number(form.partnerHeightMin) : undefined,
        partnerHeightMax: form.partnerHeightMax ? Number(form.partnerHeightMax) : undefined,
        partnerIncomeMin: form.partnerIncomeMin ? Number(form.partnerIncomeMin) : undefined,
        languagesKnown: form.languagesKnown ? form.languagesKnown.split(',').map(s => s.trim()).filter(Boolean) : [],
        hobbies:        form.hobbies    ? form.hobbies.split(',').map(s => s.trim()).filter(Boolean)    : [],
        interests:      form.interests  ? form.interests.split(',').map(s => s.trim()).filter(Boolean)  : [],
        partnerReligion: form.partnerReligion ? form.partnerReligion.split(',').map(s => s.trim()).filter(Boolean) : [],
        partnerLocation: form.partnerLocation ? form.partnerLocation.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const created = await customerService.create(payload);
      toast.success(`${created.firstName} added successfully! 🎉`);
      navigate(`/customers/${created._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create customer';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Shared props helper — F aur S ko pass karo
  const fp = { form, errors, onChange: handleChange };

  return (
    <div className="add-customer-page">
      <Navbar />
      <main className="add-customer-main">
        <div className="add-customer-breadcrumb">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </button>
          <span className="text-muted">/</span>
          <span className="text-secondary text-sm">Add New Client</span>
        </div>

        <div className="add-customer-header">
          <h1>Add New Client</h1>
          <p>Fill in the client's biodata. Fields marked with * are required.</p>
        </div>

        <form onSubmit={handleSubmit} className={submitting ? 'form-submitting' : ''}>

          {/* ── Personal Info ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>👤</span><h3>Personal Information</h3></div>
            <div className="form-grid">
              <F {...fp} name="firstName" label="First Name" required placeholder="e.g. Priya" />
              <F {...fp} name="lastName"  label="Last Name"  required placeholder="e.g. Sharma" />
              <S {...fp} name="gender" label="Gender" required>
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </S>
              <F {...fp} name="dateOfBirth" label="Date of Birth" required type="date" />
              <F {...fp} name="height" label="Height (cm)" type="number" placeholder="e.g. 165" />
              <F {...fp} name="weight" label="Weight (kg)" type="number" placeholder="e.g. 60" />
              <S {...fp} name="complexion" label="Complexion">
                <option value="">Select</option>
                <option>Very Fair</option><option>Fair</option>
                <option>Wheatish</option><option>Dark</option>
              </S>
              <S {...fp} name="bodyType" label="Body Type">
                <option value="">Select</option>
                <option>Slim</option><option>Athletic</option>
                <option>Average</option><option>Heavy</option>
              </S>
              <F {...fp} name="bloodGroup" label="Blood Group" placeholder="e.g. B+" />
            </div>
          </div>

          {/* ── Contact ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>📞</span><h3>Contact Details</h3></div>
            <div className="form-grid">
              <F {...fp} name="email"   label="Email" required type="email" placeholder="priya@example.com" />
              <F {...fp} name="phone"   label="Phone" required placeholder="+91 98765 43210" />
              <F {...fp} name="country" label="Country" placeholder="India" />
              <F {...fp} name="city"    label="City" required placeholder="e.g. Mumbai" />
              <F {...fp} name="state"   label="State" placeholder="e.g. Maharashtra" />
              <S {...fp} name="openToRelocate" label="Open to Relocate">
                <option>Yes</option><option>No</option><option>Maybe</option>
              </S>
            </div>
          </div>

          {/* ── Education ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>🎓</span><h3>Education</h3></div>
            <div className="form-grid">
              <S {...fp} name="highestDegree" label="Highest Degree">
                <option value="">Select Degree</option>
                <option>B.Tech</option><option>B.E.</option><option>B.Sc</option>
                <option>B.Com</option><option>B.A.</option><option>MBA</option>
                <option>M.Tech</option><option>M.Sc</option><option>M.A.</option>
                <option>MBBS</option><option>MD</option><option>LLB</option>
                <option>CA</option><option>PhD</option><option>Other</option>
              </S>
              <F {...fp} name="fieldOfStudy"     label="Field of Study" placeholder="e.g. Computer Science" />
              <F {...fp} name="undergradCollege" label="Undergrad College" placeholder="e.g. IIT Bombay" />
              <F {...fp} name="undergradDegree"  label="Undergrad Degree" placeholder="e.g. B.Tech" />
              <F {...fp} name="postgradCollege"  label="Postgrad College" placeholder="e.g. IIM Ahmedabad" />
              <F {...fp} name="postgradDegree"   label="Postgrad Degree" placeholder="e.g. MBA" />
            </div>
          </div>

          {/* ── Career ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>💼</span><h3>Career</h3></div>
            <div className="form-grid">
              <F {...fp} name="currentCompany" label="Current Company" placeholder="e.g. TCS" />
              <F {...fp} name="designation"    label="Designation" placeholder="e.g. Software Engineer" />
              <S {...fp} name="employmentType" label="Employment Type">
                <option value="">Select</option>
                <option>Employed</option><option>Self-Employed</option>
                <option>Business</option><option>Not Working</option>
              </S>
              <F {...fp} name="annualIncome" label="Annual Income (₹ Lakhs)" type="number" placeholder="e.g. 12" />
              <F {...fp} name="workLocation" label="Work Location" placeholder="e.g. Pune" />
            </div>
          </div>

          {/* ── Family ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>🏠</span><h3>Family Details</h3></div>
            <div className="form-grid">
              <F {...fp} name="fatherName"       label="Father's Name" placeholder="e.g. Ramesh Sharma" />
              <F {...fp} name="fatherOccupation" label="Father's Occupation" placeholder="e.g. Retired Government Officer" />
              <F {...fp} name="motherName"       label="Mother's Name" placeholder="e.g. Sunita Sharma" />
              <F {...fp} name="motherOccupation" label="Mother's Occupation" placeholder="e.g. Homemaker" />
              <F {...fp} name="siblings"         label="Number of Siblings" type="number" />
              <F {...fp} name="siblingDetails"   label="Sibling Details" placeholder="e.g. 1 brother, 1 sister" />
              <S {...fp} name="familyType" label="Family Type">
                <option value="">Select</option>
                <option>Joint</option><option>Nuclear</option>
              </S>
              <S {...fp} name="familyStatus" label="Family Status">
                <option value="">Select</option>
                <option>Middle Class</option><option>Upper Middle Class</option>
                <option>High Class</option><option>Rich</option>
              </S>
              <S {...fp} name="familyValues" label="Family Values">
                <option value="">Select</option>
                <option>Traditional</option><option>Moderate</option><option>Liberal</option>
              </S>
            </div>
          </div>

          {/* ── Religion & Culture ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>🙏</span><h3>Religion & Culture</h3></div>
            <div className="form-grid">
              <S {...fp} name="religion" label="Religion">
                <option value="">Select Religion</option>
                <option>Hindu</option><option>Muslim</option><option>Christian</option>
                <option>Sikh</option><option>Jain</option><option>Buddhist</option>
                <option>Parsi</option><option>Other</option>
              </S>
              <F {...fp} name="caste"        label="Caste"         placeholder="e.g. Brahmin" />
              <F {...fp} name="subCaste"     label="Sub-Caste"     placeholder="e.g. Iyer" />
              <F {...fp} name="gotra"        label="Gotra"         placeholder="e.g. Kashyap" />
              <F {...fp} name="mothertongue" label="Mother Tongue" placeholder="e.g. Hindi" />
              <F {...fp} name="languagesKnown" label="Languages Known" placeholder="Hindi, English, Marathi (comma-separated)" />
            </div>
          </div>

          {/* ── Lifestyle ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>🌿</span><h3>Lifestyle</h3></div>
            <div className="form-grid">
              <S {...fp} name="diet" label="Diet">
                <option value="">Select</option>
                <option>Vegetarian</option><option>Non-Vegetarian</option>
                <option>Eggetarian</option><option>Vegan</option>
              </S>
              <S {...fp} name="smoking" label="Smoking">
                <option>No</option><option>Occasionally</option><option>Yes</option>
              </S>
              <S {...fp} name="drinking" label="Drinking">
                <option>No</option><option>Occasionally</option><option>Yes</option>
              </S>
              <S {...fp} name="openToPets" label="Open to Pets">
                <option>Yes</option><option>No</option><option>Maybe</option>
              </S>
              <div className="form-group col-span-2">
                <label className="form-label">Hobbies (comma-separated)</label>
                <input name="hobbies" value={form.hobbies} onChange={handleChange}
                  className="form-input" placeholder="e.g. Reading, Cooking, Travelling, Yoga" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Interests (comma-separated)</label>
                <input name="interests" value={form.interests} onChange={handleChange}
                  className="form-input" placeholder="e.g. Music, Technology, Sports" />
              </div>
            </div>
          </div>

          {/* ── Marriage & Children ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>💑</span><h3>Marriage & Children</h3></div>
            <div className="form-grid">
              <S {...fp} name="maritalStatus" label="Marital Status" required>
                <option>Never Married</option><option>Divorced</option>
                <option>Widowed</option><option>Separated</option>
              </S>
              <S {...fp} name="haveChildren" label="Have Children">
                <option>No</option><option>Yes</option>
              </S>
              <F {...fp} name="numberOfChildren" label="Number of Children" type="number" />
              <S {...fp} name="wantKids" label="Want Kids">
                <option>Yes</option><option>No</option><option>Maybe</option>
              </S>
            </div>
          </div>

          {/* ── Partner Preferences ── */}
          <div className="form-card fade-in">
            <div className="form-section-title"><span>❤️</span><h3>Partner Preferences</h3></div>
            <div className="form-grid cols-3">
              <F {...fp} name="partnerAgeMin"    label="Partner Age Min" type="number" placeholder="e.g. 25" />
              <F {...fp} name="partnerAgeMax"    label="Partner Age Max" type="number" placeholder="e.g. 35" />
              <F {...fp} name="partnerIncomeMin" label="Min Income (₹L)" type="number" placeholder="e.g. 5" />
              <F {...fp} name="partnerHeightMin" label="Height Min (cm)" type="number" placeholder="e.g. 160" />
              <F {...fp} name="partnerHeightMax" label="Height Max (cm)" type="number" placeholder="e.g. 185" />
              <S {...fp} name="partnerDiet" label="Partner Diet Pref">
                <option value="">Any</option>
                <option>Vegetarian</option><option>Non-Vegetarian</option>
                <option>Eggetarian</option><option>Vegan</option>
              </S>
              <div className="form-group col-span-2">
                <label className="form-label">Preferred Religion(s) (comma-separated)</label>
                <input name="partnerReligion" value={form.partnerReligion} onChange={handleChange}
                  className="form-input" placeholder="e.g. Hindu, Jain" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Preferred Location(s) (comma-separated)</label>
                <input name="partnerLocation" value={form.partnerLocation} onChange={handleChange}
                  className="form-input" placeholder="e.g. Mumbai, Pune, Bangalore" />
              </div>
              <S {...fp} name="partnerEducation" label="Partner Education">
                <option value="">Any</option>
                <option>Graduate and above</option><option>Post-Graduate</option>
                <option>Professional (CA/Doctor/Lawyer)</option>
              </S>
            </div>
          </div>

          {/* Footer */}
          <div className="add-customer-footer">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Save Client
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}