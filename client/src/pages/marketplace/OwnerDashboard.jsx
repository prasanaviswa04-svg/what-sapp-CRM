import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  MapPin,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('marketplace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyData = async () => {
    const token = localStorage.getItem('marketplace_token');
    if (!token) {
      navigate('/marketplace/login');
      return;
    }

    setLoading(true);
    try {
      const [meRes, subsRes] = await Promise.all([
        api.get('/marketplace/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/marketplace/my-submissions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (meRes.data.success) {
        setUser(meRes.data.user);
        localStorage.setItem('marketplace_user', JSON.stringify(meRes.data.user));
      }
      if (subsRes.data.success) {
        setSubmissions(subsRes.data.submissions || []);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem('marketplace_token');
        navigate('/marketplace/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('marketplace_token');
    localStorage.removeItem('marketplace_user');
    addToast('Signed out of Owner Portal', 'info');
    navigate('/marketplace/login');
  };

  const formatPrice = (p) => {
    if (!p) return 'Price on Request';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lacs`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Published':
        return <Badge variant="Available">Approved & Published</Badge>;
      case 'Verified':
        return <Badge variant="High Intent">Verified</Badge>;
      case 'Information Required':
        return <Badge variant="Urgent">Action Required</Badge>;
      case 'Rejected':
        return <Badge variant="Sold">Rejected</Badge>;
      case 'Under Review':
        return <Badge variant="New">Under Review</Badge>;
      default:
        return <Badge variant="New">New Submission</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'New Submission' || s.status === 'Under Review').length;
  const approvedCount = submissions.filter(s => s.status === 'Approved' || s.status === 'Published').length;
  const actionRequiredCount = submissions.filter(s => s.status === 'Information Required').length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-16">
      {/* Top Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-950 hidden sm:inline">
                EstateFlow Owner Portal
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800">
              Direct Property Owner
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/marketplace/submit-property">
              <Button size="sm" icon={PlusCircle}>
                Submit Property
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={handleLogout} icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                Welcome back, {user?.name || 'Property Owner'}!
              </h1>
              <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Registered WhatsApp: <span className="font-semibold text-zinc-800">{user?.phone}</span> • City: <span className="font-semibold text-zinc-800">{user?.ownerProfile?.currentCity || 'Gurugram'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/marketplace">
              <Button size="sm" variant="outline" icon={ExternalLink}>
                View Public Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Action Required Banner if any */}
        {actionRequiredCount > 0 && (
          <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-xs text-zinc-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-zinc-950 shrink-0" />
              <span>
                <strong>Action Required:</strong> Our verification desk requested additional information on {actionRequiredCount} of your submissions.
              </span>
            </div>
            <span className="font-semibold text-zinc-950 underline cursor-pointer">View Below</span>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Submitted</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{submissions.length}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Properties in system</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Under Review</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{pendingCount}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Being verified by team</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Approved & Published</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{approvedCount}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Live in CRM inventory</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Action Required</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{actionRequiredCount}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Clarification requested</span>
          </Card>
        </div>

        {/* Submissions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-950 tracking-tight">My Property Submissions</h2>
            <Link to="/marketplace/submit-property">
              <Button size="sm" variant="outline" icon={PlusCircle}>
                Add Listing
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-white border border-zinc-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <Card className="p-12 text-center bg-white border-zinc-200 space-y-3">
              <Building2 className="w-10 h-10 text-zinc-300 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-800">No properties submitted yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Submit your residential or commercial property to connect directly with verified buyers and receive WhatsApp status updates.
              </p>
              <div className="pt-2">
                <Link to="/marketplace/submit-property">
                  <Button size="sm">Submit Your First Property</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const p = sub.propertyDetails || {};
                return (
                  <Card key={sub._id} className="p-5 bg-white border-zinc-200 hover:border-zinc-300 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                            {sub.submissionId}
                          </span>
                          <h3 className="font-bold text-sm text-zinc-950">{sub.title}</h3>
                          {getStatusBadge(sub.status)}
                        </div>

                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.address?.locality || 'Gurugram'}, {p.address?.city || 'Gurugram'}</span>
                          <span>•</span>
                          <span>{p.category || 'Apartment'} ({p.purpose || 'Sale'})</span>
                          <span>•</span>
                          <strong className="text-zinc-900 font-semibold">{formatPrice(p.price || p.rentalPrice)}</strong>
                        </p>

                        {/* Reviewer Note Banner if any */}
                        {sub.status === 'Information Required' && sub.verification?.informationRequested && (
                          <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-300 text-xs text-zinc-900 mt-2">
                            <strong>Note from verification desk:</strong> {sub.verification.informationRequested}
                          </div>
                        )}
                        {sub.status === 'Rejected' && sub.verification?.rejectionReason && (
                          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 mt-2">
                            <strong>Reason:</strong> {sub.verification.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link to={`/marketplace/track/${sub.submissionId}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Timeline
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
