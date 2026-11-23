import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Users,
  Sparkles
} from 'lucide-react';

export const TeamManagement = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Property Broker',
    password: ''
  });

  const { addToast } = useToast();

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await api.get('/team');
      if (res.data.success) {
        setTeam(res.data.team || []);
      }
    } catch (err) {
      addToast('Failed to load team', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/team', formData);
      if (res.data.success) {
        addToast('Team member added successfully!', 'success');
        setIsModalOpen(false);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'Property Broker', password: '' });
        fetchTeam();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add team member', 'error');
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      await api.put(`/team/${member._id}/status`);
      addToast(`Member status updated`, 'success');
      fetchTeam();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Users className="w-3 h-3 text-amber-600" /> AGENCY DIRECTORY & PERMISSIONS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Team & Broker Management</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage real estate brokers, sales agents, role permissions, and lead assignment workloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gold" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team Roster */}
      <Card>
        <CardHeader title="Brokerage Staff Roster" subtitle={`${team.length} registered agents & administrators`} />
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/50 text-amber-950 uppercase tracking-wider font-semibold border-b border-amber-200/80">
                <tr>
                  <th className="py-3 px-4">Member Name & Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Leads</th>
                  <th className="py-3 px-4">Assigned Listings</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {team.map((member) => (
                  <tr key={member._id} className="hover:bg-amber-50/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#ffedd5] text-[#7c2d12] border border-[#ff9e43] font-bold flex items-center justify-center text-xs shadow-2xs">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-950">{member.name}</div>
                          <div className="text-[11px] text-zinc-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-800">
                      <Badge variant="qualified">{member.role}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">{member.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-medium text-zinc-800">
                      {member.activeLeadsCount || 0} Leads
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-800">
                      {member.assignedPropertiesCount || 0} Listings
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={member.isActive ? 'available' : 'sold'}>
                        {member.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 hover:underline"
                      >
                        {member.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member" size="md">
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Priya"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="e.g. Singhania"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Business Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="priya@estateflow.io"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none bg-white text-zinc-900"
              >
                <option value="Property Broker">Property Broker</option>
                <option value="Real Estate Manager">Real Estate Manager</option>
                <option value="Sales Agent">Sales Agent</option>
                <option value="Customer Support Agent">Customer Support Agent</option>
                <option value="Company Admin">Company Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">Initial Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Team Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
