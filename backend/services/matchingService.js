// services/matchingService.js
/**
 * TDC Matching Algorithm
 * Gender-specific matching logic with weighted scoring
 * 
 * Male customers ke liye: younger, shorter, less income women preferred (traditional preferences)
 * Female customers ke liye: compatibility-based holistic matching
 */

/**
 * Main matching function
 * @param {Object} customer - Customer jiska match dhundhna hai
 * @param {Array} pool - Available profiles ki list
 * @param {number} limit - Kitne matches chahiye
 * @returns {Array} Scored and sorted matches
 */
const findMatches = (customer, pool, limit = 20) => {
  // Opposite gender filter karo
  const oppositeGender = customer.gender === 'Male' ? 'Female' : 'Male';
  const filteredPool = pool.filter(p => p.gender === oppositeGender && p._id?.toString() !== customer._id?.toString());

  if (customer.gender === 'Male') {
    return findMatchesForMale(customer, filteredPool, limit);
  } else {
    return findMatchesForFemale(customer, filteredPool, limit);
  }
};

/**
 * Male customer ke liye matching logic
 * Traditional Indian matrimonial preferences follow karta hai
 */
const findMatchesForMale = (maleCustomer, femalePool, limit) => {
  const scored = femalePool.map(female => {
    let score = 0;
    const breakdown = {};

    // ── Age: Female younger preferred ────────────────────────
    const ageDiff = (maleCustomer.age || 30) - (female.age || 27);
    if (ageDiff >= 0 && ageDiff <= 5) {
      score += 20;
      breakdown.age = { points: 20, note: `${ageDiff} years younger - ideal range` };
    } else if (ageDiff > 5 && ageDiff <= 10) {
      score += 10;
      breakdown.age = { points: 10, note: `${ageDiff} years younger - acceptable range` };
    } else if (ageDiff < 0 && ageDiff >= -2) {
      score += 8;
      breakdown.age = { points: 8, note: 'Slightly older - still compatible' };
    } else {
      score += 2;
      breakdown.age = { points: 2, note: 'Age gap outside preferred range' };
    }

    // ── Height: Female shorter preferred ─────────────────────
    const heightDiff = (maleCustomer.height || 175) - (female.height || 162);
    if (heightDiff >= 5 && heightDiff <= 20) {
      score += 15;
      breakdown.height = { points: 15, note: 'Height difference ideal' };
    } else if (heightDiff >= 0 && heightDiff < 5) {
      score += 8;
      breakdown.height = { points: 8, note: 'Similar height - acceptable' };
    } else {
      score += 3;
      breakdown.height = { points: 3, note: 'Height preference not matched' };
    }

    // ── Income: Female earning less or equal preferred ────────
    const maleIncome = maleCustomer.annualIncome || 0;
    const femaleIncome = female.annualIncome || 0;
    if (femaleIncome <= maleIncome) {
      score += 15;
      breakdown.income = { points: 15, note: 'Income compatibility ideal' };
    } else if (femaleIncome <= maleIncome * 1.3) {
      score += 8;
      breakdown.income = { points: 8, note: 'Minor income difference' };
    } else {
      score += 2;
      breakdown.income = { points: 2, note: 'Female earns more than preferred' };
    }

    // ── Kids preference ───────────────────────────────────────
    if (maleCustomer.wantKids === female.wantKids) {
      score += 15;
      breakdown.kids = { points: 15, note: 'Both aligned on children' };
    } else if (
      (maleCustomer.wantKids === 'Maybe' || female.wantKids === 'Maybe')
    ) {
      score += 8;
      breakdown.kids = { points: 8, note: 'One is open/flexible on children' };
    } else {
      score += 0;
      breakdown.kids = { points: 0, note: 'Different views on children' };
    }

    // ── Religion / Caste (shared cultural background) ─────────
    if (maleCustomer.religion === female.religion) {
      score += 10;
      breakdown.religion = { points: 10, note: 'Same religion' };
      if (maleCustomer.caste === female.caste) {
        score += 5;
        breakdown.caste = { points: 5, note: 'Same caste' };
      }
    }

    // ── Diet compatibility ────────────────────────────────────
    if (maleCustomer.diet === female.diet) {
      score += 8;
      breakdown.diet = { points: 8, note: 'Same dietary preference' };
    } else if (
      (maleCustomer.diet === 'Vegetarian' && female.diet === 'Vegetarian') ||
      (maleCustomer.diet !== 'Vegetarian' && female.diet !== 'Vegetarian')
    ) {
      score += 4;
      breakdown.diet = { points: 4, note: 'Similar dietary habits' };
    }

    // ── Family values ─────────────────────────────────────────
    if (maleCustomer.familyValues === female.familyValues) {
      score += 7;
      breakdown.familyValues = { points: 7, note: 'Matching family values' };
    }

    // ── Marital status ────────────────────────────────────────
    if (female.maritalStatus === 'Never Married') {
      score += 5;
      breakdown.maritalStatus = { points: 5, note: 'First marriage' };
    }

    return {
      profile: female,
      rawScore: score,
      breakdown,
    };
  });

  return scored
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, limit)
    .map(s => ({ ...s, normalizedScore: normalizeScore(s.rawScore, 100) }));
};

/**
 * Female customer ke liye matching logic
 * Holistic, values-based compatibility approach
 */
const findMatchesForFemale = (femaleCustomer, malePool, limit) => {
  const scored = malePool.map(male => {
    let score = 0;
    const breakdown = {};

    // ── Age: Older male preferred (by 1-7 years) ──────────────
    const ageDiff = (male.age || 32) - (femaleCustomer.age || 27);
    if (ageDiff >= 1 && ageDiff <= 7) {
      score += 20;
      breakdown.age = { points: 20, note: `${ageDiff} years older - ideal for female` };
    } else if (ageDiff >= 0 && ageDiff <= 10) {
      score += 12;
      breakdown.age = { points: 12, note: 'Acceptable age difference' };
    } else if (ageDiff < 0 && ageDiff >= -2) {
      score += 6;
      breakdown.age = { points: 6, note: 'Male slightly younger - open minded match' };
    } else {
      score += 2;
      breakdown.age = { points: 2, note: 'Age difference outside comfort zone' };
    }

    // ── Education Compatibility ───────────────────────────────
    const eduScore = compareEducation(femaleCustomer.highestDegree, male.highestDegree);
    score += eduScore;
    breakdown.education = {
      points: eduScore,
      note: eduScore > 10 ? 'Education levels well-matched' : 'Education gap present',
    };

    // ── Profession / Stability ────────────────────────────────
    if (['Employed', 'Self-Employed', 'Business'].includes(male.employmentType)) {
      score += 12;
      breakdown.career = { points: 12, note: 'Professionally established' };
    }
    if (male.annualIncome && male.annualIncome >= 10) {
      score += 8;
      breakdown.income = { points: 8, note: 'Good income level' };
    } else if (male.annualIncome && male.annualIncome >= 5) {
      score += 5;
      breakdown.income = { points: 5, note: 'Moderate income' };
    }

    // ── Relocation compatibility ──────────────────────────────
    if (femaleCustomer.openToRelocate === 'Yes' || male.city === femaleCustomer.city) {
      score += 8;
      breakdown.location = { points: 8, note: 'Location flexible/same city' };
    } else if (femaleCustomer.openToRelocate === 'Maybe') {
      score += 4;
      breakdown.location = { points: 4, note: 'Open to discussing relocation' };
    }

    // ── Family values alignment ───────────────────────────────
    if (femaleCustomer.familyValues === male.familyValues) {
      score += 10;
      breakdown.familyValues = { points: 10, note: 'Same family values' };
    } else if (
      (femaleCustomer.familyValues === 'Moderate') ||
      (male.familyValues === 'Moderate')
    ) {
      score += 5;
      breakdown.familyValues = { points: 5, note: 'Compatible family orientations' };
    }

    // ── Kids & Life goals ─────────────────────────────────────
    if (femaleCustomer.wantKids === male.wantKids) {
      score += 15;
      breakdown.kids = { points: 15, note: 'Both aligned on having children' };
    } else if (femaleCustomer.wantKids === 'Maybe' || male.wantKids === 'Maybe') {
      score += 7;
      breakdown.kids = { points: 7, note: 'Flexible on children' };
    }

    // ── Religion / Culture ────────────────────────────────────
    if (femaleCustomer.religion === male.religion) {
      score += 8;
      breakdown.religion = { points: 8, note: 'Same religion' };
    }

    // ── Lifestyle compatibility ───────────────────────────────
    if (femaleCustomer.diet === male.diet) {
      score += 7;
      breakdown.diet = { points: 7, note: 'Same diet - daily harmony' };
    }
    if (femaleCustomer.openToPets === male.openToPets || male.openToPets === 'Yes') {
      score += 3;
      breakdown.pets = { points: 3, note: 'Pet preferences compatible' };
    }

    // ── Smoking/Drinking (female usually prefers non-smoker) ──
    if (male.smoking === 'No') {
      score += 4;
      breakdown.smoking = { points: 4, note: 'Non-smoker' };
    }
    if (male.drinking === 'No') {
      score += 3;
      breakdown.drinking = { points: 3, note: 'Non-drinker' };
    }

    return {
      profile: male,
      rawScore: score,
      breakdown,
    };
  });

  return scored
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, limit)
    .map(s => ({ ...s, normalizedScore: normalizeScore(s.rawScore, 100) }));
};

/**
 * Education levels compare karo
 */
const compareEducation = (deg1, deg2) => {
  const levels = {
    'High School': 1,
    'Diploma': 2,
    "Bachelor's": 3,
    "Master's": 4,
    'MBA': 4,
    'PhD': 5,
    'MD': 5,
  };
  const l1 = levels[deg1] || 3;
  const l2 = levels[deg2] || 3;
  const diff = Math.abs(l1 - l2);
  if (diff === 0) return 12;
  if (diff === 1) return 8;
  return 3;
};

/**
 * Score ko 0-100 range mein normalize karo
 */
const normalizeScore = (raw, max) => {
  return Math.min(100, Math.round((raw / max) * 100));
};

/**
 * Score se match category determine karo
 */
const getMatchCategory = (score) => {
  if (score >= 75) return 'High Potential';
  if (score >= 55) return 'Good Match';
  if (score >= 35) return 'Moderate Match';
  return 'Exploratory';
};

module.exports = { findMatches, getMatchCategory, normalizeScore };