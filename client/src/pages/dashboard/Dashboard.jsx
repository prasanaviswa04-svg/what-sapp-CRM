import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Users,
  GitBranch,
  Building2,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Sparkles,
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Flame,
  Radio,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#0D9488', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, recentActivities, latestEnquiries, upcomingAppointments, recentBookings } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 to-navy-800 p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-semibold">
              Live Real Estate Hub
            </span>
            <span className="text-xs text-slate-300">| Auto-synced with Meta WhatsApp API</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">Executive CRM Dashboard</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time pipeline analytics, WhatsApp customer interactions, and property conversions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            icon={RefreshCw}
            className="bg-navy-800 text-white border-navy-700 hover:bg-navy-700 hover:text-white"
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/customers?action=new')}
            icon={Plus}
            className="bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold"
          >
            New Customer
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/properties?action=new')}
            icon={Building2}
            className="bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold"
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Customers */}
        <Card hover onClick={() => navigate('/customers')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Customers</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalCustomers}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> All active contacts
              </p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Leads */}
        <Card hover onClick={() => navigate('/leads')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Pipeline Leads</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalLeads}</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">
                {kpis.newEnquiries} New Enquiries
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <GitBranch className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Hot / High Intent */}
        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Hot & High Intent Leads</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{kpis.hotLeads}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                AI score ≥ 70% intent
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Available Properties */}
        <Card hover onClick={() => navigate('/properties')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Available Properties</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.availableProperties}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Total {kpis.totalProperties} listings
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Bookings */}
        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Confirmed Bookings</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{kpis.confirmedBookings}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                Conversion Rate: {kpis.conversionRate}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Collected */}
        <Card hover onClick={() => navigate('/payments')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Revenue Collected</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                ₹{(kpis.totalRevenue / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Verified advances & milestones</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Upcoming Site Visits</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.upcomingVisits}</h3>
              <p className="text-[11px] text-teal-600 font-medium mt-1">VIP walkthroughs booked</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Activity */}
        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">WhatsApp Messages</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{kpis.whatsappSent + kpis.whatsappReceived}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {kpis.whatsappSent} sent • {kpis.whatsappReceived} received
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Enquiries Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly Customer Enquiries"
            subtitle="Volume of real estate inquiries captured via WhatsApp & webforms"
          />
          <CardContent className="pt-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyEnquiries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="enquiries" fill="#0D9488" radius={[6, 6, 0, 0]} name="Enquiries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Category Distribution Pie Chart */}
        <Card>
          <CardHeader
            title="Inventory by Category"
            subtitle="Verified listings across residential & commercial"
          />
          <CardContent className="pt-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.propertyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.propertyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables & Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Customer Enquiries */}
        <Card>
          <CardHeader
            title="Latest Customer Enquiries"
            subtitle="Direct inquiries received via WhatsApp and forms"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/customers')}>
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestEnquiries.map((cust) => (
                  <tr
                    key={cust._id}
                    onClick={() => navigate(`/customers/${cust._id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{cust.fullName}</div>
                      <div className="text-slate-400 text-[11px]">{cust.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {cust.preferredLocation || 'Gurugram'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {cust.requirements?.maxBudget
                        ? `₹${(cust.requirements.maxBudget / 10000000).toFixed(2)} Cr`
                        : 'Flexible'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={cust.priority}>{cust.priority}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upcoming Site Visits */}
        <Card>
          <CardHeader
            title="Upcoming Property Site Visits"
            subtitle="Scheduled client walkthroughs"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/appointments')}>
                Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No upcoming visits scheduled.</div>
            ) : (
              upcomingAppointments.map((app) => (
                <div key={app._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 mt-0.5">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{app.propertyId?.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(app.visitDate).toLocaleDateString()} at {app.visitTime} • Client: {app.customerId?.fullName}
                      </p>
                    </div>
                  </div>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Broker Performance Leaderboard */}
      <Card>
        <CardHeader
          title="Broker Performance Leaderboard"
          subtitle="Top sales performance, active leads, and confirmed property bookings"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Broker Name</th>
                <th className="py-3 px-4">Active Leads</th>
                <th className="py-3 px-4">Confirmed Bookings</th>
                <th className="py-3 px-4">Estimated Property Value</th>
                <th className="py-3 px-4">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {charts.brokerLeaderboard.map((broker, idx) => (
                <tr key={broker.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-bold text-slate-400">#{idx + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-navy-900 text-teal-400 font-bold flex items-center justify-center text-xs">
                        {broker.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-slate-800">{broker.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">{broker.leadsCount} Active Leads</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{broker.bookingsCount} Bookings</td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    ₹{(broker.revenueGenerated / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={idx === 0 ? 'High Intent' : 'Qualified'}>
                      {idx === 0 ? 'Top Performer' : 'Active Broker'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
