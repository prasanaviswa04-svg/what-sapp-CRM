import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Plus,
  Download,
  Trash2,
  Eye,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  ExternalLink
} from 'lucide-react';

export const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [matchResultModal, setMatchResultModal] = useState(null);

  // New Customer Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    customerType: 'Buyer',
    currentLocation: 'Gurugram',
    preferredLocation: 'Golf Course Road',
    propertyCategory: 'Apartment',
    purpose: 'Buy',
    minBudget: 15000000,
    maxBudget: 25000000,
    bedrooms: 3,
    purchaseTimeline: 'Near term (1-3 months)',
    priority: 'Medium',
    source: 'Manual Entry',
    internalNotes: '',
    autoShareProperty: true
  });

  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewModalOpen(true);
    }
  }, [searchParams]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: {
          page,
          search,
          leadStatus: statusFilter,
          priority: priorityFilter,
          limit: 15
        }
      });
      if (res.data.success) {
        setCustomers(res.data.customers);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        customerType: formData.customerType,
        currentLocation: formData.currentLocation,
        preferredLocation: formData.preferredLocation,
        source: formData.source,
        priority: formData.priority,
        internalNotes: formData.internalNotes,
        autoShareProperty: formData.autoShareProperty,
        requirements: {
          propertyCategory: formData.propertyCategory,
          purpose: formData.purpose,
          minBudget: Number(formData.minBudget),
          maxBudget: Number(formData.maxBudget),
          bedrooms: Number(formData.bedrooms),
          purchaseTimeline: formData.purchaseTimeline
        }
      };

      const res = await api.post('/customers', payload);
      if (res.data.success) {
        setIsNewModalOpen(false);
        fetchCustomers();

        if (res.data.topMatchedProperty) {
          setMatchResultModal(res.data);
          addToast(res.data.message || 'Customer saved and matching property found!', 'success');
        } else {
          addToast(res.data.message || 'Customer & pipeline lead created successfully!', 'success');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create customer', 'error');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer? This will also remove associated leads.')) return;
    try {
      await api.delete(`/customers/${id}`);
      addToast('Customer removed', 'success');
      fetchCustomers();
    } catch (err) {
      addToast('Failed to delete customer', 'error');
    }
  };

  const handleExportCsv = () => {
    window.open('/api/customers/export/csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" /> CLIENT DATABASE & PROFILES
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Customer Relationship Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your verified buyer profiles, investment preferences, and communication records ({total} total).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download} onClick={handleExportCsv} className="border-amber-200/70 hover:bg-amber-50/50 hover:border-amber-300 text-amber-950">
            Export CSV
          </Button>
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsNewModalOpen(true)}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="p-3.5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by full name, phone number, email, or locality..."
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
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Interested">Interested</option>
                <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                <option value="Booked">Booked</option>
                <option value="Lost">Lost</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                className="text-xs border border-zinc-300 rounded-lg px-2.5 py-2 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <Button type="submit" size="sm" variant="outline">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customer records found"
            description="Start by adding your first client or simulate an incoming WhatsApp enquiry."
            actionLabel="Add Customer"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/50 text-amber-950 uppercase tracking-wider font-semibold border-b border-amber-200/80">
                <tr>
                  <th className="py-3.5 px-4">Customer Name & Phone</th>
                  <th className="py-3.5 px-4">Category & Requirements</th>
                  <th className="py-3.5 px-4">Target Budget</th>
                  <th className="py-3.5 px-4">Preferred Locality</th>
                  <th className="py-3.5 px-4">Lead Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {customers.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-amber-50/30 transition cursor-pointer"
                    onClick={() => navigate(`/customers/${c._id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-950 text-sm">{c.fullName}</div>
                      <div className="text-zinc-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-zinc-700" /> {c.phone}
                        {c.email && (
                          <span className="text-zinc-400 ml-1 truncate max-w-[150px]">
                            • {c.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-800">
                        {c.requirements?.bedrooms ? `${c.requirements.bedrooms} BHK ` : ''}
                        {c.requirements?.propertyCategory || 'Apartment'}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {c.customerType} • {c.requirements?.purchaseTimeline}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-950">
                      {c.requirements?.maxBudget
                        ? `₹${(c.requirements.maxBudget / 10000000).toFixed(2)} Cr`
                        : 'Not specified'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {c.preferredLocation || 'Gurugram'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.leadStatus}>{c.leadStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={c.priority}>{c.priority}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/customers/${c._id}`)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded transition"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c._id)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-3.5 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
            <span>
              Page {page} of {pages} ({total} records)
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* New Customer Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Add New Customer Profile"
        size="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Yashvardhan Singhania"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">WhatsApp Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="yash@techcorp.in"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Customer Category</label>
              <select
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
              >
                <option value="Buyer">Buyer</option>
                <option value="Investor">Investor</option>
                <option value="Tenant">Tenant</option>
                <option value="Seller">Seller</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Property Category</label>
              <select
                value={formData.propertyCategory}
                onChange={(e) => setFormData({ ...formData, propertyCategory: e.target.value })}
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
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Bedrooms (BHK)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Target Locality</label>
              <input
                type="text"
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Golf Course Road"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Maximum Budget (INR)</label>
              <input
                type="number"
                step="500000"
                value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="25000000"
              />
              <span className="text-[10px] text-zinc-500 font-medium">
                ≈ ₹{(Number(formData.maxBudget) / 10000000).toFixed(2)} Cr
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Lead Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
              >
                <option value="Urgent">Urgent (Immediate Site Visit)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Internal Broker Notes</label>
            <textarea
              rows={2}
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="Client prefers higher floor facing sunrise and corner plot..."
            />
          </div>

          {/* Auto WhatsApp Property Match Dispatch Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Auto-Share Matched Property on WhatsApp
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Finds matching {formData.propertyCategory} listings and sends brochure directly to client.
              </p>
            </div>
            <input
              type="checkbox"
              id="autoShareProperty"
              checked={formData.autoShareProperty}
              onChange={(e) => setFormData({ ...formData, autoShareProperty: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Customer & Match Property</Button>
          </div>
        </form>
      </Modal>

      {/* Property Match Notification & Instant WhatsApp Share Modal */}
      {matchResultModal && (
        <Modal
          isOpen={Boolean(matchResultModal)}
          onClose={() => setMatchResultModal(null)}
          title="🎯 Property Matched for Customer!"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Found Matching {matchResultModal.topMatchedProperty?.category}!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                {matchResultModal.dispatchedToWhatsApp
                  ? `Delivered directly to ${matchResultModal.customer?.fullName} (${matchResultModal.customer?.phone}) via connected WhatsApp Gateway!`
                  : `Matched with ${matchResultModal.customer?.fullName}'s requirement. Ready to send via WhatsApp.`}
              </p>
            </div>

            {matchResultModal.topMatchedProperty && (
              <div className="border border-zinc-200 rounded-2xl p-4 space-y-2 bg-white shadow-xs">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase bg-zinc-900 text-white px-2 py-0.5 rounded">
                    {matchResultModal.topMatchedProperty.propertyCode}
                  </span>
                  <span className="text-sm font-extrabold text-zinc-950">
                    ₹{(matchResultModal.topMatchedProperty.totalPrice / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-900">{matchResultModal.topMatchedProperty.title}</h4>
                <p className="text-xs text-zinc-500">
                  📍 {matchResultModal.topMatchedProperty.address?.locality}, {matchResultModal.topMatchedProperty.address?.city}
                </p>
                <div className="text-xs text-zinc-600 font-medium pt-1 flex items-center gap-3">
                  <span>🛏️ {matchResultModal.topMatchedProperty.bedrooms} BHK</span>
                  <span>📐 {matchResultModal.topMatchedProperty.builtUpArea} {matchResultModal.topMatchedProperty.unit || 'sq.ft'}</span>
                  <span>🏷️ {matchResultModal.topMatchedProperty.category}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {matchResultModal.waDirectUrl && (
                <a
                  href={matchResultModal.waDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs transition"
                >
                  <Share2 className="w-3.5 h-3.5" /> Open in WhatsApp App
                </a>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigate(`/customers/${matchResultModal.customer?._id}`);
                  setMatchResultModal(null);
                }}
              >
                View Customer Profile →
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
