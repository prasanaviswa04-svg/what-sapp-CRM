/**
 * Standalone Offline Engine for EstateFlow CRM
 * Allows the entire mobile app (and web app) to function seamlessly
 * when the PC is powered off or disconnected from the network.
 */

export const OFFLINE_ADMIN_USER = {
  id: 'offline_admin_001',
  firstName: 'Aarav',
  lastName: 'Singhania',
  name: 'Aarav Singhania',
  email: 'admin@estateflow.io',
  phone: '+919876543210',
  role: 'Company Admin',
  avatar: '',
  companyId: 'offline_company_001',
  companyName: 'EstateFlow Luxury Realty',
  currency: { code: 'INR', symbol: '₹' },
};

const DEFAULT_PROPERTIES = [
  {
    _id: 'prop_off_101',
    propertyCode: 'EF-VIL-202',
    title: 'Aravalli Greens Luxury Eco Villa',
    description: 'Lavish 5 BHK sprawling villa set on 1.2 acres with private heated pool, landscaped gazebo, tennis court, and organic kitchen garden.',
    category: 'Villa',
    purpose: 'Sale',
    address: { street: 'Damdama Lake Road', locality: 'Sohna Road', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122102' },
    builtUpArea: 6500,
    plotSize: 1200,
    unit: 'sqyd',
    totalPrice: 120000000,
    pricePerUnit: 18461,
    bedrooms: 5,
    bathrooms: 6,
    parkingSpaces: 5,
    amenities: ['Private Heated Pool', 'Tennis Court', '1.2 Acre Lawn', 'Solar Powered', 'Gazebo'],
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prop_off_102',
    propertyCode: 'EF-APT-101',
    title: 'DLF The Camellias - Ultra Luxury Penthouse',
    description: 'Exclusive 4 BHK super-luxury residence facing the lush Aravalli range and the Arnold Palmer Golf Course. Private elevator, Italian marble flooring, and concierge service.',
    category: 'Apartment',
    purpose: 'Sale',
    address: { street: 'Golf Drive', locality: 'Golf Course Road', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122002' },
    builtUpArea: 7300,
    unit: 'sqft',
    totalPrice: 185000000,
    pricePerUnit: 25342,
    bedrooms: 4,
    bathrooms: 5,
    parkingSpaces: 4,
    amenities: ['Private Elevator', 'Golf Course View', 'Infinity Pool', 'Concierge Service'],
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prop_off_103',
    propertyCode: 'EF-VIL-203',
    title: 'The Grand Belvedere Sovereign Villa',
    description: 'Bespoke 6 BHK signature mansion with grand double-height foyer, heated indoor swimming pool, 8-seater private home theatre, and temperature-controlled wine cellar.',
    category: 'Villa',
    purpose: 'Sale',
    address: { street: 'Magnolia Enclave', locality: 'Golf Course Extension Road', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122018' },
    builtUpArea: 9200,
    plotSize: 1500,
    unit: 'sqyd',
    totalPrice: 240000000,
    pricePerUnit: 26086,
    bedrooms: 6,
    bathrooms: 8,
    parkingSpaces: 6,
    amenities: ['Private Theatre', 'Indoor Pool', 'Wine Cellar', 'Elevator', 'Smart Automation'],
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'prop_off_104',
    propertyCode: 'EF-COM-301',
    title: 'Cyber One Grade-A Corporate Suite',
    description: 'Fully furnished high-yield commercial IT office with premium reception, 40 workstations, boardroom, and cafeteria.',
    category: 'Commercial',
    purpose: 'Sale',
    address: { street: 'Cyber City Sector 24', locality: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122002' },
    builtUpArea: 4200,
    unit: 'sqft',
    totalPrice: 85000000,
    pricePerUnit: 20238,
    bedrooms: 0,
    bathrooms: 4,
    parkingSpaces: 6,
    amenities: ['24/7 Power Backup', 'High Speed Elevators', 'Access Control Security'],
    status: 'Available',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CUSTOMERS = [
  {
    _id: 'cust_off_201',
    fullName: 'Rajesh Sharma',
    phone: '+919876543210',
    email: 'rajesh.sharma@gmail.com',
    customerType: 'Buyer',
    leadStatus: 'Hot',
    lifecycleStage: 'Negotiation',
    preferredContactMethod: 'WhatsApp',
    preferredLocation: 'Sohna Road',
    requirements: {
      propertyCategory: 'Villa',
      purpose: 'Sale',
      minBudget: 100000000,
      maxBudget: 150000000,
      minBedrooms: 4,
      preferredLocality: 'Sohna Road',
      specialRequests: 'Looking for a private garden villa with high privacy',
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cust_off_202',
    fullName: 'Priya Patel',
    phone: '+919822334455',
    email: 'priya.patel@techventures.io',
    customerType: 'Buyer',
    leadStatus: 'Warm',
    lifecycleStage: 'Prospect',
    preferredContactMethod: 'WhatsApp',
    preferredLocation: 'Golf Course Road',
    requirements: {
      propertyCategory: 'Apartment',
      purpose: 'Sale',
      minBudget: 150000000,
      maxBudget: 200000000,
      minBedrooms: 4,
      preferredLocality: 'Golf Course Road',
      specialRequests: 'Golf course facing penthouse or high-floor residence',
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cust_off_203',
    fullName: 'Vikram Oberoi',
    phone: '+919811223344',
    email: 'vikram.oberoi@globalrealty.in',
    customerType: 'Buyer',
    leadStatus: 'Hot',
    lifecycleStage: 'Qualified',
    preferredContactMethod: 'WhatsApp',
    preferredLocation: 'Golf Course Extension Road',
    requirements: {
      propertyCategory: 'Villa',
      purpose: 'Sale',
      minBudget: 200000000,
      maxBudget: 260000000,
      minBedrooms: 5,
      preferredLocality: 'Golf Course Extension Road',
      specialRequests: 'Super-luxury estate with private swimming pool',
    },
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_LEADS = [
  {
    _id: 'lead_off_301',
    fullName: 'Rajesh Sharma',
    phone: '+919876543210',
    email: 'rajesh.sharma@gmail.com',
    status: 'Contacted',
    pipelineStage: 'Qualified',
    source: 'WhatsApp Inbound',
    budget: 120000000,
    requirement: 'Villa in Sohna Road',
    priority: 'High',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'lead_off_302',
    fullName: 'Priya Patel',
    phone: '+919822334455',
    email: 'priya.patel@techventures.io',
    status: 'In Progress',
    pipelineStage: 'Site Visit Scheduled',
    source: 'Website',
    budget: 185000000,
    requirement: 'Penthouse Golf Course Road',
    priority: 'Urgent',
    createdAt: new Date().toISOString(),
  },
];

export function getOfflineProperties() {
  try {
    const raw = localStorage.getItem('estateflow_offline_properties');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('estateflow_offline_properties', JSON.stringify(DEFAULT_PROPERTIES));
  return DEFAULT_PROPERTIES;
}

export function saveOfflineProperty(prop) {
  const list = getOfflineProperties();
  const newProp = {
    ...prop,
    _id: prop._id || 'prop_off_' + Date.now(),
    propertyCode: prop.propertyCode || 'EF-' + (prop.category || 'RES').slice(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900),
    status: prop.status || 'Available',
    images: prop.images?.length ? prop.images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    createdAt: new Date().toISOString(),
  };
  list.unshift(newProp);
  localStorage.setItem('estateflow_offline_properties', JSON.stringify(list));
  return newProp;
}

export function getOfflineCustomers() {
  try {
    const raw = localStorage.getItem('estateflow_offline_customers');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('estateflow_offline_customers', JSON.stringify(DEFAULT_CUSTOMERS));
  return DEFAULT_CUSTOMERS;
}

export function saveOfflineCustomer(cust) {
  const list = getOfflineCustomers();
  const newCust = {
    ...cust,
    _id: cust._id || 'cust_off_' + Date.now(),
    customerType: cust.customerType || 'Buyer',
    leadStatus: cust.leadStatus || 'Hot',
    lifecycleStage: cust.lifecycleStage || 'Prospect',
    createdAt: new Date().toISOString(),
  };
  list.unshift(newCust);
  localStorage.setItem('estateflow_offline_customers', JSON.stringify(list));
  return newCust;
}

export function getOfflineLeads() {
  try {
    const raw = localStorage.getItem('estateflow_offline_leads');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem('estateflow_offline_leads', JSON.stringify(DEFAULT_LEADS));
  return DEFAULT_LEADS;
}

export function formatWhatsAppBrochure(property, customer) {
  const greeting = customer?.fullName ? `Hello *${customer.fullName}*! ` : 'Hello! ';
  const priceCr = (property.totalPrice / 10000000).toFixed(2);
  const priceSqft = property.pricePerUnit ? ` (₹${Number(property.pricePerUnit).toLocaleString('en-IN')}/${property.unit || 'sqft'})` : '';
  const amenitiesStr = property.amenities?.length ? property.amenities.slice(0, 4).join(', ') : 'Gated Community, 24/7 Security';
  const beds = property.bedrooms > 0 ? `${property.bedrooms} BHK | ` : '';
  const baths = property.bathrooms > 0 ? `${property.bathrooms} Baths | ` : '';
  const area = property.builtUpArea ? `${Number(property.builtUpArea).toLocaleString('en-IN')} ${property.unit || 'sq.ft'}` : '';

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

export function matchOfflineCustomer(customer) {
  const properties = getOfflineProperties();
  const reqCategory = (customer.requirements?.propertyCategory || '').toLowerCase();
  const minBudget = Number(customer.requirements?.minBudget) || 0;
  const maxBudget = Number(customer.requirements?.maxBudget) || Infinity;
  const cleanPhone = (customer.phone || '').replace(/\D/g, '');

  const matches = properties
    .filter((p) => p.status === 'Available')
    .map((property) => {
      let score = 0;
      const reasons = [];

      // 1. Category Match (35 pts)
      if (reqCategory && reqCategory !== 'any') {
        if (property.category.toLowerCase() === reqCategory) {
          score += 35;
          reasons.push(`Exact category match: ${property.category}`);
        } else {
          score += 5;
        }
      } else {
        score += 25;
      }

      // 2. Budget Match (30 pts)
      const price = property.totalPrice || 0;
      if (minBudget > 0 && maxBudget < Infinity) {
        if (price >= minBudget * 0.8 && price <= maxBudget * 1.2) {
          score += 30;
          reasons.push(`Within budget range ₹${(minBudget / 1e7).toFixed(1)} - ₹${(maxBudget / 1e7).toFixed(1)} Cr`);
        }
      } else {
        score += 20;
      }

      // 3. Locality Match (20 pts)
      const reqLoc = (customer.requirements?.preferredLocality || customer.preferredLocation || '').toLowerCase();
      const propLoc = (property.address?.locality || '').toLowerCase();
      if (reqLoc && propLoc && (propLoc.includes(reqLoc) || reqLoc.includes(propLoc))) {
        score += 20;
        reasons.push(`Preferred locality: ${property.address?.locality}`);
      }

      const matchScore = Math.min(score + 15, 98);
      const shareMessage = formatWhatsAppBrochure(property, customer);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`;

      return {
        property,
        matchScore,
        matchGrade: matchScore >= 80 ? 'Excellent Match' : matchScore >= 60 ? 'Good Match' : 'Potential Match',
        matchReasons: reasons,
        shareMessage,
        whatsappUrl,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

export function matchOfflineProperty(property) {
  const customers = getOfflineCustomers();
  const propCategory = (property.category || '').toLowerCase();
  const price = property.totalPrice || 0;

  const matches = customers
    .map((customer) => {
      let score = 0;
      const reasons = [];
      const reqCategory = (customer.requirements?.propertyCategory || '').toLowerCase();
      const minBudget = Number(customer.requirements?.minBudget) || 0;
      const maxBudget = Number(customer.requirements?.maxBudget) || Infinity;

      if (reqCategory && reqCategory === propCategory) {
        score += 35;
        reasons.push(`Looking for ${property.category}`);
      }

      if (minBudget > 0 && maxBudget < Infinity) {
        if (price >= minBudget * 0.8 && price <= maxBudget * 1.2) {
          score += 30;
          reasons.push(`Budget compatible with ₹${(price / 1e7).toFixed(2)} Cr`);
        }
      }

      const matchScore = Math.min(score + 20, 95);
      const cleanPhone = (customer.phone || '').replace(/\D/g, '');
      const shareMessage = formatWhatsAppBrochure(property, customer);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMessage)}`;

      return {
        customer,
        matchScore,
        matchGrade: matchScore >= 75 ? 'Hot Buyer' : 'Warm Buyer',
        matchReasons: reasons,
        shareMessage,
        whatsappUrl,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return matches;
}

export function getOfflineStats() {
  const properties = getOfflineProperties();
  const customers = getOfflineCustomers();
  const leads = getOfflineLeads();

  return {
    overview: {
      totalRevenue: 545000000,
      activeProperties: properties.length,
      totalCustomers: customers.length,
      activeLeads: leads.length,
      whatsappMessagesSent: 48,
      matchesCalculated: 124,
    },
    topLocalities: [
      { locality: 'Golf Course Road', count: 12 },
      { locality: 'Sohna Road', count: 9 },
      { locality: 'Golf Course Extension Road', count: 8 },
    ],
  };
}

/**
 * Intercepts Axios requests when network fails (e.g. PC is off)
 * Returns valid Axios response structure
 */
export function handleOfflineRequest(config) {
  if (!config) return null;
  const url = (config.url || '').toLowerCase();
  const method = (config.method || 'get').toLowerCase();

  // 1. Auth profile check
  if (url.includes('/auth/me')) {
    const cachedUser = (() => {
      try {
        const u = localStorage.getItem('estateflow_user');
        return u ? JSON.parse(u) : OFFLINE_ADMIN_USER;
      } catch (e) {
        return OFFLINE_ADMIN_USER;
      }
    })();
    return {
      status: 200,
      statusText: 'OK (Standalone Offline)',
      headers: {},
      config,
      data: {
        success: true,
        user: cachedUser,
        isOfflineMode: true,
      },
    };
  }

  // 2. Auth Login (offline fallback)
  if (url.includes('/auth/login') && method === 'post') {
    return {
      status: 200,
      statusText: 'OK (Standalone Offline)',
      headers: {},
      config,
      data: {
        success: true,
        token: 'offline_token_session_2026',
        user: OFFLINE_ADMIN_USER,
        isOfflineMode: true,
      },
    };
  }

  // 3. Customers list
  if (url.endsWith('/customers') || url.includes('/customers?')) {
    if (method === 'get') {
      const customers = getOfflineCustomers();
      return {
        status: 200,
        statusText: 'OK (Offline)',
        headers: {},
        config,
        data: {
          success: true,
          count: customers.length,
          customers,
          isOfflineMode: true,
        },
      };
    }
    if (method === 'post') {
      let body = config.data;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      const newCust = saveOfflineCustomer(body || {});
      const matches = matchOfflineCustomer(newCust);
      const topMatch = matches[0];
      return {
        status: 201,
        statusText: 'Created (Offline)',
        headers: {},
        config,
        data: {
          success: true,
          customer: newCust,
          matches,
          matchCount: matches.length,
          topMatch: topMatch || null,
          shareMessage: topMatch?.shareMessage || '',
          whatsappUrl: topMatch?.whatsappUrl || '',
          isOfflineMode: true,
        },
      };
    }
  }

  // 4. Customer Matches
  if (url.includes('/customers/') && url.includes('/matches')) {
    const customers = getOfflineCustomers();
    const id = url.split('/customers/')[1].split('/')[0];
    const customer = customers.find((c) => c._id === id) || customers[0] || {};
    const matches = matchOfflineCustomer(customer);
    return {
      status: 200,
      statusText: 'OK (Offline)',
      headers: {},
      config,
      data: {
        success: true,
        matches,
        count: matches.length,
        isOfflineMode: true,
      },
    };
  }

  // 5. Properties list
  if (url.endsWith('/properties') || url.includes('/properties?')) {
    if (method === 'get') {
      const properties = getOfflineProperties();
      return {
        status: 200,
        statusText: 'OK (Offline)',
        headers: {},
        config,
        data: {
          success: true,
          count: properties.length,
          properties,
          isOfflineMode: true,
        },
      };
    }
    if (method === 'post') {
      let body = config.data;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }
      const newProp = saveOfflineProperty(body || {});
      const matches = matchOfflineProperty(newProp);
      return {
        status: 201,
        statusText: 'Created (Offline)',
        headers: {},
        config,
        data: {
          success: true,
          property: newProp,
          matches,
          matchCount: matches.length,
          isOfflineMode: true,
        },
      };
    }
  }

  // 6. Property Matches
  if (url.includes('/properties/') && url.includes('/matches')) {
    const properties = getOfflineProperties();
    const id = url.split('/properties/')[1].split('/')[0];
    const property = properties.find((p) => p._id === id) || properties[0] || {};
    const matches = matchOfflineProperty(property);
    return {
      status: 200,
      statusText: 'OK (Offline)',
      headers: {},
      config,
      data: {
        success: true,
        matches,
        count: matches.length,
        isOfflineMode: true,
      },
    };
  }

  // 7. Leads list
  if (url.includes('/leads')) {
    const leads = getOfflineLeads();
    return {
      status: 200,
      statusText: 'OK (Offline)',
      headers: {},
      config,
      data: {
        success: true,
        leads,
        count: leads.length,
        isOfflineMode: true,
      },
    };
  }

  // 8. Analytics & Dashboard
  if (url.includes('/analytics') || url.includes('/dashboard')) {
    const stats = getOfflineStats();
    return {
      status: 200,
      statusText: 'OK (Offline)',
      headers: {},
      config,
      data: {
        success: true,
        ...stats,
        isOfflineMode: true,
      },
    };
  }

  // 9. WhatsApp direct send
  if (url.includes('/whatsapp/send')) {
    let body = config.data;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }
    const phone = (body?.phone || '').replace(/\D/g, '');
    const message = body?.message || '';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    }
    return {
      status: 200,
      statusText: 'OK (Direct WhatsApp)',
      headers: {},
      config,
      data: {
        success: true,
        message: 'WhatsApp opened directly on your phone.',
        whatsappUrl,
        isOfflineMode: true,
      },
    };
  }

  return null;
}
