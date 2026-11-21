import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  Users,
  GitBranch,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Clock,
  UserCheck,
  Sparkles,
  ArrowRight,
  Flame,
  Briefcase
} from 'lucide-react';

export const ManagerPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis, latestEnquiries, upcomingAppointments } = data;

  const brokerTeam = [
    { name: 'Rohan Verma', role: 'Property Broker', activeListings: 4, assignedLeads: 6, conversion: '32%', status: 'Active' },
    { name: 'Pooja Sharma', role: 'Sales Agent', activeListings: 2, assignedLeads: 8, conversion: '28%', status: 'Active' },
    { name: 'Aarav Singhania', role: 'Company Admin', activeListings: 6, assignedLeads: 5, conversion: '40%', status: 'Active' },
    { name: 'Sameer Khan', role: 'Customer Support', activeListings: 0, assignedLeads: 4, conversion: '20%', status: 'Active' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-zinc-800" /> OPERATIONS & PIPELINE DIRECTOR
            </span>
            <span className="text-xs text-zinc-500">• Team Oversight</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Sales Operations & Team Management
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Supervise broker deal velocity, allocate new inquiries, audit visit schedules, and monitor sales quotas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/leads')} icon={GitBranch}>
            Pipeline Kanban
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/appointments')} icon={CalendarCheck}>
            Review Visits
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/team')} icon={Users}>
            Manage Team
          </Button>
        </div>
      </div>

      {/* Manager Specific KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card hover onClick={() => navigate('/leads?stage=New+Enquiry')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Action Inquiries</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.newEnquiries} New</div>
            <span className="text-[10px] text-zinc-600 font-medium">Require Allocation</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">High Intent</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.hotLeads} Hot</div>
            <span className="text-[10px] text-zinc-600 font-medium">Score ≥ 70%</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Site Visits</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.upcomingVisits} Booked</div>
            <span className="text-[10px] text-zinc-600 font-medium">Scheduled Showings</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/team')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Team Size</span>
            <div className="text-xl font-bold text-zinc-950">6 Members</div>
            <span className="text-[10px] text-zinc-600 font-medium">Active Staff</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Confirmed Deals</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.confirmedBookings} Bookings</div>
            <span className="text-[10px] text-zinc-600 font-medium">Token Advances</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/analytics')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Conversion Rate</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.conversionRate}</div>
            <span className="text-[10px] text-zinc-600 font-medium">Agency Velocity</span>
          </CardContent>
        </Card>
      </div>

      {/* Broker Workload & Performance Allocation Grid */}
      <Card>
        <CardHeader
          title="Broker Team Performance & Workload Matrix"
          subtitle="Real-time distribution of assigned leads, active listings, and closing rates"
          action={
            <Button size="sm" variant="outline" onClick={() => navigate('/team')}>
              View Full Team
            </Button>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Broker / Agent</th>
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-4">Assigned Leads</th>
                  <th className="py-3 px-4">Managed Listings</th>
                  <th className="py-3 px-4">Closing Rate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {brokerTeam.map((b, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition">
                    <td className="py-3.5 px-4 font-bold text-zinc-950 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 font-bold text-xs flex items-center justify-center text-zinc-900">
                        {b.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span>{b.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-600">{b.role}</td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">{b.assignedLeads} Active Leads</td>
                    <td className="py-3.5 px-4 text-zinc-600">{b.activeListings} Properties</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">{b.conversion}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/leads')}
                        className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:underline"
                      >
                        Reassign Leads &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two Columns: Action Inquiries & Site Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Urgent Inquiries */}
        <Card>
          <CardHeader
            title="Incoming Inquiries Awaiting Allocation"
            subtitle="Prioritize assignment before WhatsApp 24-hr care window expires"
          />
          <div className="divide-y divide-zinc-200">
            {latestEnquiries.map((enq) => (
              <div
                key={enq._id}
                onClick={() => navigate(`/customers/${enq.customerId?._id || ''}`)}
                className="p-3.5 hover:bg-zinc-50 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-950">
                      {enq.customerId?.fullName || enq.title}
                    </span>
                    <Badge variant={enq.priority || 'High'} size="xs">
                      {enq.priority || 'High'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {enq.customerId?.phone} • {enq.customerId?.preferredLocation || 'Gurugram'}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Allocate &rarr;
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Scheduled Site Visits */}
        <Card>
          <CardHeader
            title="Upcoming Client Site Visits"
            subtitle="Confirmed on-site walkthroughs requiring broker presence"
          />
          <div className="divide-y divide-zinc-200">
            {upcomingAppointments.map((app) => (
              <div
                key={app._id}
                onClick={() => navigate('/appointments')}
                className="p-3.5 hover:bg-zinc-50 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-bold text-xs text-zinc-950 block">
                    {app.propertyId?.title || 'Luxury Penthouse'}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Client: {app.customerId?.fullName || 'VIP Buyer'} • {new Date(app.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {app.time}
                  </p>
                </div>
                <Badge variant="available">Confirmed</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
