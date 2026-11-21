import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Building2,
  PlusCircle,
  FileText,
  LogOut,
  MapPin,
  ExternalLink,
  MessageSquare,
  Award,
  DollarSign,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const BrokerDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('marketplace_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'requirements'

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
    addToast('Signed out of Broker Portal', 'info');
    navigate('/marketplace/login');
  };

  const formatPrice = (p) => {
    if (!p) return 'Price on Request';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lacs`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  const propertyListings = submissions.filter(s => s.submissionCategory === 'Property');
  const clientRequirements = submissions.filter(s => s.submissionCategory === 'Requirement');
  const approvedCount = submissions.filter(s => s.status === 'Approved' || s.status === 'Published').length;

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
      default:
        return <Badge variant="New">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/marketplace" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-950 hidden sm:inline">
                EstateFlow Broker Network Portal
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800">
              Certified Partner
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/marketplace/submit-property">
              <Button size="sm" icon={PlusCircle}>
                Add Listing
              </Button>
            </Link>
            <Link to="/marketplace/submit-requirement">
              <Button size="sm" variant="outline" icon={FileText} className="hidden sm:inline-flex">
                Post Requirement
              </Button>
            </Link>
            <Button size="sm" variant="outline" onClick={handleLogout} icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Broker Agency Hero Banner */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                {user?.brokerProfile?.companyName || user?.name || 'Broker Partner'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-white">
                Partner Broker
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Contact: <strong className="text-zinc-800">{user?.name}</strong> ({user?.phone})</span>
              <span>•</span>
              {user?.brokerProfile?.reraNumber && (
                <>
                  <span className="font-mono text-zinc-700 font-semibold">{user.brokerProfile.reraNumber}</span>
                  <span>•</span>
                </>
              )}
              <span>Experience: {user?.brokerProfile?.yearsExperience || 5} Yrs</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/marketplace/submit-requirement">
              <Button size="sm" variant="outline">
                + Submit Buyer Requirement
              </Button>
            </Link>
            <Link to="/marketplace/submit-property">
              <Button size="sm">
                + Submit Property Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Submitted Listings</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{propertyListings.length}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Properties under management</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Client Requirements</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{clientRequirements.length}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Active buyers / tenants</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">CRM Approved & Live</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">{approvedCount}</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Published to inventory</span>
          </Card>

          <Card className="p-4 bg-white border-zinc-200">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">WhatsApp Updates</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">Live</p>
            <span className="text-[11px] text-zinc-500 mt-1 block">Direct to {user?.phone}</span>
          </Card>
        </div>

        {/* Tabbed View: Properties vs Requirements */}
        <div className="space-y-4">
          <div className="flex border-b border-zinc-200 gap-2">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'properties'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>My Property Listings ({propertyListings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'requirements'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Submitted Client Requirements ({clientRequirements.length})</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-white border border-zinc-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'properties' ? (
            propertyListings.length === 0 ? (
              <Card className="p-10 text-center bg-white border-zinc-200 space-y-3">
                <Building2 className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800">No properties submitted yet</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Submit your luxury listings, plots, or commercial suites for verification.
                </p>
                <Link to="/marketplace/submit-property">
                  <Button size="sm">Submit Listing</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {propertyListings.map((sub) => {
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
                            <span>{p.category || 'Apartment'}</span>
                            <span>•</span>
                            <strong className="text-zinc-900 font-semibold">{formatPrice(p.price || p.rentalPrice)}</strong>
                          </p>
                        </div>

                        <Link to={`/marketplace/track/${sub.submissionId}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Track Status
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          ) : (
            clientRequirements.length === 0 ? (
              <Card className="p-10 text-center bg-white border-zinc-200 space-y-3">
                <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800">No client requirements submitted</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Have a high-net-worth buyer or corporate tenant looking for space? Post their requirement for instant CRM matching.
                </p>
                <Link to="/marketplace/submit-requirement">
                  <Button size="sm">Submit Client Requirement</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {clientRequirements.map((sub) => {
                  const r = sub.requirementDetails || {};
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
                            <span>Client: <strong className="text-zinc-800">{r.clientName}</strong></span>
                            <span>•</span>
                            <span>Budget: <strong className="text-zinc-900 font-semibold">{formatPrice(r.budgetMax || r.budgetMin)}</strong></span>
                            <span>•</span>
                            <span>Locations: {r.preferredLocations?.join(', ') || 'Gurugram'}</span>
                          </p>
                        </div>

                        <Link to={`/marketplace/track/${sub.submissionId}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Track Status
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};
