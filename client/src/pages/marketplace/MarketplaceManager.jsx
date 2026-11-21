import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Eye,
  Check,
  X,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  AlertCircle,
  Plus
} from 'lucide-react';

export const MarketplaceManager = () => {
  const { addToast } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Submission Modal State (opened on the same tab)
  const [showNewModal, setShowNewModal] = useState(false);
  const [submittingNew, setSubmittingNew] = useState(false);
  const [newFormData, setNewFormData] = useState({
    submissionCategory: 'Property',
    submissionType: 'Property for Sale',
    title: '',
    submitterName: '',
    submitterPhone: '',
    submitterType: 'Owner',
    price: '',
    locality: '',
    city: 'Gurugram',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, subRes] = await Promise.all([
        api.get('/marketplace/admin/dashboard'),
        api.get('/marketplace/admin/submissions?limit=100')
      ]);

      const subList = subRes.data.submissions || [];
      setSubmissions(subList);

      const kpis = dashRes.data.stats || dashRes.data.kpis || {};
      setStats({
        total: kpis.totalSubmissions || subList.length,
        pending: kpis.pendingVerification || subList.filter(s => s.status !== 'Approved' && s.status !== 'Rejected').length,
        approved: kpis.approvedListings || subList.filter(s => s.status === 'Approved').length
      });
    } catch (err) {
      console.error('Failed to load marketplace submissions:', err);
      addToast('Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Status Change (Approve / Reject)
  const handleQuickStatus = async (subId, newStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/marketplace/admin/submissions/${subId}/status`, {
        status: newStatus,
        notes: newStatus === 'Approved' ? 'Approved and added to CRM inventory' : 'Rejected submission',
        notifySubmitter: true,
        syncToCRM: newStatus === 'Approved'
      });

      addToast(
        newStatus === 'Approved'
          ? 'Submission approved and synced to CRM!'
          : 'Submission rejected',
        newStatus === 'Approved' ? 'success' : 'info'
      );

      // Refresh list
      fetchData();
      if (selectedSub?._id === subId) {
        setSelectedSub(null);
      }
    } catch (err) {
      console.error('Status update failed:', err);
      addToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create New Submission from modal on the same tab
  const handleCreateNew = async (e) => {
    e.preventDefault();
    if (!newFormData.title.trim() || !newFormData.submitterPhone.trim()) {
      addToast('Please provide a title and contact phone', 'error');
      return;
    }

    setSubmittingNew(true);
    try {
      const isProperty = newFormData.submissionCategory === 'Property';
      const payload = {
        submissionCategory: newFormData.submissionCategory,
        submissionType: newFormData.submissionType,
        source: newFormData.submitterType === 'Broker' ? 'Real Estate Broker' : 'Direct Property Owner',
        title: newFormData.title,
        description: newFormData.description,
        submitterName: newFormData.submitterName || 'Partner',
        submitterPhone: newFormData.submitterPhone,
        submitterWhatsApp: newFormData.submitterPhone,
        propertyDetails: isProperty ? {
          category: 'Residential',
          propertyType: 'Apartment',
          purpose: newFormData.submissionType.includes('Rent') ? 'Rent' : 'Sale',
          price: Number(newFormData.price) || 0,
          rentalPrice: newFormData.submissionType.includes('Rent') ? Number(newFormData.price) || 0 : 0,
          builtUpArea: 1200,
          address: {
            locality: newFormData.locality || 'Gurugram',
            city: newFormData.city || 'Gurugram'
          }
        } : undefined,
        requirementDetails: !isProperty ? {
          clientName: newFormData.submitterName || 'Client',
          clientPhone: newFormData.submitterPhone,
          customerType: 'Buyer',
          budgetMin: Number(newFormData.price) * 0.8 || 10000000,
          budgetMax: Number(newFormData.price) || 25000000,
          preferredLocations: [newFormData.locality || 'Gurugram']
        } : undefined
      };

      const res = await api.post('/marketplace/submissions', payload);
      addToast(`Submission created: ${res.data.submission?.submissionId || 'Success'}`, 'success');
      setShowNewModal(false);
      setNewFormData({
        submissionCategory: 'Property',
        submissionType: 'Property for Sale',
        title: '',
        submitterName: '',
        submitterPhone: '',
        submitterType: 'Owner',
        price: '',
        locality: '',
        city: 'Gurugram',
        description: ''
      });
      fetchData();
    } catch (err) {
      console.error('Failed to create submission:', err);
      addToast(err.response?.data?.message || 'Failed to submit', 'error');
    } finally {
      setSubmittingNew(false);
    }
  };

  // Filtered Submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (statusFilter === 'Pending') {
      if (sub.status === 'Approved' || sub.status === 'Rejected') return false;
    } else if (statusFilter === 'Approved') {
      if (sub.status !== 'Approved' && sub.status !== 'Published') return false;
    } else if (statusFilter === 'Rejected') {
      if (sub.status !== 'Rejected') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = sub.title?.toLowerCase().includes(q);
      const matchId = sub.submissionId?.toLowerCase().includes(q);
      const matchName = sub.submitterName?.toLowerCase().includes(q);
      const matchPhone = sub.submitterPhone?.toLowerCase().includes(q);
      return matchTitle || matchId || matchName || matchPhone;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 tracking-tight">
            Marketplace Submissions
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Review and approve property listings and customer requirements from owners and brokers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + New Submission
          </button>
        </div>
      </div>

      {/* 3 Simple KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-white border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Total Submissions
          </span>
          <p className="text-2xl font-black text-zinc-950 mt-1">
            {stats.total}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">All received listings</span>
        </Card>

        <Card className="p-4 bg-amber-50/60 border-amber-200">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Pending Review
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {stats.pending}
          </p>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Waiting for your approval</span>
        </Card>

        <Card className="p-4 bg-emerald-50/60 border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Approved & In CRM
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            {stats.approved}
          </p>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Active in CRM inventory & leads</span>
        </Card>
      </div>

      {/* Search & Quick Filters */}
      <Card className="p-3 bg-white border-zinc-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by title, submitter name, phone, or ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'All', label: 'All' },
              { id: 'Pending', label: 'Pending Review' },
              { id: 'Approved', label: 'Approved' },
              { id: 'Rejected', label: 'Rejected' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Submissions Table */}
      <Card className="bg-white border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">ID & Date</th>
                <th className="px-4 py-3">Property / Requirement</th>
                <th className="px-4 py-3">Submitter</th>
                <th className="px-4 py-3">Price / Budget</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                    Loading submissions...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub._id} className="hover:bg-zinc-50 transition-colors">
                    {/* ID & Date */}
                    <td className="px-4 py-3 align-middle font-mono font-bold text-zinc-900">
                      {sub.submissionId}
                      <span className="block text-[10px] font-sans font-normal text-zinc-400">
                        {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 align-middle max-w-xs">
                      <p className="font-semibold text-zinc-950 truncate">{sub.title}</p>
                      <span className="text-[10px] text-zinc-500">
                        {sub.submissionType} • {sub.source}
                      </span>
                    </td>

                    {/* Submitter */}
                    <td className="px-4 py-3 align-middle">
                      <p className="font-medium text-zinc-950">{sub.submitterName}</p>
                      <p className="text-[10px] text-zinc-500">{sub.submitterPhone}</p>
                    </td>

                    {/* Price / Budget */}
                    <td className="px-4 py-3 align-middle font-mono font-bold text-zinc-900">
                      {sub.submissionCategory === 'Property'
                        ? `₹${((sub.propertyDetails?.price || sub.propertyDetails?.rentalPrice || 0) / 10000000).toFixed(2)} Cr`
                        : `₹${((sub.requirementDetails?.budgetMin || 0) / 10000000).toFixed(2)} - ₹${((sub.requirementDetails?.budgetMax || 0) / 10000000).toFixed(2)} Cr`}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3 align-middle">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sub.status === 'Approved' || sub.status === 'Published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    {/* 1-Click Quick Actions */}
                    <td className="px-4 py-3 align-middle text-right space-x-1">
                      {sub.status !== 'Approved' && (
                        <button
                          onClick={() => handleQuickStatus(sub._id, 'Approved')}
                          disabled={actionLoading}
                          title="1-Click Approve and Sync to CRM"
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                        >
                          Approve
                        </button>
                      )}

                      {sub.status !== 'Rejected' && sub.status !== 'Approved' && (
                        <button
                          onClick={() => handleQuickStatus(sub._id, 'Rejected')}
                          disabled={actionLoading}
                          title="Reject submission"
                          className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-[11px] transition-colors"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[11px] transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simple Details Popup */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-zinc-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-zinc-400">
                  {selectedSub.submissionId}
                </span>
                <h3 className="text-base font-bold text-zinc-950 mt-0.5">
                  {selectedSub.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                <p className="text-zinc-500 font-semibold text-[11px]">Submitter Details</p>
                <p className="font-bold text-zinc-900">{selectedSub.submitterName} ({selectedSub.source})</p>
                <p className="text-zinc-600">Phone: {selectedSub.submitterPhone}</p>
                {selectedSub.submitterEmail && (
                  <p className="text-zinc-600">Email: {selectedSub.submitterEmail}</p>
                )}
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
                <p className="text-zinc-500 font-semibold text-[11px]">Submission Specifications</p>
                <p className="font-bold text-zinc-900">
                  Type: {selectedSub.submissionType}
                </p>
                <p className="text-zinc-600">
                  {selectedSub.submissionCategory === 'Property'
                    ? `Price: ₹${((selectedSub.propertyDetails?.price || selectedSub.propertyDetails?.rentalPrice || 0) / 10000000).toFixed(2)} Cr • Area: ${selectedSub.propertyDetails?.builtUpArea || 0} sqft`
                    : `Budget: ₹${((selectedSub.requirementDetails?.budgetMin || 0) / 10000000).toFixed(2)} - ₹${((selectedSub.requirementDetails?.budgetMax || 0) / 10000000).toFixed(2)} Cr`}
                </p>
                {selectedSub.description && (
                  <p className="text-zinc-600 pt-1 italic">"{selectedSub.description}"</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2 border-t border-zinc-100">
              {selectedSub.status !== 'Approved' && (
                <Button
                  onClick={() => handleQuickStatus(selectedSub._id, 'Approved')}
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Approve & Sync to CRM
                </Button>
              )}

              {selectedSub.status !== 'Rejected' && (
                <Button
                  variant="outline"
                  onClick={() => handleQuickStatus(selectedSub._id, 'Rejected')}
                  disabled={actionLoading}
                  className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  Reject
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setSelectedSub(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SUBMISSION MODAL (SHOWS DIRECTLY ON THE SAME TAB) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-zinc-200 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-950">
                  New Marketplace Submission
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Submit a property or requirement directly into the review queue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-3.5 text-xs">
              {/* Category selector */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Submission Type</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { cat: 'Property', type: 'Property for Sale', label: 'For Sale' },
                    { cat: 'Property', type: 'Property for Rent', label: 'For Rent' },
                    { cat: 'Requirement', type: 'Buyer Requirements', label: 'Buyer Req' }
                  ].map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setNewFormData({
                        ...newFormData,
                        submissionCategory: t.cat,
                        submissionType: t.type
                      })}
                      className={`py-1.5 px-2 rounded-lg border text-center font-semibold transition-all ${
                        newFormData.submissionType === t.type
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={newFormData.title}
                  onChange={e => setNewFormData({ ...newFormData, title: e.target.value })}
                  placeholder="e.g. 3 BHK Luxury Apartment in DLF Phase 5"
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                />
              </div>

              {/* Submitter Name & Phone */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Submitter Name</label>
                  <input
                    type="text"
                    value={newFormData.submitterName}
                    onChange={e => setNewFormData({ ...newFormData, submitterName: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newFormData.submitterPhone}
                    onChange={e => setNewFormData({ ...newFormData, submitterPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Submitter Role & Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">Submitter Role</label>
                  <select
                    value={newFormData.submitterType}
                    onChange={e => setNewFormData({ ...newFormData, submitterType: e.target.value })}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                  >
                    <option value="Owner">Direct Owner</option>
                    <option value="Broker">Real Estate Broker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-semibold mb-1">
                    {newFormData.submissionType === 'Property for Rent' ? 'Monthly Rent (₹)' : 'Price / Budget (₹)'}
                  </label>
                  <input
                    type="number"
                    value={newFormData.price}
                    onChange={e => setNewFormData({ ...newFormData, price: e.target.value })}
                    placeholder="25000000"
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                  />
                </div>
              </div>

              {/* Locality */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Locality / Area</label>
                <input
                  type="text"
                  value={newFormData.locality}
                  onChange={e => setNewFormData({ ...newFormData, locality: e.target.value })}
                  placeholder="e.g. Golf Course Road, DLF Phase 5"
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={newFormData.description}
                  onChange={e => setNewFormData({ ...newFormData, description: e.target.value })}
                  placeholder="Key features, floor preference, or client requirements..."
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:bg-white focus:border-zinc-400 resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                <Link
                  to="/marketplace/submit-property"
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                >
                  Open Full Form in Same Tab →
                </Link>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewModal(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingNew}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-4"
                  >
                    {submittingNew ? 'Submitting...' : 'Submit Now'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
