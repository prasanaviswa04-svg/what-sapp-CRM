import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  MessageSquare,
  Bot,
  CalendarCheck,
  Building2,
  HelpCircle,
  Clock,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Headphones
} from 'lucide-react';

export const SupportAgentPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis, upcomingAppointments } = data;

  const [kbSearch, setKbSearch] = useState('');

  const commonFaqs = [
    { title: 'Standard Booking Token Policy', tag: 'Payments', desc: 'Advance booking deposit is ₹10 Lakhs or 5% of property agreement value.' },
    { title: 'Site Visit Timings & Chauffeur Guidelines', tag: 'Visits', desc: 'Complimentary site visits are available daily between 10:00 AM and 6:00 PM.' },
    { title: 'DLF Camellias Floor Plans & Unit Layouts', tag: 'Properties', desc: '4 BHK luxury apartments range from 7,300 to 7,400 sq.ft facing the Arnold Palmer Golf Course.' },
    { title: 'NRI Financing & Repatriation Assistance', tag: 'NRI Services', desc: 'Overseas buyers can finance up to 75% through verified banking partners.' }
  ];

  const filteredFaqs = commonFaqs.filter(f =>
    f.title.toLowerCase().includes(kbSearch.toLowerCase()) ||
    f.desc.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
              <Headphones className="w-3 h-3 text-zinc-800" /> CUSTOMER SUPPORT & INBOUND DISPATCH
            </span>
            <span className="text-xs text-zinc-500">• 24-Hour WhatsApp Service Window</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Inbound WhatsApp Helpdesk & Visit Dispatch
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Manage first-touch client inquiries, answer policy questions with AI grounding, and dispatch site visits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/ai-assistant')} icon={HelpCircle}>
            Knowledge Base
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/properties')} icon={Building2}>
            Check Availability
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/whatsapp')} icon={MessageSquare}>
            Open Live Inbox
          </Button>
        </div>
      </div>

      {/* Support Specific KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Inbound Inquiries</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.whatsappReceived} Messages</div>
            <span className="text-[10px] text-zinc-600 font-medium">WhatsApp Cloud API</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/ai-assistant')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AI Auto-Replies</span>
            <div className="text-xl font-bold text-zinc-950">4 Answered</div>
            <span className="text-[10px] text-zinc-600 font-medium">Grounding Engine</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Dispatched Visits</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.upcomingVisits} Booked</div>
            <span className="text-[10px] text-zinc-600 font-medium">Scheduled Today</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Queue Status</span>
            <div className="text-xl font-bold text-zinc-950">1 Waiting</div>
            <span className="text-[10px] text-zinc-600 font-medium">Under 2 min SLA</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Response Time</span>
            <div className="text-xl font-bold text-zinc-950">&lt; 2 Minutes</div>
            <span className="text-[10px] text-zinc-600 font-medium">High SLA Compliance</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/ai-assistant')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Grounded Policies</span>
            <div className="text-xl font-bold text-zinc-950">6 Articles</div>
            <span className="text-[10px] text-zinc-600 font-medium">Verified FAQs</span>
          </CardContent>
        </Card>
      </div>

      {/* Two Columns: Live WhatsApp Queue & Knowledge Base Grounding Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live Inbound Inquiries */}
        <Card>
          <CardHeader
            title="Live Customer WhatsApp Enquiries"
            subtitle="Immediate response queue for incoming buyer queries"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/whatsapp')}>
                Full Inbox
              </Button>
            }
          />
          <div className="divide-y divide-zinc-200">
            <div
              onClick={() => navigate('/whatsapp')}
              className="p-3.5 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-950">Ananya Deshmukh</span>
                  <span className="text-[9px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.2 rounded font-bold">
                    Takeover Active
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-sm">
                  "Could you share the payment schedule and floor plans for Trump Towers?"
                </p>
              </div>
              <Button size="sm" variant="primary">
                Reply &rarr;
              </Button>
            </div>

            <div
              onClick={() => navigate('/whatsapp')}
              className="p-3.5 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-zinc-950">Vikramaditya Oberoi</span>
                  <span className="text-[9px] bg-zinc-50 text-zinc-600 border border-zinc-200 px-1.5 py-0.2 rounded">
                    AI Auto-Replied
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-sm">
                  "Yes, Saturday 11 AM works perfectly for the site visit."
                </p>
              </div>
              <Button size="sm" variant="outline">
                View Chat &rarr;
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Knowledge Base FAQ Lookup */}
        <Card>
          <CardHeader
            title="Instant Knowledge Base Grounding"
            subtitle="Verified answers on booking policies, payment plans & property rules"
          />
          <CardContent className="p-3.5 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                placeholder="Search policies, advance amounts, visit rules..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950"
              />
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-950">{faq.title}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-white text-zinc-700 border border-zinc-200">
                      {faq.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">{faq.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
