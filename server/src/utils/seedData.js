const mongoose = require('mongoose');
const Property = require('../models/Property');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const FollowUp = require('../models/FollowUp');
const Campaign = require('../models/Campaign');
const Task = require('../models/Task');
const KnowledgeBase = require('../models/KnowledgeBase');
const ActivityLog = require('../models/ActivityLog');

async function seedFullRealEstateData(companyId, brokerId) {
  // Clear existing company demo records
  await Promise.all([
    Property.deleteMany({ companyId }),
    Customer.deleteMany({ companyId }),
    Lead.deleteMany({ companyId }),
    Conversation.deleteMany({ companyId }),
    Message.deleteMany({ companyId }),
    Appointment.deleteMany({ companyId }),
    Booking.deleteMany({ companyId }),
    Payment.deleteMany({ companyId }),
    FollowUp.deleteMany({ companyId }),
    Campaign.deleteMany({ companyId }),
    Task.deleteMany({ companyId }),
    KnowledgeBase.deleteMany({ companyId })
  ]);

  // 1. Seed Properties
  const propertiesData = [
    {
      companyId,
      propertyCode: 'EF-APT-101',
      title: 'DLF The Camellias - Ultra Luxury Penthouse',
      description: 'Exclusive 4 BHK super-luxury residence facing the lush Aravalli range and the Arnold Palmer Golf Course. Private elevator, Italian marble flooring, and concierge service.',
      category: 'Apartment',
      purpose: 'Sale',
      address: { street: 'Golf Drive', locality: 'Golf Course Road', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122002' },
      builtUpArea: 7300,
      unit: 'sqft',
      totalPrice: 185000000, // 18.5 Cr
      pricePerUnit: 25342,
      bedrooms: 4,
      bathrooms: 5,
      parkingSpaces: 4,
      amenities: ['Private Elevator', 'Golf Course View', 'Infinity Pool', 'Spa & Sauna', 'Concierge Service', 'Smart Home Automation'],
      status: 'Available',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      companyId,
      propertyCode: 'EF-VIL-202',
      title: 'Aravalli Greens Luxury Eco Villa',
      description: 'Lavish 5 BHK sprawling villa set on 1.2 acres with private heated pool, landscaped gazebo, tennis court, and organic kitchen garden.',
      category: 'Villa',
      purpose: 'Sale',
      address: { street: 'Damdama Lake Road', locality: 'Sohna Road', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122102' },
      builtUpArea: 6500,
      plotSize: 1200,
      unit: 'sqyd',
      totalPrice: 120000000, // 12 Cr
      pricePerUnit: 18461,
      bedrooms: 5,
      bathrooms: 6,
      parkingSpaces: 5,
      amenities: ['Private Heated Pool', 'Tennis Court', '1.2 Acre Lawn', 'Solar Powered', 'Gazebo', 'Servant Quarters'],
      status: 'Available',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      companyId,
      propertyCode: 'EF-APT-303',
      title: 'Trump Towers - Iconic High Rise Suite',
      description: 'Signature 3 BHK tower residence with double-height ceiling, floor-to-ceiling glass facade, and floor lounge access in Sector 65.',
      category: 'Apartment',
      purpose: 'Sale',
      address: { street: 'Golf Course Extension', locality: 'Sector 65', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122018' },
      builtUpArea: 3500,
      unit: 'sqft',
      totalPrice: 75000000, // 7.5 Cr
      pricePerUnit: 21428,
      bedrooms: 3,
      bathrooms: 4,
      parkingSpaces: 2,
      amenities: ['Helipad Access', 'Valet Parking', 'Indoor Heated Pool', 'Private Dining Room', 'Cigar Lounge'],
      status: 'Available',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      companyId,
      propertyCode: 'EF-APT-404',
      title: 'Godrej Palm Retreat - Resort Residences',
      description: 'Contemporary 3 BHK overlooking tropical water bodies, floating cabanas, and sunken seating. Prime location near metro corridor.',
      category: 'Apartment',
      purpose: 'Sale',
      address: { street: 'Expressway Sector 150', locality: 'Sector 150', city: 'Noida', state: 'Uttar Pradesh', country: 'India', postalCode: '201310' },
      builtUpArea: 1950,
      unit: 'sqft',
      totalPrice: 21000000, // 2.1 Cr
      pricePerUnit: 10769,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpaces: 2,
      amenities: ['Resort Style Water Body', 'Badminton Court', 'Clubhouse', 'Children Play Area', 'Gymnasium'],
      status: 'Available',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      companyId,
      propertyCode: 'EF-APT-505',
      title: 'Experion The Heartsong - Modern Garden Flat',
      description: 'Charming 3 BHK with 2 open balconies facing 80% lush green landscape and jogging track along Dwarka Expressway.',
      category: 'Apartment',
      purpose: 'Sale',
      address: { street: 'Sector 108', locality: 'Dwarka Expressway', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122017' },
      builtUpArea: 1780,
      unit: 'sqft',
      totalPrice: 17500000, // 1.75 Cr
      pricePerUnit: 9831,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 1,
      amenities: ['80% Green Open Area', '24/7 Security', 'Power Backup', 'Amphitheatre', 'Meditation Lawn'],
      status: 'Reserved',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      companyId,
      propertyCode: 'EF-COM-606',
      title: 'Cyber Park Signature Grade-A Office',
      description: 'Fully furnished 2,400 sq.ft IT/Corporate office space with 40 workstations, 2 director cabins, conference room, and cafeteria access.',
      category: 'Commercial',
      purpose: 'Sale',
      address: { street: 'DLF Cyber City', locality: 'DLF Phase 2', city: 'Gurugram', state: 'Haryana', country: 'India', postalCode: '122008' },
      builtUpArea: 2400,
      unit: 'sqft',
      totalPrice: 42000000, // 4.2 Cr
      pricePerUnit: 17500,
      bedrooms: 0,
      bathrooms: 2,
      parkingSpaces: 3,
      amenities: ['100% Power Backup', 'Central AC', 'High Speed Elevators', 'Multi-tier Security', 'Metro Station 200m'],
      status: 'Available',
      assignedBrokerId: brokerId,
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ];

  const createdProperties = await Property.create(propertiesData);

  // 2. Seed Customers
  const customersData = [
    {
      companyId,
      fullName: 'Vikramaditya Oberoi',
      phone: '+919811023456',
      email: 'vikram.oberoi@techventures.in',
      currentLocation: 'New Delhi',
      preferredLocation: 'Golf Course Road',
      customerType: 'Buyer',
      requirements: {
        propertyCategory: 'Apartment',
        purpose: 'Buy',
        minBudget: 150000000,
        maxBudget: 220000000,
        bedrooms: 4,
        preferredAmenities: ['Golf Course View', 'Concierge Service'],
        purchaseTimeline: 'Immediate (0-1 month)'
      },
      source: 'WhatsApp',
      leadStatus: 'Interested',
      priority: 'Urgent',
      tags: ['Ultra Luxury', 'VIP Investor'],
      totalInteractions: 8,
      assignedBrokerId: brokerId
    },
    {
      companyId,
      fullName: 'Ananya Deshmukh',
      phone: '+919820054321',
      email: 'ananya.d@deshmukhholdings.com',
      currentLocation: 'Mumbai',
      preferredLocation: 'Sector 65',
      customerType: 'Buyer',
      requirements: {
        propertyCategory: 'Apartment',
        purpose: 'Buy',
        minBudget: 60000000,
        maxBudget: 85000000,
        bedrooms: 3,
        preferredAmenities: ['Valet Parking', 'Indoor Heated Pool'],
        purchaseTimeline: 'Near term (1-3 months)'
      },
      source: 'WhatsApp',
      leadStatus: 'Site Visit Scheduled',
      priority: 'High',
      tags: ['Trump Towers Prospect', 'Pre-approved Loan'],
      totalInteractions: 5,
      assignedBrokerId: brokerId
    },
    {
      companyId,
      fullName: 'Dr. Siddharth Rao',
      phone: '+919845012345',
      email: 'siddharth.rao@cardiohealth.org',
      currentLocation: 'Bengaluru',
      preferredLocation: 'Sohna Road',
      customerType: 'Buyer',
      requirements: {
        propertyCategory: 'Villa',
        purpose: 'Buy',
        minBudget: 90000000,
        maxBudget: 130000000,
        bedrooms: 5,
        preferredAmenities: ['Private Heated Pool', 'Solar Powered'],
        purchaseTimeline: 'Near term (1-3 months)'
      },
      source: 'Website Form',
      leadStatus: 'Booked',
      priority: 'High',
      tags: ['Doctor', 'Eco Villa Seeker'],
      totalInteractions: 12,
      assignedBrokerId: brokerId
    },
    {
      companyId,
      fullName: 'Pooja Agarwal',
      phone: '+919930098765',
      email: 'pooja.agarwal@finadvisors.in',
      currentLocation: 'Gurugram',
      preferredLocation: 'Sector 150',
      customerType: 'Buyer',
      requirements: {
        propertyCategory: 'Apartment',
        purpose: 'Buy',
        minBudget: 18000000,
        maxBudget: 24000000,
        bedrooms: 3,
        preferredAmenities: ['Clubhouse', 'Children Play Area'],
        purchaseTimeline: 'Near term (1-3 months)'
      },
      source: 'WhatsApp',
      leadStatus: 'New',
      priority: 'Medium',
      tags: ['First Time Buyer'],
      totalInteractions: 2,
      assignedBrokerId: brokerId
    },
    {
      companyId,
      fullName: 'Sameer Mehra',
      phone: '+919871133557',
      email: 'sameer.mehra@globaltech.com',
      currentLocation: 'Gurugram',
      preferredLocation: 'Dwarka Expressway',
      customerType: 'Buyer',
      requirements: {
        propertyCategory: 'Apartment',
        purpose: 'Buy',
        minBudget: 15000000,
        maxBudget: 20000000,
        bedrooms: 3,
        preferredAmenities: ['Power Backup', '24/7 Security'],
        purchaseTimeline: 'Immediate (0-1 month)'
      },
      source: 'WhatsApp',
      leadStatus: 'Site Visit Scheduled',
      priority: 'High',
      tags: ['Experion Seeker'],
      totalInteractions: 6,
      assignedBrokerId: brokerId
    }
  ];

  const createdCustomers = await Customer.create(customersData);

  // 3. Seed Leads for the CRM Pipeline
  const stages = [
    'Negotiation',
    'Site Visit Scheduled',
    'Booking Confirmed',
    'New Enquiry',
    'Qualified'
  ];

  for (let i = 0; i < createdCustomers.length; i++) {
    const cust = createdCustomers[i];
    await Lead.create({
      companyId,
      customerId: cust._id,
      title: `${cust.requirements.bedrooms} BHK ${cust.requirements.propertyCategory} in ${cust.preferredLocation}`,
      source: cust.source,
      interestedPropertyId: createdProperties[i % createdProperties.length]._id,
      assignedBrokerId: brokerId,
      stage: stages[i % stages.length],
      score: 85 - i * 8,
      scoreClassification: i === 0 || i === 2 ? 'High Intent' : i === 1 || i === 4 ? 'Hot' : 'Warm',
      scoreFactors: ['Budget clearly verified', 'Location match with verified inventory', 'Timely WhatsApp responses'],
      priority: cust.priority,
      budget: {
        min: cust.requirements.minBudget,
        max: cust.requirements.maxBudget
      },
      preferredLocation: cust.preferredLocation
    });
  }

  // 4. Seed WhatsApp Conversations & Messages
  // Conversation 1: Vikramaditya Oberoi
  const conv1 = await Conversation.create({
    companyId,
    customerId: createdCustomers[0]._id,
    whatsappPhoneNumber: createdCustomers[0].phone,
    channel: 'WhatsApp',
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 35),
    lastMessagePreview: 'Yes, Saturday 11 AM works perfectly for the site visit.',
    assignedBrokerId: brokerId,
    status: 'Open',
    humanTakeover: false,
    priority: 'Urgent'
  });

  await Message.create([
    {
      companyId,
      conversationId: conv1._id,
      customerId: createdCustomers[0]._id,
      senderType: 'customer',
      senderName: 'Vikramaditya Oberoi',
      content: 'Hi, I am interested in viewing DLF The Camellias 4 BHK penthouses on Golf Course Road. My budget is around 18-20 Cr.',
      whatsappMessageId: `wamid_${Date.now() - 3600000}`,
      status: 'read'
    },
    {
      companyId,
      conversationId: conv1._id,
      customerId: createdCustomers[0]._id,
      senderType: 'ai',
      senderName: 'EstateFlow AI',
      content: 'Hello Mr. Oberoi! 🏡 We have verified inventory at *DLF The Camellias* (EF-APT-101) with panoramic views of the Aravallis and the Arnold Palmer Golf Course. Price is ₹18.50 Cr for 7,300 sq.ft with private elevator and concierge.\n\nWould you like me to schedule a private walkthrough this weekend?',
      isGrounded: true,
      groundedPropertyId: createdProperties[0]._id,
      whatsappMessageId: `wamid_${Date.now() - 3500000}`,
      status: 'read'
    },
    {
      companyId,
      conversationId: conv1._id,
      customerId: createdCustomers[0]._id,
      senderType: 'customer',
      senderName: 'Vikramaditya Oberoi',
      content: 'Yes, Saturday 11 AM works perfectly for the site visit.',
      whatsappMessageId: `wamid_${Date.now() - 2100000}`,
      status: 'delivered'
    }
  ]);

  // Conversation 2: Ananya Deshmukh
  const conv2 = await Conversation.create({
    companyId,
    customerId: createdCustomers[1]._id,
    whatsappPhoneNumber: createdCustomers[1].phone,
    channel: 'WhatsApp',
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15),
    lastMessagePreview: 'Could you share the payment schedule and floor plans for Trump Towers?',
    assignedBrokerId: brokerId,
    status: 'Open',
    humanTakeover: true,
    priority: 'High'
  });

  await Message.create([
    {
      companyId,
      conversationId: conv2._id,
      customerId: createdCustomers[1]._id,
      senderType: 'customer',
      senderName: 'Ananya Deshmukh',
      content: 'Could you share the payment schedule and floor plans for Trump Towers?',
      whatsappMessageId: `wamid_${Date.now() - 900000}`,
      status: 'delivered'
    }
  ]);

  // 5. Seed Site Visit (Appointment)
  await Appointment.create({
    companyId,
    customerId: createdCustomers[0]._id,
    propertyId: createdProperties[0]._id,
    assignedBrokerId: brokerId,
    visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    visitTime: '11:00 AM',
    meetingLocation: 'The Camellias Clubhouse Lobby, Golf Course Road',
    status: 'Confirmed',
    notes: 'VIP walkthrough requested. Please coordinate with security gate for guest pass.'
  });

  // 6. Seed Confirmed Booking & Payment
  const booking1 = await Booking.create({
    companyId,
    bookingCode: 'BK-789012',
    customerId: createdCustomers[2]._id, // Dr. Siddharth Rao
    propertyId: createdProperties[1]._id, // Eco Villa
    assignedBrokerId: brokerId,
    agreedPrice: 120000000, // 12 Cr
    advanceAmount: 15000000, // 1.5 Cr
    paymentStatus: 'Partially Paid',
    bookingStatus: 'Confirmed',
    confirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  });

  await Payment.create({
    companyId,
    bookingId: booking1._id,
    customerId: createdCustomers[2]._id,
    propertyId: createdProperties[1]._id,
    transactionId: 'TXN-HDFC-99881122',
    invoiceNumber: 'INV-2026-001',
    totalAmount: 120000000,
    amountPaid: 15000000,
    remainingBalance: 105000000,
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  });

  // 7. Seed Follow-Up Workflows
  await FollowUp.create([
    {
      companyId,
      name: 'Immediate WhatsApp Welcome & Discovery',
      description: 'Sends polite welcome message and queries budget and preferred locality when a customer sends an enquiry.',
      triggerEvent: 'new_enquiry',
      targetSegment: 'All Customers',
      delayMinutes: 2,
      whatsappTemplate: 'welcome_real_estate_discovery',
      messageBody: 'Hello {{customer_name}}! 🏡 Welcome to EstateFlow Realty. We received your enquiry for {{property_title}}. How soon are you planning to make your purchase?',
      isActive: true,
      executionCount: 24,
      successCount: 24
    },
    {
      companyId,
      name: '24-Hour Site Visit Reminder',
      description: 'Automatically sends friendly WhatsApp reminder with location coordinates 24 hours prior to scheduled visit.',
      triggerEvent: 'visit_scheduled',
      targetSegment: 'All Customers',
      delayMinutes: 1440,
      whatsappTemplate: 'site_visit_reminder_vip',
      messageBody: 'Dear {{customer_name}}, looking forward to meeting you tomorrow for your private site walkthrough at {{visit_time}}. Google Maps location: https://maps.google.com/?q=28.4595,77.0266',
      isActive: true,
      executionCount: 8,
      successCount: 8
    },
    {
      companyId,
      name: 'Post-Visit Feedback & Next Steps',
      description: 'Requests customer impressions and offers detailed financing plan 3 hours after visit completion.',
      triggerEvent: 'visit_completed',
      targetSegment: 'All Customers',
      delayMinutes: 180,
      whatsappTemplate: 'post_visit_followup',
      messageBody: 'Hello {{customer_name}}! Thank you for visiting us today. What were your thoughts on the property layout? Let us know if you would like the bank pre-approval checklist!',
      isActive: true,
      executionCount: 6,
      successCount: 6
    }
  ]);

  // 8. Seed WhatsApp Broadcast Campaign
  await Campaign.create({
    companyId,
    title: 'The Camellias Exclusive Penthouse Preview',
    description: 'Broadcast to VIP investors with budget above ₹15 Cr.',
    targetAudience: 'Luxury Seekers (> ₹2 Cr)',
    templateName: 'exclusive_penthouse_showcase',
    messageContent: '✨ Exclusive Invitation: Private preview of the latest 4 BHK penthouse at DLF The Camellias with Arnold Palmer Golf Course views. Reply "PREVIEW" for your private VIP invitation.',
    status: 'Completed',
    stats: {
      totalRecipients: 48,
      sentCount: 48,
      deliveredCount: 47,
      readCount: 39,
      repliesCount: 14,
      failedCount: 0,
      optOutCount: 0
    },
    createdBy: brokerId
  });

  // 9. Seed Tasks
  await Task.create([
    {
      companyId,
      title: 'Send Bank Loan Approval Documents to Vikramaditya Oberoi',
      description: 'Prepare HDFC & ICICI home loan comparison sheet for ₹18.5 Cr property.',
      assignedTo: brokerId,
      customerId: createdCustomers[0]._id,
      priority: 'High',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'Pending'
    },
    {
      companyId,
      title: 'Coordinate Security Gate Pass for Saturday Walkthrough',
      description: 'Inform facility manager at DLF The Camellias regarding guest car DL 01 AB 1234.',
      assignedTo: brokerId,
      propertyId: createdProperties[0]._id,
      priority: 'Urgent',
      dueDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
      status: 'Pending'
    }
  ]);

  // 10. Seed Knowledge Base
  await KnowledgeBase.create([
    {
      companyId,
      title: 'Booking & Payment Milestone Policy',
      category: 'Booking Process',
      content: 'Standard booking advance is 10% of total agreed property value. The remaining 90% is divided into construction-linked milestones or paid within 45 days for ready-to-move properties.',
      tags: ['Booking', 'Payment', 'Policy']
    },
    {
      companyId,
      title: 'Site Visit Guidelines & Timings',
      category: 'Site Visit Guidelines',
      content: 'Site visits are conducted Monday through Sunday between 10:00 AM and 6:30 PM. Complimentary chauffeur pick-up is available for VIP buyers upon 24-hour advance booking.',
      tags: ['Visits', 'Guidelines', 'Timings']
    },
    {
      companyId,
      title: 'RERA Compliance & Title Verification',
      category: 'Legal & Documentation',
      content: 'All properties listed on EstateFlow are 100% RERA verified with clear, marketable freehold title deeds. Our legal advisory team assists buyers with stamp duty registration.',
      tags: ['RERA', 'Legal', 'Title']
    }
  ]);

  return {
    propertiesCount: createdProperties.length,
    customersCount: createdCustomers.length,
    leadsCount: createdCustomers.length,
    conversationsCount: 2
  };
}

module.exports = { seedFullRealEstateData };
