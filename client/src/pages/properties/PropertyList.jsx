import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { handleImageError, getPropertyFallbackImage } from '../../utils/propertyImages';
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Bed,
  Bath,
  ChevronLeft,
  ChevronRight,
  Users,
  Share2,
  Sparkles,
  Send,
  ExternalLink
} from 'lucide-react';

export const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [matchingBuyersModal, setMatchingBuyersModal] = useState(null);
  const [broadcasting, setBroadcasting] = useState(false);

  // Add Property Form State
  const [formData, setFormData] = useState({
    title: '',
    propertyCode: '',
    description: '',
    category: 'Apartment',
    purpose: 'Sale',
    locality: 'Golf Course Road',
    city: 'Gurugram',
    state: 'Haryana',
    builtUpArea: 2400,
    unit: 'sqft',
    totalPrice: 28500000,
    bedrooms: 3,
    bathrooms: 3,
    parkingSpaces: 2,
    amenities: ['Gated Community', 'Swimming Pool', 'Clubhouse', '24/7 Security'],
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200'
  });

  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
    }
  }, [searchParams]);

  const categories = ['All', 'Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'Rental'];

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties', {
        params: {
          page,
          search,
          category: categoryFilter,
          status: statusFilter,
          limit: 12
        }
      });
      if (res.data.success) {
        setProperties(res.data.properties);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, categoryFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        propertyCode: formData.propertyCode,
        description: formData.description,
        category: formData.category,
        purpose: formData.purpose,
        builtUpArea: Number(formData.builtUpArea),
        unit: formData.unit,
        totalPrice: Number(formData.totalPrice),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        parkingSpaces: Number(formData.parkingSpaces),
        amenities: formData.amenities,
        address: {
          locality: formData.locality,
          city: formData.city,
          state: formData.state,
          country: 'India'
        },
        images: [formData.imageUrl]
      };

      const res = await api.post('/properties', payload);
      if (res.data.success) {
        setIsAddModalOpen(false);
        fetchProperties();

        if (res.data.matchingBuyers?.length > 0) {
          setMatchingBuyersModal({
            property: res.data.property,
            buyers: res.data.matchingBuyers
          });
          addToast(res.data.message || `Found ${res.data.matchingBuyers.length} matching buyers!`, 'success');
        } else {
          addToast('Property listing created successfully!', 'success');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create listing', 'error');
    }
  };

  const openMatchingBuyers = async (prop) => {
    try {
      const res = await api.get(`/properties/${prop._id}/matching-customers`);
      if (res.data.success && res.data.matchingCustomers?.length > 0) {
        setMatchingBuyersModal({
          property: prop,
          buyers: res.data.matchingCustomers
        });
      } else {
        addToast(`No active customers currently looking for ${prop.category}`, 'info');
      }
    } catch (err) {
      addToast('Could not fetch matching customers', 'error');
    }
  };

  const handleBroadcastToMatches = async (propertyId, customerIds = []) => {
    setBroadcasting(true);
    try {
      const res = await api.post(`/properties/${propertyId}/broadcast-matches`, { customerIds });
      if (res.data.success) {
        addToast(res.data.message || 'Property brochure dispatched to buyers via WhatsApp!', 'success');
        setMatchingBuyersModal(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch via WhatsApp', 'error');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" /> EXCLUSIVE PROPERTY CATALOG
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Verified Property Inventory</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real estate inventory management with live availability control and AI matching grounding ({total} listings).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add Property Listing
          </Button>
        </div>
      </div>

      {/* Category Tabs & Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-200/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-gradient-to-r from-[#ffe066] via-[#ffd700] to-[#e6c200] text-zinc-950 font-bold shadow-xs border border-[#ffd700]'
                : 'bg-white text-zinc-600 hover:bg-amber-50/50 hover:text-amber-950 border border-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar & Status Filter */}
      <Card>
        <CardContent className="p-3.5">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, property code (e.g. EF-APT-101), locality, or city..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="text-xs border border-zinc-300 rounded-lg px-2.5 py-2 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Sold">Sold</option>
              </select>

              <Button type="submit" size="sm" variant="outline">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="Try modifying your search criteria or add a new luxury listing."
          actionLabel="Add Property"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((prop) => (
            <Card
              key={prop._id}
              hover
              onClick={() => navigate(`/properties/${prop._id}`)}
              className="overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Image & Status Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={prop.images?.[0] || getPropertyFallbackImage(prop.category, prop.title)}
                    alt={prop.title}
                    onError={(e) => handleImageError(e, prop.category, prop.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/95 text-amber-950 border border-amber-300 shadow-xs">
                      {prop.propertyCode}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={prop.status}>{prop.status}</Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {prop.category} • For {prop.purpose}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      ₹{prop.pricePerUnit?.toLocaleString()}/sq.ft
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950 line-clamp-1 group-hover:text-zinc-700 transition">
                    {prop.title}
                  </h3>

                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    <span className="truncate">{prop.address?.locality}, {prop.address?.city}</span>
                  </p>

                  {/* Specs */}
                  <div className="flex items-center gap-3 pt-2 text-xs text-zinc-600 border-t border-zinc-100">
                    {prop.bedrooms > 0 && (
                      <span className="flex items-center gap-1 font-medium">
                        <Bed className="w-3.5 h-3.5 text-zinc-400" /> {prop.bedrooms} BHK
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-medium">
                      <Bath className="w-3.5 h-3.5 text-zinc-400" /> {prop.bathrooms} Baths
                    </span>
                    <span className="font-semibold text-zinc-800">
                      {prop.builtUpArea?.toLocaleString()} {prop.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 pt-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Price</div>
                  <div className="text-base font-extrabold text-amber-950">
                    ₹{(prop.totalPrice / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Share2}
                    onClick={(e) => {
                      e.stopPropagation();
                      openMatchingBuyers(prop);
                    }}
                    title="Find matching buyers & share on WhatsApp"
                  >
                    Share
                  </Button>
                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/properties/${prop._id}`); }}>
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="p-4 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-200">
          <span>Page {page} of {pages} ({total} listings)</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Property Listing" size="lg">
        <form onSubmit={handleCreateProperty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. DLF The Camellias Penthouse"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Code (Optional)</label>
              <input
                type="text"
                value={formData.propertyCode}
                onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="Auto-generated if left empty"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Independent House">Independent House</option>
                <option value="Plot">Plot / Land</option>
                <option value="Commercial">Commercial Office</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
              >
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
                <option value="Lease">Lease</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Bedrooms (BHK)</label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Built-Up Area (sq.ft) *</label>
              <input
                type="number"
                required
                value={formData.builtUpArea}
                onChange={(e) => setFormData({ ...formData, builtUpArea: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Total Price (INR) *</label>
              <input
                type="number"
                required
                step="500000"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 font-bold">
                ≈ ₹{(Number(formData.totalPrice) / 10000000).toFixed(2)} Cr
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Locality *</label>
              <input
                type="text"
                required
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Golf Course Road"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">High-Res Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Publish Property Listing</Button>
          </div>
        </form>
      </Modal>

      {/* Matching Buyers WhatsApp Dispatch Modal */}
      {matchingBuyersModal && (
        <Modal
          isOpen={Boolean(matchingBuyersModal)}
          onClose={() => setMatchingBuyersModal(null)}
          title={`🎯 Matching Buyers for ${matchingBuyersModal.property?.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Found {matchingBuyersModal.buyers?.length} Active Buyer(s) Looking for {matchingBuyersModal.property?.category}
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Send this property brochure directly to their WhatsApp with 1 tap.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                isLoading={broadcasting}
                icon={Share2}
                onClick={() => handleBroadcastToMatches(matchingBuyersModal.property._id)}
              >
                Send to All via WhatsApp
              </Button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-200 border border-zinc-200 rounded-xl bg-white">
              {matchingBuyersModal.buyers?.map(({ customer, matchScore, matchFactors }) => {
                const cleanPhone = (customer.phone || '').replace(/[^\d]/g, '');
                const directWaLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `🏡 *Exclusive Match from EstateFlow CRM!*\n\nHello *${customer.fullName}*! Here is a verified *${matchingBuyersModal.property.category}* matching your requirement:\n\n✨ *${matchingBuyersModal.property.title}* (${matchingBuyersModal.property.propertyCode})\n📍 Location: ${matchingBuyersModal.property.address?.locality || 'Gurugram'}, ${matchingBuyersModal.property.address?.city || 'Gurugram'}\n💰 Price: ₹${(matchingBuyersModal.property.totalPrice / 10000000).toFixed(2)} Cr\n📐 Layout: ${matchingBuyersModal.property.bedrooms} BHK | ${matchingBuyersModal.property.builtUpArea} ${matchingBuyersModal.property.unit || 'sq.ft'}\n\nWould you like to schedule an exclusive site visit?`
                )}`;

                return (
                  <div key={customer._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-950">{customer.fullName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {matchScore}% Match
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-3">
                        <span>📞 {customer.phone}</span>
                        <span>📍 {customer.preferredLocation || 'Gurugram'}</span>
                        <span>
                          💰 Up to ₹{customer.requirements?.maxBudget ? (customer.requirements.maxBudget / 10000000).toFixed(2) + ' Cr' : 'Flexible'}
                        </span>
                      </div>
                      {matchFactors?.length > 0 && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-1">
                          ✓ {matchFactors.slice(0, 2).join(' • ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleBroadcastToMatches(matchingBuyersModal.property._id, [customer._id])}
                      >
                        Send
                      </Button>
                      <a
                        href={directWaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition"
                        title="Open WhatsApp directly"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
