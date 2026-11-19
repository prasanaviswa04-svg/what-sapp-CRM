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
  ChevronRight
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
        addToast('Property listing created successfully!', 'success');
        setIsAddModalOpen(false);
        fetchProperties();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create listing', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Verified Property Inventory</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real estate inventory management with live availability control and AI matching grounding ({total} listings).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={Plus} onClick={() => setIsAddModalOpen(true)}>
            Add Property Listing
          </Button>
        </div>
      </div>

      {/* Category Tabs & Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
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
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/95 text-zinc-900 border border-zinc-200 shadow-xs">
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
              <div className="p-4 pt-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Price</div>
                  <div className="text-base font-extrabold text-zinc-950">
                    ₹{(prop.totalPrice / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/properties/${prop._id}`); }}>
                  Details
                </Button>
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
    </div>
  );
};
