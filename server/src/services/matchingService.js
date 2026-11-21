const Property = require('../models/Property');
const Customer = require('../models/Customer');

/**
 * Formats a clean, high-conversion real estate WhatsApp brochure message
 */
function formatPropertyWhatsAppMessage(property, customer) {
  const greeting = customer?.fullName ? `Hello *${customer.fullName}*! ` : 'Hello! ';
  const priceCr = (property.totalPrice / 10000000).toFixed(2);
  const priceSqft = property.pricePerUnit ? ` (₹${property.pricePerUnit.toLocaleString('en-IN')}/${property.unit || 'sqft'})` : '';
  const amenitiesStr = property.amenities?.length ? property.amenities.slice(0, 4).join(', ') : 'Gated Community, 24/7 Security';
  const beds = property.bedrooms > 0 ? `${property.bedrooms} BHK | ` : '';
  const baths = property.bathrooms > 0 ? `${property.bathrooms} Baths | ` : '';
  const area = property.builtUpArea ? `${property.builtUpArea.toLocaleString('en-IN')} ${property.unit || 'sq.ft'}` : '';

  return `🏡 *Exclusive Property Recommendation from EstateFlow CRM*

${greeting}Based on your requirement for a *${property.category}*, here is a premium listing matched for you:

✨ *${property.title}* (${property.propertyCode})
📍 *Location:* ${property.address?.locality || 'Prime Locality'}, ${property.address?.city || 'Gurugram'}
💰 *Price:* ₹${priceCr} Cr${priceSqft}
📐 *Configuration:* ${beds}${baths}${area}
🏊 *Amenities:* ${amenitiesStr}

${property.description ? `📝 *Overview:* ${property.description.slice(0, 160)}...\n\n` : ''}Would you like to schedule an exclusive site visit or receive the complete digital floor plans? 

Reply *YES* to connect directly with your dedicated advisor.`;
}

/**
 * Intelligent Property Matching Engine
 * Compares customer requirements against available property records in MongoDB
 * Prioritizes exact Property Category (e.g. Villa, Apartment)
 */
async function matchPropertiesForCustomer(customer, limit = 10) {
  const companyId = customer.companyId;
  const reqs = customer.requirements || {};

  // Hard constraint: Only Available properties
  const query = {
    companyId,
    status: 'Available'
  };

  const properties = await Property.find(query)
    .populate('assignedBrokerId', 'firstName lastName email phone')
    .lean();

  if (!properties || properties.length === 0) {
    return [];
  }

  const scoredProperties = properties.map(property => {
    let score = 0;
    const matchFactors = [];
    const missingFactors = [];

    // 1. Property Category Compatibility (Weight: 35 points - HIGHEST PRIORITY)
    const reqCategory = reqs.propertyCategory;
    if (reqCategory && reqCategory !== 'Any') {
      if (property.category.toLowerCase() === reqCategory.toLowerCase()) {
        score += 35;
        matchFactors.push(`Exact category match: ${property.category}`);
      } else {
        missingFactors.push(`Category is ${property.category} (requested: ${reqCategory})`);
      }
    } else {
      score += 25; // Default if customer has no specific category preference
    }

    // 2. Budget Compatibility (Weight: 30 points)
    const minBudget = reqs.minBudget || 0;
    const maxBudget = reqs.maxBudget || 0;
    const price = property.totalPrice;

    if (maxBudget > 0) {
      if (price <= maxBudget && (minBudget === 0 || price >= minBudget * 0.85)) {
        score += 30;
        matchFactors.push(`Within budget (₹${(price / 10000000).toFixed(2)} Cr)`);
      } else if (price <= maxBudget * 1.2) {
        score += 20;
        matchFactors.push(`Near budget (within 20% stretch: ₹${(price / 10000000).toFixed(2)} Cr)`);
      } else {
        missingFactors.push(`Price ₹${(price / 10000000).toFixed(2)} Cr exceeds budget ₹${(maxBudget / 10000000).toFixed(2)} Cr`);
      }
    } else {
      score += 20;
    }

    // 3. Location Alignment (Weight: 20 points)
    const prefLocation = (customer.preferredLocation || '').trim().toLowerCase();
    const propLocality = (property.address?.locality || '').toLowerCase();
    const propCity = (property.address?.city || '').toLowerCase();

    if (prefLocation) {
      if (propLocality.includes(prefLocation) || prefLocation.includes(propLocality)) {
        score += 20;
        matchFactors.push(`Exact locality match: ${property.address.locality}`);
      } else if (propCity.includes(prefLocation) || prefLocation.includes(propCity)) {
        score += 12;
        matchFactors.push(`City match: ${property.address.city}`);
      } else {
        missingFactors.push(`Located in ${property.address.locality}, ${property.address.city}`);
      }
    } else {
      score += 15;
    }

    // 4. Bedrooms Alignment (Weight: 15 points)
    const reqBeds = reqs.bedrooms || 0;
    if (reqBeds > 0) {
      if (property.bedrooms === reqBeds) {
        score += 15;
        matchFactors.push(`Exact ${reqBeds} BHK layout`);
      } else if (Math.abs(property.bedrooms - reqBeds) === 1) {
        score += 8;
        matchFactors.push(`Alternative ${property.bedrooms} BHK layout`);
      } else {
        missingFactors.push(`Has ${property.bedrooms} BHK (requested: ${reqBeds} BHK)`);
      }
    } else {
      score += 10;
    }

    // Cap score at 100
    const finalScore = Math.min(Math.round(score), 100);

    return {
      property,
      matchScore: finalScore,
      matchPercentage: `${finalScore}%`,
      matchFactors,
      missingFactors,
      recommendedAction: finalScore >= 75 ? 'Highly Recommended for WhatsApp Share' : finalScore >= 50 ? 'Good Alternative Listing' : 'Marginal Fit'
    };
  });

  // Sort descending by match score
  scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

  return scoredProperties.slice(0, limit);
}

/**
 * Inverse Matching Engine: Find Customers for a Given Property
 * e.g., when a new Villa or Apartment is created, find all interested buyers
 */
async function matchCustomersForProperty(property, limit = 10) {
  const companyId = property.companyId;

  const customers = await Customer.find({ companyId })
    .populate('assignedBrokerId', 'firstName lastName email phone')
    .lean();

  if (!customers || customers.length === 0) {
    return [];
  }

  const scoredCustomers = customers.map(customer => {
    let score = 0;
    const matchFactors = [];
    const reqs = customer.requirements || {};

    // 1. Category Alignment (35 points)
    const reqCategory = reqs.propertyCategory;
    if (reqCategory && reqCategory !== 'Any') {
      if (reqCategory.toLowerCase() === property.category.toLowerCase()) {
        score += 35;
        matchFactors.push(`Actively looking for ${property.category}`);
      }
    } else {
      score += 20;
    }

    // 2. Budget Compatibility (30 points)
    const maxBudget = reqs.maxBudget || 0;
    const minBudget = reqs.minBudget || 0;
    const price = property.totalPrice;

    if (maxBudget > 0) {
      if (price <= maxBudget && (minBudget === 0 || price >= minBudget * 0.85)) {
        score += 30;
        matchFactors.push(`Within customer budget (Budget up to ₹${(maxBudget / 10000000).toFixed(2)} Cr)`);
      } else if (price <= maxBudget * 1.2) {
        score += 18;
        matchFactors.push(`Near budget range`);
      }
    } else {
      score += 15;
    }

    // 3. Location Alignment (20 points)
    const prefLocation = (customer.preferredLocation || '').trim().toLowerCase();
    const propLocality = (property.address?.locality || '').toLowerCase();
    const propCity = (property.address?.city || '').toLowerCase();

    if (prefLocation) {
      if (propLocality.includes(prefLocation) || prefLocation.includes(propLocality)) {
        score += 20;
        matchFactors.push(`Prefers ${property.address.locality}`);
      } else if (propCity.includes(prefLocation) || prefLocation.includes(propCity)) {
        score += 12;
        matchFactors.push(`Prefers ${property.address.city}`);
      }
    } else {
      score += 12;
    }

    // 4. Bedroom Requirement (15 points)
    const reqBeds = reqs.bedrooms || 0;
    if (reqBeds > 0) {
      if (property.bedrooms === reqBeds) {
        score += 15;
        matchFactors.push(`Requires ${reqBeds} BHK`);
      } else if (Math.abs(property.bedrooms - reqBeds) === 1) {
        score += 8;
      }
    } else {
      score += 10;
    }

    const finalScore = Math.min(Math.round(score), 100);

    return {
      customer,
      matchScore: finalScore,
      matchPercentage: `${finalScore}%`,
      matchFactors
    };
  });

  // Filter only meaningful matches (>= 40%) and sort descending
  const relevant = scoredCustomers.filter(c => c.matchScore >= 40);
  relevant.sort((a, b) => b.matchScore - a.matchScore);

  return relevant.slice(0, limit);
}

module.exports = {
  matchPropertiesForCustomer,
  matchCustomersForProperty,
  formatPropertyWhatsAppMessage
};
