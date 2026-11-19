const Property = require('../models/Property');

/**
 * Intelligent Property Matching Engine
 * Compares customer requirements against available property records in MongoDB
 * Produces a weighted score 0 - 100% and detailed match explanation
 */
async function matchPropertiesForCustomer(customer, limit = 10) {
  const companyId = customer.companyId;
  const reqs = customer.requirements || {};

  // Hard constraint: Only Available properties (never Sold, Unavailable, or Archived)
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

    // 1. Budget Compatibility (Weight: 35 points)
    const minBudget = reqs.minBudget || 0;
    const maxBudget = reqs.maxBudget || 0;
    const price = property.totalPrice;

    if (maxBudget > 0) {
      if (price <= maxBudget && (minBudget === 0 || price >= minBudget * 0.85)) {
        score += 35;
        matchFactors.push(`Within budget range (₹${(price / 10000000).toFixed(2)} Cr)`);
      } else if (price <= maxBudget * 1.15) {
        // Within 15% stretch budget
        score += 25;
        matchFactors.push(`Near budget (within 15% stretch: ₹${(price / 10000000).toFixed(2)} Cr)`);
      } else {
        missingFactors.push(`Price ₹${(price / 10000000).toFixed(2)} Cr exceeds max budget ₹${(maxBudget / 10000000).toFixed(2)} Cr`);
      }
    } else {
      score += 20; // Default partial if no budget defined
    }

    // 2. Location Alignment (Weight: 25 points)
    const prefLocation = (customer.preferredLocation || '').trim().toLowerCase();
    const propLocality = (property.address?.locality || '').toLowerCase();
    const propCity = (property.address?.city || '').toLowerCase();

    if (prefLocation) {
      if (propLocality.includes(prefLocation) || prefLocation.includes(propLocality)) {
        score += 25;
        matchFactors.push(`Exact locality match in ${property.address.locality}`);
      } else if (propCity.includes(prefLocation) || prefLocation.includes(propCity)) {
        score += 15;
        matchFactors.push(`City match in ${property.address.city}`);
      } else {
        missingFactors.push(`Located in ${property.address.locality}, ${property.address.city} (preferred: ${customer.preferredLocation})`);
      }
    } else {
      score += 15;
    }

    // 3. Bedrooms Alignment (Weight: 20 points)
    const reqBeds = reqs.bedrooms || 0;
    if (reqBeds > 0) {
      if (property.bedrooms === reqBeds) {
        score += 20;
        matchFactors.push(`Exact ${reqBeds} BHK layout`);
      } else if (Math.abs(property.bedrooms - reqBeds) === 1) {
        score += 10;
        matchFactors.push(`Alternative ${property.bedrooms} BHK layout`);
      } else {
        missingFactors.push(`Has ${property.bedrooms} BHK instead of requested ${reqBeds} BHK`);
      }
    } else {
      score += 15;
    }

    // 4. Property Category (Weight: 10 points)
    const reqCategory = reqs.propertyCategory;
    if (reqCategory && reqCategory !== 'Any') {
      if (property.category.toLowerCase() === reqCategory.toLowerCase()) {
        score += 10;
        matchFactors.push(`Category match: ${property.category}`);
      } else {
        missingFactors.push(`Category is ${property.category} (requested: ${reqCategory})`);
      }
    } else {
      score += 10;
    }

    // 5. Amenities Overlap (Weight: 10 points)
    const prefAmenities = reqs.preferredAmenities || [];
    if (prefAmenities.length > 0) {
      const propAmenities = property.amenities || [];
      const matchedAmenities = prefAmenities.filter(a =>
        propAmenities.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
      );

      const ratio = matchedAmenities.length / prefAmenities.length;
      score += Math.round(ratio * 10);

      if (matchedAmenities.length > 0) {
        matchFactors.push(`Matches ${matchedAmenities.length} requested amenities: ${matchedAmenities.slice(0, 3).join(', ')}`);
      }
      const missing = prefAmenities.filter(a => !matchedAmenities.includes(a));
      if (missing.length > 0) {
        missingFactors.push(`Missing amenities: ${missing.slice(0, 2).join(', ')}`);
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
      recommendedAction: finalScore >= 80 ? 'Highly Recommended for WhatsApp Share' : finalScore >= 60 ? 'Good Alternative Listing' : 'Marginal Fit'
    };
  });

  // Sort descending by match score
  scoredProperties.sort((a, b) => b.matchScore - a.matchScore);

  return scoredProperties.slice(0, limit);
}

module.exports = { matchPropertiesForCustomer };
