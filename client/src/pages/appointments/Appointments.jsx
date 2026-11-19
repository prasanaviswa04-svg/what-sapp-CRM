import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  User,
  Building2,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone
} from 'lucide-react';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    propertyId: '',
    visitDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    visitTime: '11:00 AM',
    meetingLocation: 'At Property Site',
    notes: ''
  });

  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      const propId = searchParams.get('propertyId');
      const custId = searchParams.get('customerId');
      if (propId) setFormData((prev) => ({ ...prev, propertyId: propId }));
      if (custId) setFormData((prev) => ({ ...prev, customerId: custId }));
    }
  }, [searchParams]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments', {
        params: { status: statusFilter }
      });
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load visits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  // Load customers and properties for the form
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=50'),
          api.get('/properties?status=Available&limit=50')
        ]);
        if (cRes.data.success) setCustomers(cRes.data.customers || []);
        if (pRes.data.success) setProperties(pRes.data.properties || []);
        if (cRes.data.customers?.length > 0 && !formData.customerId) {
          setFormData((prev) => ({ ...prev, customerId: cRes.data.customers[0]._id }));
        }
        if (pRes.data.properties?.length > 0 && !formData.propertyId) {
          setFormData((prev) => ({ ...prev, propertyId: pRes.data.properties[0]._id }));
        }
      } catch (err) {}
    };
    loadDropdownData();
  }, []);

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/appointments', formData);
      if (res.data.success) {
        addToast('Site visit scheduled! Confirmation sent to customer.', 'success');
        setIsModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not schedule visit', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      addToast(`Visit status updated to ${status}`, 'success');
      fetchAppointments();
    } catch (err) {
      addToast('Failed to update appointment status', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Property Visits & Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client walkthrough schedules, broker assignments, conflict detection, and WhatsApp reminders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Schedule Site Visit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Confirmed', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === st
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {st} Visits
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No appointments found"
            description="Schedule client site visits to showcase luxury properties."
            actionLabel="Schedule Site Visit"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((app) => (
              <div key={app._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 text-teal-600 flex-shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{app.propertyId?.title}</h3>
                      <Badge variant={app.status}>{app.status}</Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {new Date(app.visitDate).toLocaleDateString()} at {app.visitTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Client: <strong className="text-slate-800">{app.customerId?.fullName}</strong> ({app.customerId?.phone})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {app.meetingLocation}
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 px-2.5 py-1 rounded border border-slate-100 inline-block">
                        Note: {app.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {app.status !== 'Completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(app._id, 'Completed')}
                      className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Done
                    </Button>
                  )}
                  {app.status !== 'Cancelled' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(app._id, 'Cancelled')}
                      className="text-xs text-rose-600 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Visit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Property Site Visit" size="md">
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Property *</label>
            <select
              required
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.propertyCode}) - ₹{(p.totalPrice / 10000000).toFixed(2)} Cr
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Date *</label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Time *</label>
              <input
                type="text"
                required
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                placeholder="e.g. 11:30 AM"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Location</label>
            <input
              type="text"
              value={formData.meetingLocation}
              onChange={(e) => setFormData({ ...formData, meetingLocation: e.target.value })}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. The Camellias Clubhouse Lobby"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions / Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. Client requested chauffeur pick-up from Cyber City..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm & Notify Client</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
