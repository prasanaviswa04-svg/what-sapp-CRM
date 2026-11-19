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
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Flame,
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
  Legend
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

  // Minimalist Monochrome Palette for Charts (Light / Soft Charcoal)
  const MONOCHROME_COLORS = ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#cbd5e1', '#e2e8f0'];

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, charts, latestEnquiries, upcomingAppointments } = data;

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-medium">
              REAL ESTATE CRM
            </span>
            <span className="text-xs text-zinc-500">• Meta WhatsApp Cloud API Active</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">Executive Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Real-time pipeline analytics, customer communications, and property conversion metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/customers?action=new')}
            icon={Plus}
          >
            New Customer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/properties?action=new')}
            icon={Building2}
          >
            Add Property
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Customers */}
        <Card hover onClick={() => navigate('/customers')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Total Customers</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.totalCustomers}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">Verified contacts</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <Users className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Total Leads */}
        <Card hover onClick={() => navigate('/leads')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Active Leads</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.totalLeads}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">
                {kpis.newEnquiries} New Enquiries
              </p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <GitBranch className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Hot / High Intent */}
        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Hot & High Intent</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.hotLeads}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">AI score ≥ 70%</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <Flame className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Available Properties */}
        <Card hover onClick={() => navigate('/properties')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Available Properties</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.availableProperties}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">Total {kpis.totalProperties} listings</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <Building2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Bookings */}
        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Confirmed Bookings</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.confirmedBookings}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">Conv. Rate: {kpis.conversionRate}</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Collected */}
        <Card hover onClick={() => navigate('/payments')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Revenue Collected</p>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 mt-1">
                ₹{(kpis.totalRevenue / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">Verified advances</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Upcoming Site Visits</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.upcomingVisits}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">Scheduled walkthroughs</p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Activity */}
        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">WhatsApp Messages</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.whatsappSent + kpis.whatsappReceived}</h3>
              <p className="text-[11px] text-zinc-600 font-medium mt-1">
                {kpis.whatsappSent} sent • {kpis.whatsappReceived} in
              </p>
            </div>
            <div className="p-2.5 bg-zinc-100 text-zinc-900 rounded-lg border border-zinc-200">
              <MessageSquare className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monochrome Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Enquiries Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly Customer Enquiries"
            subtitle="Volume of inquiries captured via WhatsApp & webforms"
          />
          <CardContent className="pt-3">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyEnquiries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', color: '#18181b', fontSize: '11px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    cursor={{ fill: '#f4f4f5' }}
                  />
                  <Bar dataKey="enquiries" fill="#3f3f46" radius={[4, 4, 0, 0]} name="Enquiries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Property Category Distribution Pie Chart */}
        <Card>
          <CardHeader
            title="Inventory Distribution"
            subtitle="Verified listings by category"
          />
          <CardContent className="pt-3">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.propertyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.propertyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '6px', color: '#18181b', fontSize: '11px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Latest Customer Enquiries */}
        <Card>
          <CardHeader
            title="Recent Customer Inquiries"
            subtitle="Direct customer leads received via WhatsApp"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/customers')}>
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Locality</th>
                  <th className="py-2.5 px-4">Budget</th>
                  <th className="py-2.5 px-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {latestEnquiries.map((cust) => (
                  <tr
                    key={cust._id}
                    onClick={() => navigate(`/customers/${cust._id}`)}
                    className="hover:bg-zinc-50 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-zinc-900">{cust.fullName}</div>
                      <div className="text-zinc-500 text-[11px] font-mono">{cust.phone}</div>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-600">
                      {cust.preferredLocation || 'Gurugram'}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-900 font-bold">
                      {cust.requirements?.maxBudget
                        ? `₹${(cust.requirements.maxBudget / 10000000).toFixed(2)} Cr`
                        : 'Open'}
                    </td>
                    <td className="py-2.5 px-4">
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
            title="Upcoming Site Walkthroughs"
            subtitle="Confirmed client appointments"
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/appointments')}>
                Calendar <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            }
          />
          <div className="divide-y divide-zinc-100">
            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">No upcoming visits scheduled.</div>
            ) : (
              upcomingAppointments.map((app) => (
                <div key={app._id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 mt-0.5 border border-zinc-200">
                      <CalendarCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">{app.propertyId?.title}</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
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
          subtitle="Sales figures, active leads, and confirmed property bookings"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Rank & Broker</th>
                <th className="py-2.5 px-4">Active Leads</th>
                <th className="py-2.5 px-4">Confirmed Bookings</th>
                <th className="py-2.5 px-4">Estimated Property Value</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {charts.brokerLeaderboard.map((broker, idx) => (
                <tr key={broker.id} className="hover:bg-zinc-50 transition">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-mono font-bold text-zinc-400">#{idx + 1}</span>
                      <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-300 text-zinc-900 font-bold flex items-center justify-center text-[10px]">
                        {broker.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-semibold text-zinc-900">{broker.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-600">{broker.leadsCount} Leads</td>
                  <td className="py-2.5 px-4 font-bold text-zinc-950">{broker.bookingsCount} Bookings</td>
                  <td className="py-2.5 px-4 font-bold text-zinc-950">
                    ₹{(broker.revenueGenerated / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="py-2.5 px-4">
                    <Badge variant={idx === 0 ? 'available' : 'qualified'}>
                      {idx === 0 ? 'Top Performer' : 'Active'}
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
