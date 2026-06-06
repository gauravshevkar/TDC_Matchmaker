// services/geminiService.js

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const isGeminiEnabled = () => {
  const key = process.env.GEMINI_API_KEY;
  return !!(key && key.trim() !== '' && key !== 'YOUR_GEMINI_API_KEY_HERE');
};

/**
 * Retry helper — exponential backoff for high-demand / 503 errors
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (prompt, retries = 3) => {
  if (!isGeminiEnabled()) throw new Error('GEMINI_KEY_MISSING');

  const apiKey = process.env.GEMINI_API_KEY;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,   // increased — truncation fix
          // responseMimeType removed — caused issues with 2.5-flash
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const err = await response.json();
    const msg = err.error?.message || 'Unknown error';
    const isRetryable = response.status === 503 || msg.includes('high demand') || msg.includes('overloaded');

    if (isRetryable && attempt < retries) {
      const delay = 2000 * attempt; // 2s, 4s, 6s
      console.log(`[Gemini] Retrying in ${delay}ms (attempt ${attempt}/${retries})...`);
      await sleep(delay);
      continue;
    }

    throw new Error(`Gemini API Error: ${msg}`);
  }
};

/**
 * Safely parse JSON from Gemini response
 * Strips markdown fences and handles truncation gracefully
 */
const safeParseJSON = (raw, fallback) => {
  try {
    // Strip ```json ... ``` fences if present
    const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract just the JSON object if response has extra text
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    console.error('[Gemini] JSON parse failed. Raw snippet:', raw.slice(0, 200));
    return fallback;
  }
};

const generateMatchScore = async (customer, potentialMatch) => {
  if (!isGeminiEnabled()) {
    console.log('[Gemini] API key not configured — using rule-based scoring only.');
    return null;
  }

  const prompt = `
You are an expert Indian matrimonial matchmaker with deep knowledge of Indian culture, values, and compatibility factors.

Analyze the compatibility between these two profiles and return a JSON response ONLY (no markdown, no explanation outside JSON).

CUSTOMER PROFILE:
- Name: ${customer.firstName} ${customer.lastName}
- Age: ${customer.age || 'N/A'}
- Gender: ${customer.gender}
- City: ${customer.city}, ${customer.state || ''}
- Education: ${customer.highestDegree} from ${customer.undergradCollege || 'N/A'}
- Profession: ${customer.designation} at ${customer.currentCompany}
- Annual Income: ${customer.annualIncome ? customer.annualIncome + ' LPA' : 'N/A'}
- Religion: ${customer.religion}, Caste: ${customer.caste}
- Marital Status: ${customer.maritalStatus}
- Diet: ${customer.diet}
- Family Type: ${customer.familyType}
- Family Values: ${customer.familyValues}
- Want Kids: ${customer.wantKids}
- Open to Relocate: ${customer.openToRelocate}
- Languages: ${customer.languagesKnown?.join(', ') || 'N/A'}
- Hobbies: ${customer.hobbies?.join(', ') || 'N/A'}
- Height: ${customer.height ? customer.height + 'cm' : 'N/A'}

POTENTIAL MATCH PROFILE:
- Name: ${potentialMatch.firstName} ${potentialMatch.lastName}
- Age: ${potentialMatch.age || 'N/A'}
- Gender: ${potentialMatch.gender}
- City: ${potentialMatch.city}, ${potentialMatch.state || ''}
- Education: ${potentialMatch.highestDegree} from ${potentialMatch.undergradCollege || 'N/A'}
- Profession: ${potentialMatch.designation} at ${potentialMatch.currentCompany}
- Annual Income: ${potentialMatch.annualIncome ? potentialMatch.annualIncome + ' LPA' : 'N/A'}
- Religion: ${potentialMatch.religion}, Caste: ${potentialMatch.caste}
- Marital Status: ${potentialMatch.maritalStatus}
- Diet: ${potentialMatch.diet}
- Family Type: ${potentialMatch.familyType}
- Family Values: ${potentialMatch.familyValues}
- Want Kids: ${potentialMatch.wantKids}
- Open to Relocate: ${potentialMatch.openToRelocate}
- Languages: ${potentialMatch.languagesKnown?.join(', ') || 'N/A'}
- Hobbies: ${potentialMatch.hobbies?.join(', ') || 'N/A'}
- Height: ${potentialMatch.height ? potentialMatch.height + 'cm' : 'N/A'}

Return ONLY this JSON structure with NO text before or after it:
{
  "score": <number 0-100>,
  "category": "<High Potential|Good Match|Moderate Match|Exploratory>",
  "explanation": "<2-3 sentences explaining the match in a warm, professional tone>",
  "factors": {
    "ageCompatibility": { "score": <0-100>, "note": "<brief note>" },
    "locationCompatibility": { "score": <0-100>, "note": "<brief note>" },
    "educationCompatibility": { "score": <0-100>, "note": "<brief note>" },
    "valuesCompatibility": { "score": <0-100>, "note": "<brief note>" },
    "lifestyleCompatibility": { "score": <0-100>, "note": "<brief note>" },
    "familyCompatibility": { "score": <0-100>, "note": "<brief note>" }
  },
  "highlights": ["<positive point 1>", "<positive point 2>"],
  "considerations": ["<thing to discuss 1>"]
}`;

  try {
    const raw = await callGemini(prompt);

    const parsed = safeParseJSON(raw, {
      score: 50,
      category: 'Exploratory',
      explanation: 'AI response could not be parsed. Showing rule-based score.',
      factors: {},
      highlights: [],
      considerations: [],
    });

    console.log(`[Gemini] ✅ Score for ${customer.firstName} ↔ ${potentialMatch.firstName}: ${parsed.score}`);
    return parsed;

  } catch (error) {
    if (error.message === 'GEMINI_KEY_MISSING') return null;
    console.error('[Gemini] Match score error:', error.message);
    return null;
  }
};

const generateIntroEmail = async (customer, potentialMatch) => {
  if (!isGeminiEnabled()) return null;

  const prompt = `
You are a warm, professional Indian matrimonial matchmaker writing a personalized introduction.

Write a short, elegant introduction email from TDC (The Date Crew) introducing ${potentialMatch.firstName} to ${customer.firstName}.

Customer receiving email: ${customer.firstName} ${customer.lastName} (${customer.age || 'N/A'} years, ${customer.city})
Being introduced to: ${potentialMatch.firstName} ${potentialMatch.lastName} (${potentialMatch.age || 'N/A'} years, ${potentialMatch.city}, ${potentialMatch.designation} at ${potentialMatch.currentCompany})

Write in a warm, professional, culturally sensitive tone. Keep it under 150 words. Include:
1. A warm greeting
2. Why you think this could be a great match (1-2 specific reasons)
3. Encouragement to connect
4. Sign off from TDC team

Output only the email body text, no subject line, no JSON.
`;

  try {
    const email = await callGemini(prompt);
    console.log(`[Gemini] ✅ Intro email generated for ${customer.firstName} → ${potentialMatch.firstName}`);
    return email;
  } catch (error) {
    if (error.message === 'GEMINI_KEY_MISSING') return null;
    console.error('[Gemini] Email generation error:', error.message);
    return null;
  }
};

const generateProfileSummary = async (customer) => {
  if (!isGeminiEnabled()) return null;

  const prompt = `
Write a warm, professional 2-sentence profile summary for an Indian matrimonial profile.

Person: ${customer.firstName}, ${customer.age || 'N/A'} years old, ${customer.gender}
From: ${customer.city}
Education: ${customer.highestDegree}
Profession: ${customer.designation} at ${customer.currentCompany}
Family: ${customer.familyValues} values, ${customer.familyType} family
Personality hints: ${customer.hobbies?.join(', ') || 'N/A'}

Write in third person, warm and appealing. Under 60 words. No JSON, plain text only.
`;

  try {
    const summary = await callGemini(prompt);
    console.log(`[Gemini] ✅ Profile summary generated for ${customer.firstName}`);
    return summary;
  } catch (error) {
    if (error.message === 'GEMINI_KEY_MISSING') return null;
    console.error('[Gemini] Profile summary error:', error.message);
    return null;
  }
};

module.exports = {
  generateMatchScore,
  generateIntroEmail,
  generateProfileSummary,
  isGeminiEnabled,
};