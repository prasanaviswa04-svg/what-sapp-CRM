import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import {
  Building2,
  Store,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Sparkles,
  Phone,
  MessageSquare,
  FileCheck,
  Send,
  PlusCircle,
  Clock
} from 'lucide-react';

export const MarketplaceLanding = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchPublicListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marketplace/public/listings', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery || undefined
        }
      });
      if (res.data.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicListings();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPublicListings();
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/marketplace/track/${trackingId.trim().toUpperCase()}`);
    }
  };

  const formatPrice = (p) => {
    if (!p) return 'Price on Request';
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lacs`;
    return `₹${p.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Marketplace Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
              <Store className="w-4 h-4 text-white stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-950 block leading-tight">
                EstateFlow Marketplace
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                Multi-Vendor Real Estate & Broker Network
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/marketplace/track">
              <Button size="sm" variant="ghost" className="text-xs text-zinc-600 hover:text-zinc-950">
                Track Status
              </Button>
            </Link>
            <Link to="/marketplace/login">
              <Button size="sm" variant="outline" className="text-xs">
                Portal Sign In
              </Button>
            </Link>
            <Link to="/dashboard" className="hidden md:inline-flex">
              <Button size="sm" className="text-xs bg-zinc-900 text-white hover:bg-zinc-800">
                CRM Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-zinc-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Direct Property Owner & Broker Co-Listing Exchange</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
              Centralized Real Estate Multi-Vendor Marketplace
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl">
              Connect directly with our luxury brokerage network. Property owners list with zero hassle, brokers submit multi-listings and buyer requirements, and our AI automated CRM matches opportunities in real time.
            </p>
          </div>

          {/* Quick Registration & Submission Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {/* Owner Card */}
            <Card className="p-5 border-zinc-200 hover:border-zinc-400 transition hover:shadow-xs group">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-950 mb-3 group-hover:bg-zinc-900 group-hover:text-white transition">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-950">For Property Owners</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Submit your flat, villa, land, or commercial unit for verified sale or rental with WhatsApp updates.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link to="/marketplace/submit-property" className="flex-1">
                  <Button size="sm" className="w-full text-xs">
                    List Property <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                <Link to="/marketplace/register/owner">
                  <Button size="sm" variant="outline" className="text-xs">
                    Register
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Broker Card */}
            <Card className="p-5 border-zinc-200 hover:border-zinc-400 transition hover:shadow-xs group">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-950 mb-3 group-hover:bg-zinc-900 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-950">For Real Estate Brokers & Agents</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Join our broker network, submit inventory, register active buyer requirements, and co-broker transactions.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link to="/marketplace/register/broker" className="flex-1">
                  <Button size="sm" className="w-full text-xs">
                    Join Broker Network <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                <Link to="/marketplace/submit-requirement">
                  <Button size="sm" variant="outline" className="text-xs" title="Submit Buyer Requirement">
                    Post Lead
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Track Status Card */}
            <Card className="p-5 border-zinc-200 bg-zinc-50/60">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-zinc-950">Track Existing Submission</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Enter your reference ID (e.g. <span className="font-mono text-zinc-800 font-semibold">SUB-2026-0001</span>) to view review & publishing progress.
              </p>
              <form onSubmit={handleTrackSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="SUB-2026-XXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1 p-1.5 text-xs font-mono uppercase border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
                />
                <Button size="sm" type="submit" variant="outline">
                  Track
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">Verified Marketplace Listings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Inspected and approved properties submitted by verified direct owners and certified network brokers.
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
              />
            </div>
            <Button size="sm" type="submit">
              Search
            </Button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['All', 'Apartment', 'Penthouse', 'Villa', 'Commercial', 'Land'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <Building2 className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-sm text-zinc-800">No published listings in this filter</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first to list a property in this category or submit your client requirements!
            </p>
            <div className="pt-2">
              <Link to="/marketplace/submit-property">
                <Button size="sm">Submit a Property Listing</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => {
              const p = item.propertyDetails || {};
              const img = p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80';
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs hover:border-zinc-300 transition flex flex-col group"
                >
                  <div className="relative h-48 bg-zinc-100 overflow-hidden">
                    <img
                      src={img}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-zinc-950 shadow-2xs">
                        {p.category || 'Residential'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-950 text-white shadow-2xs">
                        {p.purpose || 'Sale'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                        {item.source}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-400">{item.submissionId}</span>
                        <span className="text-sm font-black text-zinc-950">
                          {p.purpose === 'Rent'
                            ? `${formatPrice(p.rentalPrice)}/mo`
                            : formatPrice(p.price)}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-zinc-950 mt-1 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{p.address?.locality}, {p.address?.city}</span>
                      </p>
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-100 text-[11px] text-zinc-600">
                      {p.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.bedrooms} BHK</span>
                        </div>
                      )}
                      {p.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.bathrooms} Baths</span>
                        </div>
                      )}
                      {p.builtUpArea > 0 && (
                        <div className="flex items-center gap-1">
                          <Maximize className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{p.builtUpArea} {p.areaUnit || 'sqft'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-400">
                        Listed by: <strong className="text-zinc-700 font-semibold">{item.submitterName}</strong>
                      </span>
                      <a
                        href={`https://wa.me/?text=Hello! I am interested in ${encodeURIComponent(item.title)} (Ref: ${item.submissionId}) listed on EstateFlow Marketplace.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 transition"
                      >
                        <MessageSquare className="w-3 h-3" /> Inquire
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 py-8 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EstateFlow Luxury Realty & Broker Marketplace Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/marketplace/submit-property" className="hover:text-zinc-950 font-medium">Submit Listing</Link>
            <Link to="/marketplace/submit-requirement" className="hover:text-zinc-950 font-medium">Post Requirement</Link>
            <Link to="/marketplace/login" className="hover:text-zinc-950 font-medium">Partner Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
