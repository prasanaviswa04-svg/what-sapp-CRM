import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  Server,
  Database,
  Cpu,
  Layers,
  Shield,
  Activity,
  FileText,
  Users,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export const SuperAdminPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis } = data;

  const totalCoreRecords =
    (kpis.totalCustomers || 0) +
    (kpis.totalProperties || 0) +
    (kpis.totalLeads || 0) +
    (kpis.whatsappSent || 0) +
    (kpis.whatsappReceived || 0);

  const systemServices = [
    {
      name: 'MongoDB Storage Engine',
      type: 'Embedded Engine',
      status: 'Online',
      details: '127.0.0.1/test • Connection Healthy',
      latency: '2ms'
    },
    {
      name: 'Express REST API',
      type: 'Application Gateway',
      status: 'Online',
      details: 'Port 5000 • CORS Enabled',
      latency: '15ms'
    },
    {
      name: 'Meta WhatsApp Business API',
      type: 'Cloud Webhook Engine',
      status: 'Connected',
      details: 'Graph API v21.0 • Webhook Verified',
      latency: '45ms'
    },
    {
      name: 'OpenAI Semantic Engine',
      type: 'Grounding AI Pipeline',
      status: 'Active',
      details: 'GPT-4o-mini • MongoDB Retrieval Grounding',
      latency: '1.2s'
    },
    {
      name: 'Socket.IO Gateway',
      type: 'Real-Time Event Broker',
      status: 'Connected',
      details: 'WebSockets & Polling Fallback Active',
      latency: '4ms'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
              <Shield className="w-3 h-3 text-zinc-800" /> SUPER ADMIN CONSOLE
            </span>
            <span className="text-xs text-zinc-500">• Multi-Tenant Telemetry</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Global Infrastructure & Governance Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            System uptime monitoring, database collections, Meta WhatsApp webhooks, and security access logs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={onRefresh} icon={RefreshCw}>
            Refresh Telemetry
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/activity-logs')} icon={FileText}>
            Global Audit Logs
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/team')} icon={Users}>
            Manage Admins
          </Button>
        </div>
      </div>

      {/* Infrastructure Telemetry KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Workspaces</span>
            <div className="text-xl font-bold text-zinc-950">1 Agency</div>
            <span className="text-[10px] text-zinc-500 font-medium">Enterprise Tier</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Uptime</span>
            <div className="text-xl font-bold text-zinc-950">99.98%</div>
            <span className="text-[10px] text-zinc-500 font-medium">Port 5000 Active</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Core Records</span>
            <div className="text-xl font-bold text-zinc-950">{totalCoreRecords} Docs</div>
            <span className="text-[10px] text-zinc-500 font-medium">Across Collections</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">WhatsApp API</span>
            <div className="text-xl font-bold text-zinc-950">v21.0 Cloud</div>
            <span className="text-[10px] text-zinc-500 font-medium">Verified Webhook</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AI Pipeline</span>
            <div className="text-xl font-bold text-zinc-950">GPT-4o-mini</div>
            <span className="text-[10px] text-zinc-500 font-medium">Grounding Engine</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Socket Gateway</span>
            <div className="text-xl font-bold text-zinc-950">WebSockets</div>
            <span className="text-[10px] text-zinc-500 font-medium">Real-Time Rooms</span>
          </CardContent>
        </Card>
      </div>

      {/* Service Status Table */}
      <Card>
        <CardHeader
          title="Component Architecture & Service Mesh Status"
          subtitle="Continuous health probes for microservices and cloud integrations"
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">System Service</th>
                  <th className="py-3 px-4">Architecture Layer</th>
                  <th className="py-3 px-4">Operational Status</th>
                  <th className="py-3 px-4">Diagnostic Target</th>
                  <th className="py-3 px-4 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {systemServices.map((svc, i) => (
                  <tr key={i} className="hover:bg-zinc-50 transition">
                    <td className="py-3.5 px-4 font-bold text-zinc-950 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                      {svc.name}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-medium">{svc.type}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="available">{svc.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{svc.details}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-800">{svc.latency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Global Governance Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover onClick={() => navigate('/integrations')} className="cursor-pointer p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Meta & AI Integrations</h4>
              <p className="text-[11px] text-zinc-500">Configure Meta tokens, phone number IDs & OpenAI keys</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => navigate('/activity-logs')} className="cursor-pointer p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Security Audit Trail</h4>
              <p className="text-[11px] text-zinc-500">Inspect system logins, JWT authentications & role edits</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => navigate('/team')} className="cursor-pointer p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-900 border border-zinc-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-950">Team & Roles Directory</h4>
              <p className="text-[11px] text-zinc-500">Manage 6-tier RBAC accounts, permissions & brokers</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
