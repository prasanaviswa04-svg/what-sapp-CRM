/**
 * AI Lead Intelligence & Lead Scoring Engine
 * Evaluates budget readiness, timeline, interactions, site visit activity
 */
function calculateLeadScore(customer, leadData = {}) {
  let score = 30; // base score for new prospect
  const factors = [];

  const reqs = customer.requirements || {};

  // 1. Budget specified
  if (reqs.maxBudget > 0) {
    score += 20;
    factors.push('Customer has clearly defined maximum budget');
  }

  // 2. Timeline urgency
  if (reqs.purchaseTimeline === 'Immediate (0-1 month)') {
    score += 25;
    factors.push('High urgency: Immediate purchase timeline (0-1 month)');
  } else if (reqs.purchaseTimeline === 'Near term (1-3 months)') {
    score += 15;
    factors.push('Active intent: 1-3 months purchase timeline');
  }

  // 3. Location specificity
  if (customer.preferredLocation && customer.preferredLocation.length > 2) {
    score += 10;
    factors.push(`Targeted locality: ${customer.preferredLocation}`);
  }

  // 4. Multiple interactions / enquiries
  if (customer.totalInteractions > 3) {
    score += 10;
    factors.push('High engagement: Multiple enquiries or WhatsApp messages');
  }

  // 5. Stage bonus
  const stage = leadData.stage;
  if (stage === 'Site Visit Scheduled') {
    score += 15;
    factors.push('Milestone: Site visit scheduled');
  } else if (stage === 'Negotiation') {
    score += 20;
    factors.push('Milestone: Active price negotiation');
  }

  const finalScore = Math.min(Math.round(score), 100);

  let classification = 'Warm';
  if (finalScore >= 85) classification = 'High Intent';
  else if (finalScore >= 70) classification = 'Hot';
  else if (finalScore < 40) classification = 'Cold';

  return {
    score: finalScore,
    classification,
    factors
  };
}

module.exports = { calculateLeadScore };
