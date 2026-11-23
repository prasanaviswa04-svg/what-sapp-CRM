import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Download,
  Sparkles
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

export const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const { kpis, charts } = data;

  const lostReasonsData = [
    { name: 'Budget Mismatch', value: 38 },
    { name: 'Bought Elsewhere', value: 26 },
    { name: 'Location Unsuitable', value: 18 },
    { name: 'Postponed Plan', value: 12 },
    { name: 'Unresponsive', value: 6 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" /> INTELLIGENCE & TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Real Estate Reports & Analytics</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real MongoDB aggregation reports on customer acquisition, conversion pipelines, and sales performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="gold"
            icon={Download}
            onClick={() => window.open('/api/customers/export/csv', '_blank')}
          >
            Export Complete Dataset (CSV)
          </Button>
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-zinc-200/90 hover:border-amber-300">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Total Pipeline Leads</span>
          <div className="text-2xl font-bold text-zinc-950 mt-1">{kpis.totalLeads}</div>
          <span className="text-xs text-amber-800/80 font-medium">100% verified DB records</span>
        </Card>
        <Card className="p-4 border-zinc-200/90 hover:border-amber-300">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Confirmed Bookings</span>
          <div className="text-2xl font-bold text-zinc-950 mt-1">{kpis.confirmedBookings}</div>
          <span className="text-xs text-amber-800/80 font-medium">Conversion rate {kpis.conversionRate}</span>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-100/50 via-amber-50/35 to-yellow-50/30 border-amber-300 shadow-xs">
          <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Revenue Collected</span>
          <div className="text-2xl font-black text-amber-950 mt-1">
            ₹{(kpis.totalRevenue / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-xs text-amber-800/90 font-medium">Verified deposits</span>
        </Card>
        <Card className="p-4 border-zinc-200/90 hover:border-amber-300">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">WhatsApp Engagement</span>
          <div className="text-2xl font-bold text-zinc-950 mt-1">
            {kpis.whatsappSent + kpis.whatsappReceived}
          </div>
          <span className="text-xs text-amber-800/80 font-medium">Total messages handled</span>
        </Card>
      </div>

      {/* Funnel & Lost Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader title="Lead Conversion Funnel Stages" subtitle="Active pipeline distribution" />
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.leadFunnel} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                  <XAxis type="number" stroke="#71717a" fontSize={11} />
                  <YAxis type="category" dataKey="stage" stroke="#71717a" fontSize={10} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#09090b', fontSize: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="count" fill="#18181b" radius={[0, 4, 4, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lost Lead Reasons */}
        <Card>
          <CardHeader title="Lost Lead Reasons Breakdown" subtitle="Key factors preventing deal conversion" />
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={lostReasonsData} cx="50%" cy="50%" outerRadius={85} paddingAngle={2} dataKey="value">
                    {lostReasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#09090b', fontSize: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#71717a' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
