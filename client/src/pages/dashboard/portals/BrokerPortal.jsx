import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { handleImageError, getPropertyFallbackImage } from '../../../utils/propertyImages';
import {
  Building2,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  Share2,
  MapPin,
  Flame,
  CheckCircle2,
  Plus,
  Briefcase
} from 'lucide-react';

export const BrokerPortal = ({ data, onRefresh }) => {
  const navigate = useNavigate();
  const { kpis, upcomingAppointments } = data;

  const luxuryListings = [
    {
      _id: 'camellias-101',
      code: 'EF-APT-101',
      title: 'DLF The Camellias - Ultra Luxury Penthouse',
      locality: 'Golf Course Road, Gurugram',
      price: '₹18.50 Cr',
      bhk: '4 BHK',
      area: '7,300 sq.ft',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    },
    {
      _id: 'trump-towers-303',
      code: 'EF-APT-303',
      title: 'Trump Towers - Iconic High Rise Suite',
      locality: 'Sector 65, Gurugram',
      price: '₹7.50 Cr',
      bhk: '3 BHK',
      area: '3,500 sq.ft',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
    },
    {
      _id: 'aravalli-villa-202',
      code: 'EF-VIL-202',
      title: 'Aravalli Greens Luxury Eco Villa',
      locality: 'Sohna Road, Gurugram',
      price: '₹12.00 Cr',
      bhk: '5 BHK',
      area: '6,500 sq.yd',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl text-zinc-900 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded-md font-mono font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-zinc-800" /> LUXURY BROKER PORTAL
            </span>
            <span className="text-xs text-zinc-500">• Deal Closing & Showings</span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight text-zinc-950">
            Luxury Listings & Deal Closing Suite
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 tracking-tight">
            Manage your exclusive portfolio, conduct client site visits, negotiate on WhatsApp, and confirm bookings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/whatsapp')} icon={MessageSquare}>
            WhatsApp Chats
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/properties?action=new')} icon={Plus}>
            Add Listing
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/appointments?action=new')} icon={CalendarCheck}>
            Schedule Showing
          </Button>
        </div>
      </div>

      {/* Broker KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card hover onClick={() => navigate('/properties')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">My Listings</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.availableProperties} Properties</div>
            <span className="text-[10px] text-zinc-600 font-medium">Verified Freehold</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/leads?priority=High')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hot Buyers</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.hotLeads} Qualified</div>
            <span className="text-[10px] text-zinc-600 font-medium">Budget &gt; ₹5 Cr</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/appointments')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Showings</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.upcomingVisits} Visits</div>
            <span className="text-[10px] text-zinc-600 font-medium">Today / This Week</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/bookings')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Advances</span>
            <div className="text-xl font-bold text-zinc-950">{kpis.confirmedBookings} Closed</div>
            <span className="text-[10px] text-zinc-600 font-medium">Tokens Received</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/whatsapp')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Live Takeovers</span>
            <div className="text-xl font-bold text-zinc-950">2 Chats</div>
            <span className="text-[10px] text-zinc-600 font-medium">Active Broker Chat</span>
          </CardContent>
        </Card>

        <Card hover onClick={() => navigate('/matching')} className="cursor-pointer">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Top Match</span>
            <div className="text-xl font-bold text-zinc-950">100% Score</div>
            <span className="text-[10px] text-zinc-600 font-medium">Trump Towers</span>
          </CardContent>
        </Card>
      </div>

      {/* Exclusive Property Portfolio (Ready to share into WhatsApp) */}
      <Card>
        <CardHeader
          title="My Luxury Property Portfolio"
          subtitle="One-click sharing into client WhatsApp chats and site visit bookings"
          action={
            <Button size="sm" variant="outline" onClick={() => navigate('/properties')}>
              View All Listings
            </Button>
          }
        />
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {luxuryListings.map((prop) => (
              <div
                key={prop._id}
                className="rounded-xl border border-zinc-200 overflow-hidden bg-white hover:border-zinc-950 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-100">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      onError={(e) => handleImageError(e, 'Apartment', prop.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-zinc-950 border border-zinc-200">
                        {prop.code}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <Badge variant="available">{prop.status}</Badge>
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="font-bold text-zinc-950 text-xs leading-snug truncate">{prop.title}</h4>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" /> {prop.locality}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-extrabold text-zinc-950">{prop.price}</span>
                      <span className="text-[11px] text-zinc-600 font-medium">
                        {prop.bhk} • {prop.area}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-[11px]"
                    icon={Share2}
                    onClick={() => navigate('/whatsapp')}
                  >
                    Share in Chat
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1 text-[11px]"
                    icon={CalendarCheck}
                    onClick={() => navigate(`/appointments?action=new`)}
                  >
                    Book Visit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Client Showings */}
      <Card>
        <CardHeader
          title="Today's Confirmed Client Showings"
          subtitle="On-site property walkthroughs scheduled for today"
        />
        <div className="divide-y divide-zinc-200">
          {upcomingAppointments.map((app) => (
            <div
              key={app._id}
              className="p-4 flex items-center justify-between hover:bg-zinc-50 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-xs mt-0.5">
                  <CalendarCheck className="w-4 h-4 text-zinc-800" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-950">
                    {app.propertyId?.title || 'Luxury Penthouse Residence'}
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Client: <span className="font-semibold text-zinc-800">{app.customerId?.fullName || 'VIP Client'}</span> • {app.customerId?.phone}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Scheduled: {new Date(app.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {app.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/whatsapp')}>
                  Chat Client
                </Button>
                <Button size="sm" variant="primary" onClick={() => navigate('/bookings?action=new')}>
                  Record Advance
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
