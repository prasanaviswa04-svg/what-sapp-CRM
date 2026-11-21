import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
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
  Flame,
  RefreshCw,
  Sparkles,
  Download
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

export const CompanyAdminPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis, charts, latestEnquiries, upcomingAppointments } = data;

  const MONOCHROME_COLORS = ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#cbd5e1', '#e2e8f0'];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-medium">
              COMPANY ADMIN • AGENCY LEADERSHIP
            </span>
            <span className="text-xs text-zinc-500">• Meta WhatsApp Cloud API Active</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Agency Executive Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Real-time pipeline analytics, verified revenue collections, team throughput, and property portfolio metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} icon={RefreshCw}>
            Refresh
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/customers?action=new')} icon={Plus}>
            New Customer
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/properties?action=new')} icon={Building2}>
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
            title="Monthly Enquiries Trend"
            subtitle="Verified customer volume captured from WhatsApp and Direct CRM entries"
          />
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyEnquiries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      color: '#09090b',
                      fontSize: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                    }}
                  />
                  <Bar dataKey="enquiries" fill="#18181b" radius={[4, 4, 0, 0]} name="Enquiries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Pipeline Stages Pie */}
        <Card>
          <CardHeader title="Pipeline Distribution" subtitle="Active deals across sales funnel" />
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.leadFunnel}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {charts.leadFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      color: '#09090b',
                      fontSize: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', color: '#71717a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Latest Enquiries & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Latest Customer Enquiries */}
        <Card>
          <CardHeader
            title="Latest Customer Inquiries"
            subtitle="Recent real estate leads received via WhatsApp"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/leads')}>
                View All Leads
              </Button>
            }
          />
          <div className="divide-y divide-zinc-200">
            {latestEnquiries.map((enq) => (
              <div
                key={enq._id}
                onClick={() => navigate(`/customers/${enq.customerId?._id || ''}`)}
                className="p-4 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-between"
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
                <div className="text-right">
                  <span className="text-xs font-semibold text-zinc-950 block">{enq.stage}</span>
                  <span className="text-[10px] text-zinc-600 font-medium">Score: {enq.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Site Visits */}
        <Card>
          <CardHeader
            title="Upcoming Site Visits"
            subtitle="Confirmed on-site property walkthroughs"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/appointments')}>
                Calendar View
              </Button>
            }
          />
          <div className="divide-y divide-zinc-200">
            {upcomingAppointments.map((app) => (
              <div
                key={app._id}
                onClick={() => navigate('/appointments')}
                className="p-4 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-zinc-950 block">
                    {app.propertyId?.title || 'Luxury Residence'}
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
