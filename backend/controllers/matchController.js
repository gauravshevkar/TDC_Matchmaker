// controllers/matchController.js
const Customer = require('../models/Customer');
const Match = require('../models/Match');
const { findMatches, getMatchCategory } = require('../services/matchingService');
const { generateMatchScore, generateIntroEmail, isGeminiEnabled } = require('../services/geminiService');

/**
 * @desc    Customer ke liye matches suggest karo (AI + Rule-based)
 * @route   GET /api/matches/suggest/:customerId
 * @access  Private
 */
const suggestMatches = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId).lean({ virtuals: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Opposite gender ke sab active profiles load karo
    const oppositeGender = customer.gender === 'Male' ? 'Female' : 'Male';
    const pool = await Customer.find({
      gender: oppositeGender,
      status: { $ne: 'Inactive' },
      _id: { $ne: customer._id },
    }).lean({ virtuals: true });

    if (pool.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No profiles in matching pool. Pehle seed data load karo.',
        matches: [],
        aiEnabled: isGeminiEnabled(),
      });
    }

    // Rule-based scoring (hamesha chalta hai)
    const rankedMatches = findMatches(customer, pool, 15);
    const useAI = isGeminiEnabled(); // Sirf tab true jab GEMINI_API_KEY set ho

    // Top 5 ke liye Gemini AI scoring (sirf jab key ho)
    // const top5 = rankedMatches.slice(0, 5);     // delete
    const top2 = rankedMatches.slice(0, 2);

    // const enrichedMatches = await Promise.all(
    //   top5.map(async (match) => {
    //     // AI score try karo — agar null aaya to rule-based use karo
    //     const aiData = useAI ? await generateMatchScore(customer, match.profile) : null;

    //     const finalScore = aiData
    //       ? Math.round((match.normalizedScore * 0.4) + (aiData.score * 0.6))
    //       : match.normalizedScore;

    //     const category = aiData?.category || getMatchCategory(finalScore);

    //     return {
    //       profile: match.profile,
    //       score: finalScore,
    //       category,
    //       explanation: aiData?.explanation || `Rule-based score: ${finalScore}/100. Add GEMINI_API_KEY for AI explanations.`,
    //       factors: aiData?.factors || {},
    //       highlights: aiData?.highlights || [],
    //       considerations: aiData?.considerations || [],
    //       breakdown: match.breakdown,
    //       aiPowered: !!aiData, // true sirf jab Gemini ne actually score kiya ho
    //     };
    //   })
    // );

const enrichedMatches = [];

for (const match of top2) {

  const aiData = useAI
    ? await generateMatchScore(customer, match.profile)
    : null;

  const finalScore = aiData
    ? Math.round(
        (match.normalizedScore * 0.4) +
        (aiData.score * 0.6)
      )
    : match.normalizedScore;

  const category =
    aiData?.category ||
    getMatchCategory(finalScore);

  enrichedMatches.push({
    profile: match.profile,
    score: finalScore,
    category,
    explanation:
      aiData?.explanation ||
      `Rule-based score: ${finalScore}/100.`,
    factors: aiData?.factors || {},
    highlights: aiData?.highlights || [],
    considerations: aiData?.considerations || [],
    breakdown: match.breakdown,
    aiPowered: !!aiData,
  });

  await new Promise(resolve =>
    setTimeout(resolve, 1500)
  );
}

    // Remaining matches (6-15) — always rule-based
    const remaining = rankedMatches.slice(5).map(match => ({
      profile: match.profile,
      score: match.normalizedScore,
      category: getMatchCategory(match.normalizedScore),
      explanation: `Rule-based score: ${match.normalizedScore}/100.`,
      factors: {},
      highlights: [],
      considerations: [],
      breakdown: match.breakdown,
      aiPowered: false,
    }));

    const allMatches = [...enrichedMatches, ...remaining];

    res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        name: `${customer.firstName} ${customer.lastName}`,
        gender: customer.gender,
      },
      matchesFound: allMatches.length,
      poolSize: pool.length,
      aiEnabled: useAI, // Frontend ko pata chale AI on hai ya off
      matches: allMatches,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Match send karo + AI intro email generate karo
 * @route   POST /api/matches/send
 * @access  Private
 */
const sendMatch = async (req, res, next) => {
  try {
    const { customerId, matchedWithId, score, category, explanation } = req.body;

    const [customer, matchedWith] = await Promise.all([
      Customer.findById(customerId).lean({ virtuals: true }),
      Customer.findById(matchedWithId).lean({ virtuals: true }),
    ]);

    if (!customer || !matchedWith) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Duplicate match check
    const existing = await Match.findOne({ customer: customerId, matchedWith: matchedWithId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Match already sent to this profile' });
    }

    // AI intro email — sirf jab Gemini key ho; nahi to template
    let introEmail = '';
    let emailGeneratedByAI = false;

    if (isGeminiEnabled()) {
      const aiEmail = await generateIntroEmail(customer, matchedWith);
      if (aiEmail) {
        introEmail = aiEmail;
        emailGeneratedByAI = true;
      }
    }

    // Agar Gemini key nahi ya AI fail → template email use karo
    if (!introEmail) {
      introEmail = `Dear ${customer.firstName},

We hope this message finds you well! We at TDC are excited to introduce you to ${matchedWith.firstName} ${matchedWith.lastName}, who we believe could be a wonderful match for you.

${matchedWith.firstName} is a ${matchedWith.designation || 'professional'} based in ${matchedWith.city}, and shares several values that align beautifully with your profile.

We encourage you to take a moment to review their profile and we would love to facilitate an introduction if you feel a connection.

With warm regards,
The TDC Matchmaking Team`;
    }

    // Match save karo
    const match = await Match.create({
      customer: customerId,
      matchedWith: matchedWithId,
      proposedBy: req.user._id,
      matchScore: score || 0,
      matchCategory: category || 'Exploratory',
      aiExplanation: explanation || '',
      introEmail,
      status: 'Sent',
      sentAt: new Date(),
    });

    // Customer status update karo
    await Customer.findByIdAndUpdate(customerId, { status: 'Matched' });

    res.status(201).json({
      success: true,
      message: `Match sent successfully to ${customer.firstName}!`,
      match,
      introEmail,
      emailGeneratedByAI, // Frontend ko pata chale
      mockEmail: {
        to: customer.email,
        subject: `TDC - Your Potential Match: ${matchedWith.firstName} ${matchedWith.lastName}`,
        body: introEmail,
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Customer ke sabhi sent matches
 * @route   GET /api/matches/:customerId
 * @access  Private
 */
const getCustomerMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ customer: req.params.customerId })
      .populate('matchedWith', 'firstName lastName gender city designation currentCompany annualIncome profilePhoto')
      .populate('proposedBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Match status update karo
 * @route   PUT /api/matches/:matchId/status
 * @access  Private
 */
const updateMatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const match = await Match.findByIdAndUpdate(
      req.params.matchId,
      { status },
      { new: true }
    );
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    res.status(200).json({ success: true, match });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Gemini AI health check
 * @route   GET /api/matches/ai-status
 * @access  Private
 */
const getAIStatus = (req, res) => {
  const enabled = isGeminiEnabled();
  res.status(200).json({
    success: true,
    aiEnabled: enabled,
    message: enabled
      ? '✅ Gemini AI is active — AI-powered match scoring and email generation enabled.'
      : '⚠️ Gemini API key not configured. Rule-based scoring only. Add GEMINI_API_KEY in backend/.env',
  });
};

module.exports = { suggestMatches, sendMatch, getCustomerMatches, updateMatchStatus, getAIStatus };