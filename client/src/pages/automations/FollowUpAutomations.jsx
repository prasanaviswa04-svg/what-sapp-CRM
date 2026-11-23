import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Zap,
  Play,
  Clock,
  Plus
} from 'lucide-react';

export const FollowUpAutomations = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [testCustomerId, setTestCustomerId] = useState('');
  const [executingId, setExecutingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerEvent: 'new_enquiry',
    targetSegment: 'All Customers',
    delayMinutes: 5,
    whatsappTemplate: 'welcome_real_estate_discovery',
    messageBody: 'Hello {{customer_name}}! 🏡 We received your enquiry for {{property_title}}. What are your key requirements?'
  });

  const { addToast } = useToast();

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/automations');
      if (res.data.success) {
        setWorkflows(res.data.automations || []);
      }
    } catch (err) {
      addToast('Failed to load workflows', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    const loadCusts = async () => {
      try {
        const res = await api.get('/customers?limit=20');
        if (res.data.success && res.data.customers?.length > 0) {
          setCustomers(res.data.customers);
          setTestCustomerId(res.data.customers[0]._id);
        }
      } catch (err) {}
    };
    loadCusts();
  }, []);

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.put(`/automations/${id}`, { isActive: !currentActive });
      setWorkflows((prev) =>
        prev.map((w) => (w._id === id ? { ...w, isActive: !currentActive } : w))
      );
      addToast(`Workflow ${!currentActive ? 'activated' : 'paused'}`, 'info');
    } catch (err) {
      addToast('Failed to toggle workflow', 'error');
    }
  };

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/automations', formData);
      if (res.data.success) {
        addToast('Automation workflow created successfully!', 'success');
        setIsModalOpen(false);
        fetchWorkflows();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create workflow', 'error');
    }
  };

  const handleTestExecute = async (workflowId) => {
    if (!testCustomerId) {
      addToast('Please select a test customer first.', 'warning');
      return;
    }
    setExecutingId(workflowId);
    try {
      const res = await api.post(`/automations/${workflowId}/execute`, {
        customerId: testCustomerId
      });
      if (res.data.success) {
        addToast(res.data.message || 'Workflow executed and WhatsApp message delivered!', 'success');
        if (res.data.workflow) {
          setWorkflows((prev) =>
            prev.map((w) => (w._id === workflowId ? { ...w, ...res.data.workflow } : w))
          );
        } else {
          fetchWorkflows();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Execution failed', 'error');
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Zap className="w-3 h-3 text-amber-600" /> EVENT-DRIVEN CADENCE & TRIGGERS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Follow-Up Automation Engine</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Automated WhatsApp cadence workflows triggered by new inquiries, site visits, and booking events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Test Target Selector */}
      {customers.length > 0 && (
        <Card className="p-4 bg-zinc-100 border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-900 font-semibold">
              <Zap className="w-4 h-4 text-zinc-950" />
              <span>Target Customer for "Test Run Trigger" Buttons:</span>
            </div>
            <select
              value={testCustomerId}
              onChange={(e) => setTestCustomerId(e.target.value)}
              className="p-1.5 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-800 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Workflows List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : workflows.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No automated workflows configured"
            description="Create automated WhatsApp cadences for immediate new enquiry follow-up or post-visit reminders."
            actionLabel="Create Workflow"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          workflows.map((wf) => (
            <Card key={wf._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-zinc-950 text-sm">{wf.name}</h3>
                  <Badge variant={wf.isActive ? 'Available' : 'Sold'}>
                    {wf.isActive ? 'Active' : 'Paused'}
                  </Badge>
                  <span className="text-[11px] font-mono text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Trigger: {wf.triggerEvent}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">{wf.description}</p>

                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800 font-mono">
                  {wf.messageBody}
                </div>

                <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" /> Delay: {wf.delayMinutes} mins
                  </span>
                  <span>•</span>
                  <span>Target: {wf.targetSegment}</span>
                  <span>•</span>
                  <span className="text-zinc-900 font-semibold">
                    Executed {wf.executionCount || 0} times
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  icon={Play}
                  isLoading={executingId === wf._id}
                  onClick={() => handleTestExecute(wf._id)}
                  title="Run now on selected test customer"
                >
                  Test Run
                </Button>
                <Button
                  size="sm"
                  variant={wf.isActive ? 'ghost' : 'primary'}
                  onClick={() => handleToggleActive(wf._id, wf.isActive)}
                  className="text-xs"
                >
                  {wf.isActive ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Workflow Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Automated Follow-Up Workflow" size="md">
        <form onSubmit={handleCreateWorkflow} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Workflow Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="e.g. VIP 48h Site Visit Feedback Follow-Up"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Trigger Event *</label>
            <select
              value={formData.triggerEvent}
              onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
            >
              <option value="new_enquiry">When New Enquiry Arrives</option>
              <option value="visit_scheduled">When Site Visit is Scheduled</option>
              <option value="visit_completed">When Site Visit is Completed</option>
              <option value="booking_confirmed">When Property Booking is Confirmed</option>
              <option value="payment_due">When Payment Installment is Due</option>
              <option value="inactive_lead_7d">When Lead is Inactive for 7 Days</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Target Segment</label>
              <select
                value={formData.targetSegment}
                onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
              >
                <option value="All Customers">All Customers</option>
                <option value="Hot Leads Only">Hot Leads Only</option>
                <option value="Active Enquiries">Active Enquiries</option>
                <option value="Unresponsive Leads">Unresponsive Leads</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Delay (Minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.delayMinutes}
                onChange={(e) => setFormData({ ...formData, delayMinutes: Number(e.target.value) })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">WhatsApp Message Body *</label>
            <textarea
              rows={3}
              required
              value={formData.messageBody}
              onChange={(e) => setFormData({ ...formData, messageBody: e.target.value })}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="Use {{customer_name}}, {{property_title}} for personalization..."
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Supported dynamic variables: <code className="text-zinc-900 font-mono">{"{{customer_name}}"}</code>, <code className="text-zinc-900 font-mono">{"{{property_title}}"}</code>, <code className="text-zinc-900 font-mono">{"{{visit_time}}"}</code>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save & Activate Workflow</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
