import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Sparkles
} from 'lucide-react';

export const LeadPipeline = () => {
  const [kanban, setKanban] = useState({});
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadForLost, setSelectedLeadForLost] = useState(null);
  const [lostReason, setLostReason] = useState('Budget Mismatch');
  const [lostDetails, setLostDetails] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const stages = [
    'New Enquiry',
    'Contacted',
    'Requirements Collected',
    'Qualified',
    'Property Recommended',
    'Site Visit Scheduled',
    'Negotiation',
    'Booking Confirmed',
    'Converted',
    'Lost'
  ];

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: { priority: priorityFilter }
      });
      if (res.data.success) {
        setKanban(res.data.kanban || {});
        setLeads(res.data.leads || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [priorityFilter]);

  const handleStageChange = async (leadId, newStage) => {
    if (newStage === 'Lost') {
      const lead = leads.find((l) => l._id === leadId);
      setSelectedLeadForLost(lead);
      return;
    }

    try {
      const res = await api.put(`/leads/${leadId}/stage`, { stage: newStage });
      if (res.data.success) {
        addToast(`Lead moved to ${newStage}`, 'success');
        fetchLeads();
      }
    } catch (err) {
      addToast('Failed to update stage', 'error');
    }
  };

  const handleConfirmLost = async (e) => {
    e.preventDefault();
    if (!selectedLeadForLost) return;

    try {
      const res = await api.put(`/leads/${selectedLeadForLost._id}/stage`, {
        stage: 'Lost',
        lostReason,
        lostDetails
      });

      if (res.data.success) {
        addToast('Lead marked as Lost with tracked reason.', 'info');
        setSelectedLeadForLost(null);
        setLostDetails('');
        fetchLeads();
      }
    } catch (err) {
      addToast('Failed to mark lead as lost', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Leads & Sales Pipeline Kanban</h1>
          <p className="text-xs text-zinc-500 mt-1">
            10-stage automated pipeline with real-time AI scoring and WhatsApp engagement tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-zinc-300 rounded-lg px-3 py-2 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent Only</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
          </select>
          <Button size="sm" onClick={() => navigate('/customers?action=new')}>
            + New Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll Container */}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-72 flex-shrink-0 bg-zinc-100 rounded-xl p-3 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none">
          {stages.map((stage) => {
            const columnLeads = kanban[stage] || [];
            return (
              <div
                key={stage}
                className="w-72 flex-shrink-0 flex flex-col bg-zinc-100/80 rounded-xl border border-zinc-200 max-h-[78vh]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-zinc-200 bg-white rounded-t-xl flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 tracking-tight">{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300 text-[10px] font-bold flex items-center justify-center">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1">
                  {columnLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-zinc-400">No leads in stage</div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead._id}
                        className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all space-y-2.5 cursor-pointer"
                        onClick={() => lead.customerId && navigate(`/customers/${lead.customerId._id}`)}
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-zinc-950 leading-snug line-clamp-2">
                            {lead.title}
                          </h4>
                          <Badge variant={lead.priority} size="xs">
                            {lead.priority}
                          </Badge>
                        </div>

                        {/* Customer Info */}
                        <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-zinc-400" />
                          <span className="font-semibold text-zinc-900">
                            {lead.customerId?.fullName || 'Prospect'}
                          </span>
                        </div>

                        {/* Budget & Locality */}
                        <div className="flex items-center justify-between text-[11px] bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                          <span className="font-bold text-zinc-950">
                            {lead.budget?.max
                              ? `₹${(lead.budget.max / 10000000).toFixed(2)} Cr`
                              : 'Budget Open'}
                          </span>
                          <span className="text-zinc-500 truncate max-w-[100px]">
                            {lead.preferredLocation || 'Gurugram'}
                          </span>
                        </div>

                        {/* AI Score & Stage Selector */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[11px]">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-zinc-800" />
                            <span className="font-bold text-zinc-950">{lead.score}%</span>
                            <span className="text-[9px] text-zinc-500">({lead.scoreClassification})</span>
                          </div>

                          <div onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.stage}
                              onChange={(e) => handleStageChange(lead._id, e.target.value)}
                              className="text-[10px] font-medium border border-zinc-300 rounded px-1.5 py-0.5 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                            >
                              {stages.map((s) => (
                                <option key={s} value={s}>
                                  Move to: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lost Reason Modal */}
      <Modal
        isOpen={!!selectedLeadForLost}
        onClose={() => setSelectedLeadForLost(null)}
        title="Record Reason for Lost Lead"
        size="md"
      >
        <form onSubmit={handleConfirmLost} className="space-y-4">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Please record why <strong>{selectedLeadForLost?.customerId?.fullName}</strong> did not proceed. This data powers your CRM lost-lead analytics report.
          </p>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Primary Lost Reason *</label>
            <select
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white"
            >
              <option value="Budget Mismatch">Budget Mismatch</option>
              <option value="Location Unsuitable">Location Unsuitable</option>
              <option value="Bought Elsewhere">Bought Elsewhere</option>
              <option value="Postponed Plan">Postponed Plan</option>
              <option value="Unresponsive">Unresponsive to WhatsApp / Calls</option>
              <option value="Unrealistic Demands">Unrealistic Demands</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Additional Notes</label>
            <textarea
              rows={3}
              value={lostDetails}
              onChange={(e) => setLostDetails(e.target.value)}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="e.g. Buyer bought in Noida Sector 150 instead due to closer proximity to office..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSelectedLeadForLost(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Confirm & Move to Lost
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
