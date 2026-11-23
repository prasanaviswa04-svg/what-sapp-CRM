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

export const CompanyAdminPortal = ({ data = {}, onRefresh }) => {
  const navigate = useNavigate();
  const kpis = {
    totalCustomers: 0,
    totalLeads: 0,
    newEnquiries: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    totalProperties: 0,
    availableProperties: 0,
    soldProperties: 0,
    rentalProperties: 0,
    upcomingVisits: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    whatsappSent: 0,
    whatsappReceived: 0,
    conversionRate: '0%',
    ...(data?.kpis || data?.overview || {})
  };
  const charts = {
    monthlyEnquiries: [],
    leadFunnel: [],
    propertyDistribution: [],
    brokerLeaderboard: [],
    ...(data?.charts || {})
  };
  const latestEnquiries = Array.isArray(data?.latestEnquiries) ? data.latestEnquiries : [];
  const upcomingAppointments = Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : [];

  const MONOCHROME_COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#71717a', '#a1a1aa', '#cbd5e1'];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Quick Actions with Subtle Light Golden Accent */}
      <div className="bg-gradient-to-r from-white via-amber-50/40 to-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        {/* Soft Ambient Light Gold Glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-100/35 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" /> LUXURY REAL ESTATE INTELLIGENCE
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-950">
            Agency Executive Dashboard
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Real-time pipeline analytics, verified revenue collections, team throughput, and property portfolio metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <Button size="sm" variant="outline" onClick={onRefresh} icon={RefreshCw} className="border-amber-200/70 hover:bg-amber-50/50 hover:border-amber-300">
            Refresh
          </Button>
          <Button size="sm" variant="gold" onClick={() => navigate('/customers?action=new')} icon={Plus}>
            New Customer
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/properties?action=new')} icon={Building2} className="border-amber-200/70 hover:bg-amber-50/50 hover:border-amber-300">
            Add Property
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Customers */}
        <Card hover onClick={() => navigate('/customers')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Total Customers</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.totalCustomers}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">Verified contacts</p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Leads */}
        <Card hover onClick={() => navigate('/leads')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Active Leads</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.totalLeads}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">
                {kpis.newEnquiries} New Enquiries
              </p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <GitBranch className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Hot / High Intent */}
        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer bg-gradient-to-br from-amber-50/60 via-white to-amber-50/25 border-amber-200/90 hover:border-amber-400 transition-colors shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900">Hot & High Intent</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.hotLeads}</h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">AI score ≥ 70%</p>
            </div>
            <div className="p-2.5 bg-amber-100/80 text-amber-900 rounded-lg border border-amber-300">
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Available Properties */}
        <Card hover onClick={() => navigate('/properties')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Available Properties</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.availableProperties}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">Total {kpis.totalProperties} listings</p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Confirmed Bookings */}
        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Confirmed Bookings</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.confirmedBookings}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">Conv. Rate: {kpis.conversionRate}</p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Collected with Subtle Golden Card Accent */}
        <Card hover onClick={() => navigate('/payments')} className="cursor-pointer bg-gradient-to-br from-amber-100/50 via-amber-50/35 to-yellow-50/30 border-amber-300 hover:border-amber-400 transition-all shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900">Revenue Collected</p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                ₹{(kpis.totalRevenue / 10000000).toFixed(2)} Cr
              </h3>
              <p className="text-[11px] text-amber-700/90 font-medium mt-1">Verified advances</p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-lg border border-amber-300 shadow-2xs">
              <CreditCard className="w-4 h-4 text-amber-700" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Visits */}
        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Upcoming Site Visits</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.upcomingVisits}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">Scheduled walkthroughs</p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <CalendarCheck className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Activity */}
        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer border-zinc-200/90 hover:border-amber-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">WhatsApp Messages</p>
              <h3 className="text-2xl font-bold text-zinc-950 mt-1">{kpis.whatsappSent + kpis.whatsappReceived}</h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-1">
                {kpis.whatsappSent} sent • {kpis.whatsappReceived} in
              </p>
            </div>
            <div className="p-2.5 bg-amber-50/70 text-amber-900 rounded-lg border border-amber-200/80">
              <MessageSquare className="w-4 h-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Enquiries Bar Chart */}
        <Card className="lg:col-span-2 border-zinc-200/90">
          <CardHeader
            title="Monthly Enquiries Trend"
            subtitle="Verified customer volume captured from WhatsApp and Direct CRM entries"
          />
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyEnquiries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4ede1" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      color: '#09090b',
                      fontSize: '12px',
                      border: '1px solid #fde68a',
                      boxShadow: '0 4px 6px -1px rgb(217 119 6 / 0.1)'
                    }}
                  />
                  <Bar dataKey="enquiries" fill="url(#goldBarGrad)" radius={[4, 4, 0, 0]} name="Enquiries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Pipeline Stages Pie */}
        <Card className="border-zinc-200/90">
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
                      border: '1px solid #fde68a',
                      boxShadow: '0 4px 6px -1px rgb(217 119 6 / 0.1)'
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
        <Card className="border-zinc-200/90">
          <CardHeader
            title="Latest Customer Inquiries"
            subtitle="Recent real estate leads received via WhatsApp"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/leads')} className="border-amber-200/70 hover:bg-amber-50/50 hover:border-amber-300 text-amber-950 font-medium">
                View All Leads
              </Button>
            }
          />
          <div className="divide-y divide-amber-100/60">
            {latestEnquiries.map((enq) => (
              <div
                key={enq._id}
                onClick={() => navigate(`/customers/${enq.customerId?._id || ''}`)}
                className="p-4 hover:bg-amber-50/30 transition cursor-pointer flex items-center justify-between"
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
                  <span className="text-[10px] text-amber-800/80 font-medium">Score: {enq.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Site Visits */}
        <Card className="border-zinc-200/90">
          <CardHeader
            title="Upcoming Site Visits"
            subtitle="Confirmed on-site property walkthroughs"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/appointments')} className="border-amber-200/70 hover:bg-amber-50/50 hover:border-amber-300 text-amber-950 font-medium">
                Calendar View
              </Button>
            }
          />
          <div className="divide-y divide-amber-100/60">
            {upcomingAppointments.map((app) => (
              <div
                key={app._id}
                onClick={() => navigate('/appointments')}
                className="p-4 hover:bg-amber-50/30 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-zinc-950 block">
                    {app.propertyId?.title || 'Luxury Residence'}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Client: {app.customerId?.fullName || 'VIP Buyer'} • {new Date(app.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {app.time}
                  </p>
                </div>
                <Badge variant="gold">Confirmed</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
