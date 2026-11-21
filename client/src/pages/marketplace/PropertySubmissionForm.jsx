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
  Maximize,
  Bed,
  Bath,
  CheckCircle2,
  Upload,
  ArrowRight,
  Shield,
  FileCheck,
  Phone,
  Mail,
  User,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const PropertySubmissionForm = () => {
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

  const [submitterType, setSubmitterType] = useState(savedUser?.userType || 'Owner');
  const [submissionType, setSubmissionType] = useState('Property for Sale');
  const [category, setCategory] = useState('Apartment');

  // Form State
  const [formData, setFormData] = useState({
    submitterName: savedUser?.name || '',
    submitterEmail: savedUser?.email || '',
    submitterPhone: savedUser?.phone || '',
    submitterWhatsApp: savedUser?.phone || '',
    organization: savedUser?.brokerProfile?.companyName || '',
    title: '',
    description: '',
    purpose: 'Sale',
    price: '',
    rentalPrice: '',
    builtUpArea: '',
    plotArea: '',
    areaUnit: 'sqft',
    bedrooms: 3,
    bathrooms: 3,
    furnishing: 'Semi-Furnished',
    street: '',
    locality: 'Golf Course Road',
    city: 'Gurugram',
    state: 'Haryana',
    postalCode: '122002',
    ownershipInfo: 'Freehold',
    availability: 'Ready to Move',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    amenities: ['24/7 Security', 'Power Backup', 'Car Parking']
  });

  const [loading, setLoading] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const availableAmenities = [
    '24/7 Security',
    'Power Backup',
    'Car Parking',
    'Clubhouse',
    'Swimming Pool',
    'Gymnasium',
    'Lift / Elevator',
    'Private Garden',
    'Golf Course View',
    'Near Metro Station'
  ];

  const handleToggleAmenity = (item) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(item);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== item) : [...prev.amenities, item]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.submitterName || !formData.submitterPhone || !formData.submitterEmail) {
      addToast('Please fill all required title and submitter contact fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('marketplace_token');
      const payload = {
        submitterType,
        submitterName: formData.submitterName,
        submitterEmail: formData.submitterEmail,
        submitterPhone: formData.submitterPhone,
        submitterWhatsApp: formData.submitterWhatsApp || formData.submitterPhone,
        organization: formData.organization,
        submissionCategory: 'Property',
        submissionType,
        title: formData.title,
        description: formData.description,
        propertyDetails: {
          category,
          propertyType: category,
          purpose: submissionType.includes('Rent') ? 'Rent' : 'Sale',
          price: Number(formData.price) || 0,
          rentalPrice: Number(formData.rentalPrice) || 0,
          builtUpArea: Number(formData.builtUpArea) || 0,
          plotArea: Number(formData.plotArea) || 0,
          areaUnit: formData.areaUnit,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          furnishing: formData.furnishing,
          address: {
            street: formData.street,
            locality: formData.locality,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: 'India'
          },
          amenities: formData.amenities,
          images: [formData.imageUrl].filter(Boolean),
          ownershipInfo: formData.ownershipInfo,
          availability: formData.availability
        }
      };

      const res = await api.post('/marketplace/submissions', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        setSubmittedResult(res.data.submission);
        addToast('Property listing submitted successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Submission failed. Please check details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center bg-white border-zinc-200 shadow-md space-y-4">
          <div className="w-14 h-14 bg-zinc-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Submission Received</span>
            <h2 className="text-2xl font-black text-zinc-950 mt-1">{submittedResult.title}</h2>
            <p className="font-mono text-sm font-bold text-zinc-800 mt-2 bg-zinc-100 py-1 px-3 rounded-lg border border-zinc-200 inline-block">
              Reference: {submittedResult.submissionId}
            </p>
          </div>

          {submittedResult.duplicateDetection?.isDuplicate && (
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-300 text-xs text-left text-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-950">
                <AlertTriangle className="w-4 h-4 text-zinc-900" />
                <span>Duplicate Check Flag</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                {submittedResult.duplicateDetection.flaggedReason}
              </p>
            </div>
          )}

          <p className="text-xs text-zinc-500 leading-relaxed">
            Our brokerage verification desk has been notified. A confirmation message was dispatched to your WhatsApp number ({submittedResult.submitterPhone}).
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to={`/marketplace/track/${submittedResult.submissionId}`}>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Track Live Status
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setSubmittedResult(null);
                setFormData(prev => ({ ...prev, title: '', price: '', description: '' }));
              }}
              className="w-full sm:w-auto"
            >
              Submit Another Property
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
                Portal Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Real Estate Submission Engine</span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            Submit Property Listing
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Submit your listing for automated CRM duplicate verification, approval, and live buyer opportunity matching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Submitter Role & Identity */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-sm text-zinc-950">1. Submitter Identity</h3>
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setSubmitterType('Owner')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    submitterType === 'Owner' ? 'bg-zinc-950 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Direct Property Owner
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitterType('Broker')}
                  className={`px-3 py-1 rounded-md font-semibold transition ${
                    submitterType === 'Broker' ? 'bg-zinc-950 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Real Estate Broker / Agent
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.submitterName}
                    onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="e.g. Rajesh Singhania"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">WhatsApp Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.submitterPhone}
                    onChange={(e) => setFormData({ ...formData, submitterPhone: e.target.value, submitterWhatsApp: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.submitterEmail}
                    onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  {submitterType === 'Broker' ? 'Brokerage / Agency Name *' : 'Organization (Optional)'}
                </label>
                <input
                  type="text"
                  required={submitterType === 'Broker'}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder={submitterType === 'Broker' ? 'e.g. Prime Acre Realty' : 'Individual'}
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Property Category & Pricing */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              2. Listing Category & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Submission Type *</label>
                <select
                  value={submissionType}
                  onChange={(e) => {
                    setSubmissionType(e.target.value);
                    if (e.target.value.includes('Commercial')) setCategory('Commercial');
                    if (e.target.value.includes('Land')) setCategory('Land');
                  }}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none bg-white font-medium"
                >
                  <option value="Property for Sale">Property for Sale</option>
                  <option value="Property for Rent">Property for Rent</option>
                  <option value="Land and Plot Listings">Land and Plot Listings</option>
                  <option value="Commercial Properties">Commercial Properties</option>
                  <option value="Residential Properties">Residential Properties</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Type / Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none bg-white font-medium"
                >
                  <option value="Apartment">Apartment / Condominium</option>
                  <option value="Penthouse">Ultra Luxury Penthouse</option>
                  <option value="Villa">Independent Luxury Villa</option>
                  <option value="Commercial">Commercial Office Space</option>
                  <option value="Land">Residential / Commercial Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  {submissionType.includes('Rent') ? 'Monthly Rent Expected (INR) *' : 'Total Expected Selling Price (INR) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-zinc-500">₹</span>
                  <input
                    type="number"
                    required
                    value={submissionType.includes('Rent') ? formData.rentalPrice : formData.price}
                    onChange={(e) => {
                      if (submissionType.includes('Rent')) setFormData({ ...formData, rentalPrice: e.target.value });
                      else setFormData({ ...formData, price: e.target.value });
                    }}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-semibold text-zinc-950"
                    placeholder="e.g. 18500000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Built-Up Area</label>
                  <input
                    type="number"
                    value={formData.builtUpArea}
                    onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                    className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="e.g. 2400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">Unit</label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                    className="w-full p-2 text-xs border border-zinc-300 rounded-lg bg-white"
                  >
                    <option value="sqft">sq.ft</option>
                    <option value="sqyd">sq.yd</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>

              {category !== 'Commercial' && category !== 'Land' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1">Bedrooms (BHK)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Section 3: Property Details & Location */}
          <Card className="p-6 bg-white border-zinc-200 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950 border-b border-zinc-100 pb-3">
              3. Property Title, Location & Media
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Name / Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-medium"
                placeholder="e.g. DLF Phase 5 Ultra Luxury 4 BHK Corner Residence"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Locality / Sector *</label>
                <input
                  type="text"
                  required
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="e.g. Golf Course Road"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="Gurugram"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="Haryana"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Description & Highlights</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                placeholder="Mention facing, floor level, key upgrades, parking bays, possession status..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Image URL (or upload preview)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            {/* Amenities Chips */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-1.5">
                {availableAmenities.map((item) => {
                  const selected = formData.amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleAmenity(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        selected
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Submit Action */}
          <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">Zero Listing Fees • Immediate WhatsApp Confirmation</p>
              <p className="text-[11px] text-zinc-500">Your listing will be verified by our team and published directly into the CRM.</p>
            </div>
            <Button type="submit" size="md" isLoading={loading} className="px-6">
              Submit Property Listing <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
