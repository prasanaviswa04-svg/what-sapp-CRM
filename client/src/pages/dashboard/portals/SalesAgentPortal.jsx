import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import {
  CheckSquare,
  Phone,
  MessageSquare,
  Sparkles,
  GitBranch,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  User
} from 'lucide-react';

export const SalesAgentPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis, latestEnquiries } = data;

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Call Vikramaditya Oberoi to confirm 4 BHK Penthouse budget', due: '11:30 AM', priority: 'High', completed: false },
    { id: 2, title: 'Send Trump Towers brochure & payment plan via WhatsApp to Ananya', due: '02:00 PM', priority: 'High', completed: false },
    { id: 3, title: 'Follow-up with Rohan Sharma regarding Dwarka Expressway visit', due: '04:30 PM', priority: 'Medium', completed: false },
    { id: 4, title: 'Update requirements for Godrej Palm Retreat prospect', due: '06:00 PM', priority: 'Low', completed: true }
  ]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-zinc-800" /> SALES AGENT WORKSPACE
            </span>
            <span className="text-xs text-zinc-500">• Daily Pipeline & Tasks</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Daily Sales Pipeline & Follow-Up Engine
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Execute your daily client calls, advance leads through pipeline stages, and share AI-matched recommendations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/tasks')} icon={CheckSquare}>
            My Tasks
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/whatsapp')} icon={MessageSquare}>
            Client WhatsApp
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/leads')} icon={GitBranch}>
            Pipeline Kanban
          </Button>
        </div>
      </div>

      {/* Agent Daily KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card hover onClick={() => navigate('/tasks')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pending Tasks</span>
            <div className="text-xl font-bold text-zinc-950">3 Due Today</div>
            <span className="text-[10px] text-zinc-600 font-medium">Follow-ups</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Unread Chats</span>
            <div className="text-xl font-bold text-zinc-950">2 Waiting</div>
            <span className="text-[10px] text-zinc-600 font-medium">WhatsApp Inbox</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/leads')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Active Pipeline</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.totalLeads} Leads</div>
            <span className="text-[10px] text-zinc-600 font-medium">Assigned to Me</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Showings Booked</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.upcomingVisits} Visits</div>
            <span className="text-[10px] text-zinc-600 font-medium">Site Walkthroughs</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Daily Calling</span>
            <div className="text-xl font-bold text-zinc-950">8 / 10 Calls</div>
            <span className="text-[10px] text-zinc-600 font-medium">80% of Daily Quota</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hot Prospects</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.hotLeads} Hot</div>
            <span className="text-[10px] text-zinc-600 font-medium">Ready to Buy</span>
          </CardContent>
        </Card>
      </div>

      {/* Two Columns: Daily Task Checklist & Active Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Priority Checklist */}
        <Card>
          <CardHeader
            title="Today's Priority Follow-Up Checklist"
            subtitle="Complete client touchpoints to maintain lead momentum"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/tasks')}>
                All Tasks
              </Button>
            }
          />
          <div className="divide-y divide-zinc-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
                  />
                  <div>
                    <span
                      className={`text-xs font-semibold block ${
                        task.completed ? 'line-through text-zinc-400' : 'text-zinc-950'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-zinc-400" /> Due: {task.due}
                    </span>
                  </div>
                </div>

                <Badge variant={task.priority === 'High' ? 'urgent' : 'medium'} size="xs">
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Assigned Inquiries */}
        <Card>
          <CardHeader
            title="My Assigned Priority Inquiries"
            subtitle="Advance these prospects to Requirement Collected or Site Visit"
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/leads')}>
                View Pipeline
              </Button>
            }
          />
          <div className="divide-y divide-zinc-200">
            {latestEnquiries.map((enq) => (
              <div
                key={enq._id}
                className="p-3.5 hover:bg-zinc-50 transition flex items-center justify-between"
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

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/whatsapp')}
                  >
                    WhatsApp &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
