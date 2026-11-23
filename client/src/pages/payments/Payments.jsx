import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  Printer
} from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    bookingId: '',
    amountPaid: 5000000,
    paymentMethod: 'Bank Transfer',
    transactionId: '',
    notes: 'Milestone payment installment'
  });

  const { addToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      if (res.data.success) {
        setPayments(res.data.payments || []);
        setTotalCollected(res.data.totalCollected || 0);
        setTotalPending(res.data.totalPending || 0);
      }
    } catch (err) {
      addToast('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get('/bookings');
        if (res.data.success) {
          setBookings(res.data.bookings || []);
          if (res.data.bookings?.[0]) {
            setFormData((prev) => ({ ...prev, bookingId: res.data.bookings[0]._id }));
          }
        }
      } catch (err) {}
    };
    loadBookings();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/payments', formData);
      if (res.data.success) {
        addToast('Payment recorded successfully!', 'success');
        setIsRecordModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to record payment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <CreditCard className="w-3 h-3 text-amber-600" /> FINANCIAL MANAGEMENT & ESCROW
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Payments & Transaction Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Verified financial transaction tracking, advance collections, remaining balances, and downloadable receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsRecordModalOpen(true)}>
            Record Payment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 flex items-center justify-between bg-gradient-to-br from-amber-100/50 via-amber-50/35 to-yellow-50/30 border-amber-300 shadow-xs">
          <div>
            <span className="text-xs text-amber-900 font-bold">Total Revenue Collected</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-1 text-amber-950">
              ₹{(totalCollected / 10000000).toFixed(2)} Cr
            </h2>
            <p className="text-[11px] text-amber-800/80 mt-1 font-medium">Directly deposited via verified banking</p>
          </div>
          <div className="p-3.5 bg-amber-100 text-amber-900 rounded-2xl border border-amber-300 shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-amber-700" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white text-zinc-900 border-zinc-200 hover:border-amber-300 shadow-xs">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Total Pending Receivables</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-zinc-950">
              ₹{(totalPending / 10000000).toFixed(2)} Cr
            </h2>
            <p className="text-[11px] text-zinc-500 mt-1">Milestones & balance dues</p>
          </div>
          <div className="p-3.5 bg-zinc-100 rounded-2xl border border-zinc-200">
            <Clock className="w-8 h-8 text-zinc-800" />
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader title="All Financial Transactions" subtitle="Complete invoice history and receipts" />
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions recorded"
            description="Record property booking advance tokens or installment payments."
            actionLabel="Record Payment"
            onAction={() => setIsRecordModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/50 text-amber-950 uppercase tracking-wider font-semibold border-b border-amber-200/80">
                <tr>
                  <th className="py-3 px-4">Invoice & Ref ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-zinc-950">{p.invoiceNumber}</div>
                      <div className="text-[10px] text-zinc-400">{p.transactionId}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {p.customerId?.fullName || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-zinc-900 truncate max-w-[200px]">
                        {p.propertyId?.title}
                      </div>
                      <div className="text-[10px] text-zinc-400">{p.propertyId?.propertyCode}</div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-amber-950">
                      ₹{(p.amountPaid / 100000).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-700">
                      ₹{(p.remainingBalance / 100000).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-600">{p.paymentMethod}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status}>{p.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Receipt}
                        onClick={() => setSelectedReceipt(p)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Verified Payment" size="md">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Select Booking Reference *</label>
            <select
              required
              value={formData.bookingId}
              onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
            >
              {bookings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.bookingCode} • Client: {b.customerId?.fullName} • Property: {b.propertyId?.propertyCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Amount Paid (INR) *</label>
            <input
              type="number"
              required
              step="100000"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
            <span className="text-[10px] text-zinc-500 font-bold">
              ≈ ₹{(Number(formData.amountPaid) / 100000).toFixed(2)} Lakhs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Transaction Ref ID</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. HDFC12345678"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment & Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Official Payment Receipt" size="md">
        {selectedReceipt && (
          <div className="space-y-4 p-2">
            <div className="border border-zinc-200 rounded-xl p-5 bg-white space-y-4 print:border-none">
              <div className="flex justify-between items-start border-b border-zinc-200 pb-3">
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-base">EstateFlow Realty</h3>
                  <p className="text-[11px] text-zinc-500">Official Payment Acknowledgement</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-zinc-950">{selectedReceipt.invoiceNumber}</span>
                  <p className="text-[10px] text-zinc-400">
                    Date: {new Date(selectedReceipt.paidAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Customer:</span>
                  <span className="font-bold text-zinc-950">{selectedReceipt.customerId?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Property:</span>
                  <span className="font-semibold text-zinc-800">{selectedReceipt.propertyId?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID:</span>
                  <span className="font-mono text-zinc-700">{selectedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Payment Mode:</span>
                  <span className="font-medium text-zinc-800">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-100 rounded-lg flex justify-between items-center border border-zinc-200">
                <span className="text-xs font-bold text-zinc-900">Total Amount Received:</span>
                <span className="text-base font-extrabold text-zinc-950">
                  ₹{(selectedReceipt.amountPaid / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" icon={Printer} onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
