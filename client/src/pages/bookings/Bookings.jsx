import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircle2,
  Building2,
  User,
  Plus,
  ShieldCheck,
  CreditCard,
  XCircle,
  FileText
} from 'lucide-react';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);

  // Form
  const [formData, setFormData] = useState({
    customerId: '',
    propertyId: '',
    agreedPrice: 185000000,
    advanceAmount: 20000000,
    paymentMethod: 'Bank Transfer',
    termsAndConditions: 'Standard Real Estate Agreement Terms apply.'
  });

  const { addToast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          api.get('/customers?limit=50'),
          api.get('/properties?status=Available&limit=50')
        ]);
        if (cRes.data.success) setCustomers(cRes.data.customers || []);
        if (pRes.data.success) {
          setProperties(pRes.data.properties || []);
          if (pRes.data.properties?.[0]) {
            setFormData((prev) => ({
              ...prev,
              propertyId: pRes.data.properties[0]._id,
              agreedPrice: pRes.data.properties[0].totalPrice,
              advanceAmount: Math.round(pRes.data.properties[0].totalPrice * 0.1)
            }));
          }
        }
        if (cRes.data.customers?.[0]) {
          setFormData((prev) => ({ ...prev, customerId: cRes.data.customers[0]._id }));
        }
      } catch (err) {}
    };
    loadDropdowns();
  }, []);

  const handlePropertyChange = (propId) => {
    const prop = properties.find((p) => p._id === propId);
    if (prop) {
      setFormData({
        ...formData,
        propertyId: propId,
        agreedPrice: prop.totalPrice,
        advanceAmount: Math.round(prop.totalPrice * 0.1)
      });
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/bookings', formData);
      if (res.data.success) {
        addToast('Booking confirmed! Property marked as Reserved.', 'success');
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create booking', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (!reason) return;

    try {
      await api.put(`/bookings/${id}/cancel`, { reason });
      addToast('Booking cancelled & property restored to Available', 'info');
      fetchBookings();
    } catch (err) {
      addToast('Failed to cancel booking', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Property Bookings & Reservations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transaction-safe booking management with automatic property lock and advance receipt tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Property Booking
          </Button>
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No bookings recorded yet"
            description="Initiate and confirm bookings when customers place advance token payments."
            actionLabel="New Booking"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Booking Code</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Agreed Value</th>
                  <th className="py-3.5 px-4">Advance Token</th>
                  <th className="py-3.5 px-4">Booking Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.bookingCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{b.customerId?.fullName}</div>
                      <div className="text-[11px] text-slate-400">{b.customerId?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{b.propertyId?.title}</div>
                      <div className="text-[11px] text-slate-400">{b.propertyId?.propertyCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{(b.agreedPrice / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      ₹{(b.advanceAmount / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={b.bookingStatus}>{b.bookingStatus}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.bookingStatus === 'Confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate New Property Booking" size="md">
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Available Property *</label>
            <select
              required
              value={formData.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agreed Price (INR) *</label>
              <input
                type="number"
                required
                value={formData.agreedPrice}
                onChange={(e) => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-medium">
                ₹{(Number(formData.agreedPrice) / 10000000).toFixed(2)} Cr
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Token (INR) *</label>
              <input
                type="number"
                required
                value={formData.advanceAmount}
                onChange={(e) => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-emerald-600 font-bold">
                ₹{(Number(formData.advanceAmount) / 10000000).toFixed(2)} Cr
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI Payment</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Booking & Lock Inventory</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
