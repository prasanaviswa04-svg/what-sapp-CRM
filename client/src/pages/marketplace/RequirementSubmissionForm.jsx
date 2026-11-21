import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  MapPin,
  DollarSign,
  Bed,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileCheck,
  Phone,
  Mail,
  User,
  Sparkles,
  AlertTriangle,
  Clock,
  Briefcase,
  Compass
} from 'lucide-react';

const COMMON_LOCALITIES = [
  'Golf Course Road',
  'DLF Phase 5',
  'Sohna Road',
  'Cyber City',
  'Golf Course Extension',
  'Bandra West',
  'BKC Mumbai',
  'Worli',
  'Whitefield Bangalore',
  'Indiranagar'
];

const AMENITY_TAGS = [
  'Gated Society',
  'Clubhouse',
  'Swimming Pool',
  'Gymnasium',
  '2+ Car Parkings',
  'Power Backup',
  'High Rise / Top Floor',
  'Corner Property',
  'Park Facing',
  'Vastu Compliant',
  'Near Metro Station'
];

export const RequirementSubmissionForm = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const savedUser = (() => {
    try {
      const u = localStorage.getItem('marketplace_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const [submitterType, setSubmitterType] = useState(savedUser?.userType || 'Broker');
  const [submissionType, setSubmissionType] = useState('Buyer Requirements');
  const [selectedLocations, setSelectedLocations] = useState(['Golf Course Road']);
  const [customLocalityInput, setCustomLocalityInput] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState(['Gated Society', 'Power Backup']);

  const [formData, setFormData] = useState({
    submitterName: savedUser?.name || '',
    submitterEmail: savedUser?.email || '',
    submitterPhone: savedUser?.phone || '',
    submitterWhatsApp: savedUser?.phone || '',
    organization: savedUser?.brokerProfile?.companyName || '',
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    customerType: 'Buyer',
    propertyCategory: 'Residential',
    propertyType: 'Apartment',
    budgetMin: '15000000',
    budgetMax: '30000000',
    preferredBedrooms: [3],
    possessionTimeline: 'Immediate',
    financingRequired: false,
    city: 'Gurugram',
    state: 'Haryana',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const handleToggleLocation = (loc) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(l => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const handleAddCustomLocality = () => {
    if (customLocalityInput.trim() && !selectedLocations.includes(customLocalityInput.trim())) {
      setSelectedLocations([...selectedLocations, customLocalityInput.trim()]);
      setCustomLocalityInput('');
    }
  };

  const handleToggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleBedroomToggle = (beds) => {
    const current = formData.preferredBedrooms;
    if (current.includes(beds)) {
      setFormData(prev => ({
        ...prev,
        preferredBedrooms: current.filter(b => b !== beds)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        preferredBedrooms: [...current, beds].sort()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.submitterName || !formData.submitterPhone) {
      addToast('Submitter name and phone are required', 'error');
      return;
    }

    if (!formData.title.trim()) {
      addToast('Please enter a requirement headline / title', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        submissionCategory: 'Requirement',
        submissionType,
        source: submitterType === 'Broker' ? 'Real Estate Broker' : 'Direct Property Owner',
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        submitterPhone: formData.submitterPhone,
        submitterWhatsApp: formData.submitterWhatsApp || formData.submitterPhone,
        organization: formData.organization,
        title: formData.title,
        description: formData.notes,
        requirementDetails: {
          clientName: formData.clientName || formData.submitterName,
          clientPhone: formData.clientPhone || formData.submitterPhone,
          clientEmail: formData.clientEmail || formData.submitterEmail,
          customerType: formData.customerType,
          budgetMin: Number(formData.budgetMin) || 0,
          budgetMax: Number(formData.budgetMax) || 0,
          preferredLocations: selectedLocations,
          propertyCategories: [formData.propertyCategory],
          preferredBedrooms: formData.preferredBedrooms,
          possessionTimeline: formData.possessionTimeline,
          financingRequired: Boolean(formData.financingRequired),
          notes: `${formData.notes} | Preferred Amenities: ${selectedAmenities.join(', ')}`
        }
      };

      const res = await api.post('/marketplace/submissions', payload);
      setSubmittedResult(res.data.submission);
      addToast(`Requirement submitted successfully: ${res.data.submission.submissionId}`, 'success');
    } catch (err) {
      console.error('Requirement submission error:', err);
      addToast(err.response?.data?.message || 'Failed to submit requirement', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full p-8 text-center space-y-6 bg-white border-zinc-200 shadow-xl">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Requirement Successfully Registered
            </span>
            <h1 className="text-2xl font-black text-zinc-950 mt-3 tracking-tight">
              {submittedResult.title}
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Your requirement has been captured in our centralized marketplace registry.
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Tracking Reference:</span>
              <span className="font-mono font-bold text-zinc-950 text-sm">
                {submittedResult.submissionId}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Initial Status:</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {submittedResult.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Target Budget:</span>
              <span className="font-bold text-zinc-950">
                ₹{(submittedResult.requirementDetails?.budgetMin / 10000000).toFixed(2)} Cr - ₹{(submittedResult.requirementDetails?.budgetMax / 10000000).toFixed(2)} Cr
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500 font-medium">Locations:</span>
              <span className="font-medium text-zinc-800">
                {submittedResult.requirementDetails?.preferredLocations?.join(', ') || 'Any'}
              </span>
            </div>
          </div>

          {submittedResult.duplicateDetection?.isDuplicate && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left flex items-start gap-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Verification Flag</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {submittedResult.duplicateDetection.flaggedReason} (Flagged for internal team inspection).
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-left text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Automated Lead Pipeline & WhatsApp Dispatch</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                An automated acknowledgment message has been dispatched to {submittedResult.submitterWhatsApp || submittedResult.submitterPhone}. Once approved by our team, this requirement will automatically convert into a qualified CRM Customer & Lead record.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to={`/marketplace/track/${submittedResult.submissionId}`} className="flex-1">
              <Button className="w-full bg-zinc-950 text-white hover:bg-zinc-800">
                Track Live Progress
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedResult(null);
                setFormData(prev => ({ ...prev, title: '', notes: '' }));
              }}
              className="w-full sm:w-auto"
            >
              Submit Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/marketplace" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-950">
              EstateFlow Marketplace
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/marketplace/track">
              <Button size="sm" variant="ghost" className="text-xs">
                Track Status
              </Button>
            </Link>
            <Link to="/marketplace/login">
              <Button size="sm" variant="outline" className="text-xs">
                Partner Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Requirement Engine</span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            Submit Customer & Buyer Requirement
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Brokers, agents, and buyers can post specific property requirements. Verified submissions are instantly matched with CRM inventory and inventory sellers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Submitter Role & Identity */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950">1. Submitter Details</h3>
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSubmitterType('Broker')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    submitterType === 'Broker' ? 'bg-white shadow-sm text-zinc-950' : 'text-zinc-500'
                  }`}
                >
                  Broker / Partner
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitterType('Owner')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    submitterType === 'Owner' ? 'bg-white shadow-sm text-zinc-950' : 'text-zinc-500'
                  }`}
                >
                  Direct Buyer / Investor
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.submitterName}
                  onChange={e => setFormData({ ...formData, submitterName: e.target.value })}
                  placeholder="e.g. Karan Singhania"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Firm / Agency Name (Optional)</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Prime Acre Realty Pvt Ltd"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.submitterPhone}
                  onChange={e => setFormData({ ...formData, submitterPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.submitterWhatsApp}
                  onChange={e => setFormData({ ...formData, submitterWhatsApp: e.target.value })}
                  placeholder="+91 98765 43210 (For automated match notifications)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.submitterEmail}
                  onChange={e => setFormData({ ...formData, submitterEmail: e.target.value })}
                  placeholder="broker@domain.com"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Requirement Classification */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              2. Requirement Classification & Headline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                'Buyer Requirements',
                'Rental Requirements',
                'Investment Requirements',
                'Seller Requirements'
              ].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSubmissionType(type)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    submissionType === type
                      ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium'
                  }`}
                >
                  <p className="text-xs">{type}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Requirement Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Urgent requirement for 3 BHK Luxury Apartment in Golf Course Road with 2 Car Parkings"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Target Client Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Mr. Alok Verma"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Client Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Customer Type</label>
                  <select
                    value={formData.customerType}
                    onChange={e => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                  >
                    <option value="Buyer">End-User Buyer</option>
                    <option value="Investor">High Net-Worth Investor</option>
                    <option value="Tenant">Corporate / Retail Tenant</option>
                    <option value="Commercial Client">Commercial Client</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Property Type, Budget & Locations */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              3. Target Specifications & Budget Range
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Property Category</label>
                <select
                  value={formData.propertyCategory}
                  onChange={e => setFormData({ ...formData, propertyCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land / Plot">Land / Plot</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Property Sub-Type</label>
                <select
                  value={formData.propertyType}
                  onChange={e => setFormData({ ...formData, propertyType: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                >
                  <option value="Apartment">Apartment / Flat</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Villa">Villa / Independent House</option>
                  <option value="Office Space">Grade-A Office Space</option>
                  <option value="Retail Shop">Retail Shop / Showroom</option>
                  <option value="Plot">Residential Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Min Budget (₹ INR)</label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                  placeholder="15000000"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  ≈ ₹{(Number(formData.budgetMin || 0) / 10000000).toFixed(2)} Cr
                </span>
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Max Budget (₹ INR)</label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                  placeholder="30000000"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  ≈ ₹{(Number(formData.budgetMax || 0) / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Bedrooms selection */}
            {formData.propertyCategory === 'Residential' && (
              <div className="pt-2 text-xs">
                <label className="block text-zinc-700 font-semibold mb-1.5">Preferred Bedrooms (BHK)</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBedroomToggle(b)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        formData.preferredBedrooms.includes(b)
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {b} BHK
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Target Locations */}
            <div className="pt-2 text-xs">
              <label className="block text-zinc-700 font-semibold mb-1.5">Preferred Localities</label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {COMMON_LOCALITIES.map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleToggleLocation(loc)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      selectedLocations.includes(loc)
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLocalityInput}
                  onChange={e => setCustomLocalityInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomLocality();
                    }
                  }}
                  placeholder="Type another locality and press Add (e.g. Cyber Hub, Sector 54)..."
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomLocality}
                  className="text-xs"
                >
                  + Add Locality
                </Button>
              </div>

              {selectedLocations.length > 0 && (
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Selected: <span className="font-semibold text-zinc-800">{selectedLocations.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Timeline & Financing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Possession Timeline</label>
                <select
                  value={formData.possessionTimeline}
                  onChange={e => setFormData({ ...formData, possessionTimeline: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
                >
                  <option value="Immediate">Immediate / Ready to Move</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="1 to 3 Months">1 to 3 Months</option>
                  <option value="Under Construction">Under Construction / Flexible</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="financingCheck"
                  checked={formData.financingRequired}
                  onChange={e => setFormData({ ...formData, financingRequired: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                />
                <label htmlFor="financingCheck" className="text-zinc-700 font-medium cursor-pointer">
                  Client requires Home Loan / Commercial Financing assistance
                </label>
              </div>
            </div>
          </Card>

          {/* Section 4: Specific Features & Notes */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              4. Desired Amenities & Detailed Client Notes
            </h3>

            <div className="text-xs">
              <label className="block text-zinc-700 font-semibold mb-2">Important Amenities</label>
              <div className="flex flex-wrap gap-1.5">
                {AMENITY_TAGS.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs pt-2">
              <label className="block text-zinc-700 font-semibold mb-1">
                Detailed Requirement Notes & Special Requests
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Include specific floor preference, park facing requirement, vastu directions, specific society names, or deal closing timeframe..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none resize-none"
              />
            </div>
          </Card>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-zinc-200">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Automated WhatsApp acknowledgment & CRM lead pipeline sync enabled.</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link to="/marketplace" className="w-full sm:w-auto">
                <Button variant="outline" type="button" className="w-full text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white text-xs px-6 font-bold"
              >
                {loading ? 'Registering Requirement...' : 'Submit Requirement →'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};
