import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  FileText,
  User,
  Clock,
  Filter,
  CheckCircle2,
  Building2,
  CalendarCheck
} from 'lucide-react';

export const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/activity-logs', {
        params: { entityType: entityFilter, limit: 50 }
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Activity & Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit record of user logins, WhatsApp communications, booking approvals, and CRM changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Entities</option>
            <option value="Customer">Customer</option>
            <option value="Lead">Lead</option>
            <option value="Property">Property</option>
            <option value="Booking">Booking</option>
            <option value="Payment">Payment</option>
            <option value="User">User / Auth</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader title="Audit Trail" subtitle={`Showing ${logs.length} most recent platform events`} />
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No activity logged for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.userName || 'System Bot'}
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-sans font-medium">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
