const axios = require('axios');
const Property = require('../models/Property');
const KnowledgeBase = require('../models/KnowledgeBase');
const Company = require('../models/Company');

/**
 * Extracts customer preferences from conversation text
 */
function extractRequirementsRuleBased(text) {
  const extracted = {};
  const lower = text.toLowerCase();

  // 1. Detect bedrooms (e.g. "3 bhk", "3bhk", "4 bedroom", "2 beds")
  const bhkMatch = lower.match(/(\d+)\s*(?:bhk|bedroom|bed|room)/i);
  if (bhkMatch) {
    extracted.bedrooms = parseInt(bhkMatch[1], 10);
  }

  // 2. Detect budget (e.g. "under 2 cr", "budget 1.5 cr", "within 80 lakhs", "50 lacs", "3 crore")
  const crMatch = lower.match(/(?:under|below|within|budget|around|max)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i);
  if (crMatch) {
    const val = parseFloat(crMatch[1]);
    extracted.maxBudget = Math.round(val * 10000000);
    extracted.minBudget = Math.round(extracted.maxBudget * 0.7);
  } else {
    const lakhMatch = lower.match(/(?:under|below|within|budget|around|max)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac|l)/i);
    if (lakhMatch) {
      const val = parseFloat(lakhMatch[1]);
      extracted.maxBudget = Math.round(val * 100000);
      extracted.minBudget = Math.round(extracted.maxBudget * 0.7);
    }
  }

  // 3. Detect property category
  if (lower.includes('villa') || lower.includes('bungalow')) {
    extracted.propertyCategory = 'Villa';
  } else if (lower.includes('apartment') || lower.includes('flat') || lower.includes('condo')) {
    extracted.propertyCategory = 'Apartment';
  } else if (lower.includes('plot') || lower.includes('land')) {
    extracted.propertyCategory = 'Plot';
  } else if (lower.includes('office') || lower.includes('commercial') || lower.includes('retail')) {
    extracted.propertyCategory = 'Commercial';
  } else if (lower.includes('rent') || lower.includes('lease')) {
    extracted.purpose = 'Rent';
  }

  // 4. Common localities in NCR / Real estate
  const localities = ['golf course', 'sohna', 'dlf', 'cyber city', 'dwarka expressway', 'sector 48', 'sector 57', 'sector 65', 'mg road', 'whitefield', 'bandra', 'worli'];
  for (const loc of localities) {
    if (lower.includes(loc)) {
      extracted.preferredLocation = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  return extracted;
}

/**
 * Grounds and generates an AI response for customer WhatsApp inquiries
 */
async function generateAiRealEstateResponse(customer, incomingMessage, conversationHistory = []) {
  const companyId = customer.companyId;
  const company = await Company.findById(companyId);
  const aiConfig = company?.aiConfig || {};

  const userText = incomingMessage.trim();
  const lowerText = userText.toLowerCase();

  // 1. Check for Human Escalation Keywords
  const escalationKeywords = aiConfig.escalationKeywords || ['human', 'agent', 'broker', 'speak to someone', 'call me'];
  const needsEscalation = escalationKeywords.some(keyword => lowerText.includes(keyword));

  if (needsEscalation) {
    return {
      replyText: `I completely understand! I am connecting you with our Senior Property Specialist right away. A dedicated broker will join this conversation and assist you shortly. In the meantime, feel free to share any specific preferences or documents!`,
      extractedRequirements: {},
      needsEscalation: true,
      groundedProperties: []
    };
  }

  // 2. Extract requirements from message
  const extractedRequirements = extractRequirementsRuleBased(userText);

  // 3. Retrieve verified available properties from MongoDB
  const availableProperties = await Property.find({
    companyId,
    status: 'Available'
  })
    .select('propertyCode title category address totalPrice bedrooms bathrooms builtUpArea amenities images')
    .limit(5)
    .lean();

  // 4. Retrieve Knowledge Base items
  const kbArticles = await KnowledgeBase.find({ companyId, isPublished: true }).limit(5).lean();

  // 5. If OpenAI API Key is configured, use GPT
  if (aiConfig.apiKey) {
    try {
      const messages = [
        {
          role: 'system',
          content: `${aiConfig.systemPrompt || 'You are EstateFlow AI, an elite luxury real estate assistant.'}
Ground your property recommendations ONLY on these verified database listings. NEVER invent prices, availability, or amenities:
${JSON.stringify(availableProperties, null, 2)}

Company Knowledge Base / Policies:
${kbArticles.map(k => `${k.title}: ${k.content}`).join('\n')}

Instructions:
1. Be courteous, professional, and helpful.
2. If the user asks for properties, recommend 1 or 2 matching verified listings from the data above with their exact prices and codes.
3. Invite them to schedule a free VIP site visit.
4. Keep the WhatsApp message concise, clean, with emojis and bullet points.`
        }
      ];

      // Add last 4 messages from history for conversational context
      conversationHistory.slice(-4).forEach(msg => {
        messages.push({
          role: msg.senderType === 'customer' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      messages.push({ role: 'user', content: userText });

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: aiConfig.model || 'gpt-4o-mini',
          messages,
          temperature: aiConfig.temperature || 0.2
        },
        {
          headers: {
            Authorization: `Bearer ${aiConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const replyText = response.data.choices[0].message.content;
      return {
        replyText,
        extractedRequirements,
        needsEscalation: false,
        groundedProperties: availableProperties.slice(0, 2)
      };
    } catch (apiErr) {
      console.warn('OpenAI API request failed, falling back to smart grounder:', apiErr.message);
    }
  }

  // 6. Smart Grounded Fallback Engine (Zero External Key Required!)
  let replyText = '';
  let matching = [...availableProperties];

  if (extractedRequirements.bedrooms) {
    const bedMatch = matching.filter(p => p.bedrooms === extractedRequirements.bedrooms);
    if (bedMatch.length > 0) matching = bedMatch;
  }

  if (extractedRequirements.maxBudget) {
    const budgetMatch = matching.filter(p => p.totalPrice <= extractedRequirements.maxBudget * 1.15);
    if (budgetMatch.length > 0) matching = budgetMatch;
  }

  if (matching.length > 0) {
    const top = matching[0];
    const priceCr = (top.totalPrice / 10000000).toFixed(2);
    replyText = `Hello! Thank you for reaching out to EstateFlow Realty 🏡\n\nI found a verified listing that matches your interest:\n\n✨ *${top.title}* (${top.propertyCode})\n📍 *Location:* ${top.address.locality}, ${top.address.city}\n💰 *Price:* ₹${priceCr} Cr\n🛏️ *Layout:* ${top.bedrooms} BHK (${top.builtUpArea} sq.ft)\n🏊 *Amenities:* ${top.amenities.slice(0, 3).join(', ')}\n\nWould you like me to schedule a private site visit this weekend, or send you the high-resolution floor plan brochure? 📲`;
  } else {
    replyText = `Hello! Thank you for contacting EstateFlow Realty 🏡\n\nWe have received your enquiry. Could you kindly share your preferred locality and approximate budget range so we can present our verified luxury listings tailored to your requirements?\n\nOur team is also available to schedule on-site walkthroughs at your convenience.`;
  }

  return {
    replyText,
    extractedRequirements,
    needsEscalation: false,
    groundedProperties: matching.slice(0, 2)
  };
}

module.exports = {
  extractRequirementsRuleBased,
  generateAiRealEstateResponse
};
