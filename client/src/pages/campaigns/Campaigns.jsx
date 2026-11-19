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
  Radio,
  Plus
} from 'lucide-react';

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'All Customers',
    templateName: 'property_showcase_announcement',
    messageContent: '✨ Exclusive Real Estate Announcement: We have just released verified luxury residences with prime Aravalli golf course views. Reply "INFO" for brochure.'
  });

  const { addToast } = useToast();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns || []);
      }
    } catch (err) {
      addToast('Failed to load campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/campaigns', formData);
      if (res.data.success) {
        addToast(res.data.message || 'Broadcast campaign sent!', 'success');
        setIsModalOpen(false);
        fetchCampaigns();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch broadcast', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">WhatsApp Broadcast Campaigns</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Deliver compliant, targeted property announcements to customer segments using approved Meta templates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            New Broadcast Campaign
          </Button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Radio}
            title="No broadcast campaigns dispatched yet"
            description="Send your first property showcase announcement to targeted buyer segments."
            actionLabel="New Campaign"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          campaigns.map((camp) => (
            <Card key={camp._id} className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-zinc-950 text-sm">{camp.title}</h3>
                    <Badge variant={camp.status}>{camp.status}</Badge>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Target: <strong>{camp.targetAudience}</strong> • Dispatched by {camp.createdBy?.firstName || 'Admin'}
                  </p>
                </div>
                <div className="text-xs text-zinc-400">
                  {new Date(camp.scheduledAt || camp.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Message Content */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-800 leading-relaxed font-mono">
                {camp.messageContent}
              </div>

              {/* Delivery Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center text-xs">
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Recipients</span>
                  <span className="text-base font-extrabold text-zinc-950">{camp.stats?.totalRecipients || 0}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Sent</span>
                  <span className="text-base font-extrabold text-zinc-950">{camp.stats?.sentCount || 0}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Delivered</span>
                  <span className="text-base font-extrabold text-zinc-950">{camp.stats?.deliveredCount || 0}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Read</span>
                  <span className="text-base font-extrabold text-zinc-950">{camp.stats?.readCount || 0}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold block">Replies</span>
                  <span className="text-base font-extrabold text-zinc-950">{camp.stats?.repliesCount || 0}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Campaign Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create & Dispatch Broadcast" size="md">
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="e.g. Golf Course Extension Penthouse Launch"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Target Customer Audience *</label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
            >
              <option value="All Customers">All Verified Customers</option>
              <option value="Hot & High Intent Leads">Hot & High Intent Leads Only</option>
              <option value="Luxury Seekers (> ₹2 Cr)">Luxury Seekers (Budget &gt; ₹2 Cr)</option>
              <option value="New Enquiries (Last 7 Days)">New Enquiries (Last 7 Days)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Approved WhatsApp Template</label>
            <input
              type="text"
              value={formData.templateName}
              onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Message Content *</label>
            <textarea
              rows={4}
              required
              value={formData.messageContent}
              onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Supports <code className="text-zinc-900 font-mono">{"{{customer_name}}"}</code> tag.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Dispatch Broadcast Campaign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
