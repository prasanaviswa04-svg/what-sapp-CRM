import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { handleImageError, getPropertyFallbackImage } from '../../utils/propertyImages';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Car,
  CheckCircle2,
  Share2,
  CalendarCheck,
  ArrowLeft,
  MessageSquare,
  Send,
  X,
  ExternalLink
} from 'lucide-react';

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [property, setProperty] = useState(null);
  const [interestedLeads, setInterestedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWaShareModal, setShowWaShareModal] = useState(false);
  const [waRecipientPhone, setWaRecipientPhone] = useState('+91 98948 76823');
  const [sharingWa, setSharingWa] = useState(false);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/properties/${id}`);
      if (res.data.success) {
        setProperty(res.data.property);
        setInterestedLeads(res.data.interestedLeads || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load property', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleShareToWhatsApp = async (e) => {
    e?.preventDefault();
    if (!waRecipientPhone.trim()) {
      addToast('Please enter a recipient phone number', 'error');
      return;
    }
    setSharingWa(true);
    try {
      const res = await api.post('/whatsapp/send', {
        recipientPhone: waRecipientPhone,
        propertyId: property._id
      });
      if (res.data?.success) {
        addToast(`✅ Shared ${property.title} with Photo & Google Map to ${waRecipientPhone}!`, 'success');
        setShowWaShareModal(false);
      } else {
        addToast(res.data?.message || 'Failed to share property', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to share property via WhatsApp', 'error');
    } finally {
      setSharingWa(false);
    }
  };

  if (loading || !property) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/properties')} icon={ArrowLeft}>
          Back to Inventory
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            icon={MessageSquare}
            onClick={() => setShowWaShareModal(true)}
          >
            WhatsApp (+ Photo & GMap)
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={CalendarCheck}
            onClick={() => navigate(`/appointments?action=new&propertyId=${property._id}`)}
          >
            Schedule Site Visit
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Share2}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              addToast('Listing link copied to clipboard!', 'success');
            }}
          >
            Share Listing
          </Button>
        </div>
      </div>

      {/* Main Image Banner & Title */}
      <Card className="overflow-hidden border border-zinc-200">
        <div className="relative h-72 sm:h-96 w-full bg-zinc-100">
          <img
            src={property.images?.[0] || getPropertyFallbackImage(property.category, property.title)}
            alt={property.title}
            onError={(e) => handleImageError(e, property.category, property.title)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-white text-zinc-950">
                  {property.propertyCode}
                </span>
                <Badge variant={property.status}>{property.status}</Badge>
                <span className="text-xs text-zinc-200 font-medium">
                  {property.category} • For {property.purpose}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{property.title}</h1>
              <p className="text-xs text-zinc-200 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-200" />
                {property.address?.street ? `${property.address.street}, ` : ''}
                {property.address?.locality}, {property.address?.city}, {property.address?.state}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs text-zinc-300 font-medium">Total Price</div>
              <div className="text-3xl font-extrabold text-white">
                ₹{(property.totalPrice / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-xs text-zinc-300">₹{property.pricePerUnit?.toLocaleString()}/sq.ft</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Bed className="w-5 h-5 text-zinc-700 mx-auto mb-1" />
          <span className="text-xs text-zinc-500 block">Bedrooms</span>
          <span className="text-base font-bold text-zinc-950">{property.bedrooms} BHK</span>
        </Card>
        <Card className="p-4 text-center">
          <Bath className="w-5 h-5 text-zinc-700 mx-auto mb-1" />
          <span className="text-xs text-zinc-500 block">Bathrooms</span>
          <span className="text-base font-bold text-zinc-950">{property.bathrooms} Baths</span>
        </Card>
        <Card className="p-4 text-center">
          <Building2 className="w-5 h-5 text-zinc-700 mx-auto mb-1" />
          <span className="text-xs text-zinc-500 block">Built-Up Area</span>
          <span className="text-base font-bold text-zinc-950">
            {property.builtUpArea?.toLocaleString()} {property.unit}
          </span>
        </Card>
        <Card className="p-4 text-center">
          <Car className="w-5 h-5 text-zinc-700 mx-auto mb-1" />
          <span className="text-xs text-zinc-500 block">Reserved Parking</span>
          <span className="text-base font-bold text-zinc-950">{property.parkingSpaces} Covered</span>
        </Card>
      </div>

      {/* Details & Amenities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Property Description & Overview" />
            <CardContent>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {property.description || 'Exclusive luxury listing featuring premium specifications, verified freehold title, and unmatched connectivity.'}
              </p>
            </CardContent>
          </Card>

          {/* Amenities Badges */}
          <Card>
            <CardHeader title="Amenities & Modern Features" subtitle="Verified property specifications" />
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {property.amenities?.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                    {amenity}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Broker info & Interested Leads */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Assigned Broker" />
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold flex items-center justify-center text-sm">
                  {property.assignedBrokerId?.firstName?.[0] || 'B'}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">
                    {property.assignedBrokerId ? `${property.assignedBrokerId.firstName} ${property.assignedBrokerId.lastName}` : 'Direct Office'}
                  </h4>
                  <p className="text-zinc-500">{property.assignedBrokerId?.phone || '+91 98765 43210'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={`Interested Leads (${interestedLeads.length})`}
              subtitle="Prospects inquiring about this property"
            />
            <div className="divide-y divide-zinc-200 text-xs">
              {interestedLeads.length === 0 ? (
                <div className="p-4 text-center text-zinc-400">No active leads tagged yet.</div>
              ) : (
                interestedLeads.map((l) => (
                  <div
                    key={l._id}
                    onClick={() => l.customerId && navigate(`/customers/${l.customerId._id}`)}
                    className="p-3 hover:bg-zinc-50 cursor-pointer flex items-center justify-between transition"
                  >
                    <div>
                      <span className="font-semibold text-zinc-900">{l.customerId?.fullName}</span>
                      <p className="text-[11px] text-zinc-400">{l.customerId?.phone}</p>
                    </div>
                    <Badge variant={l.stage}>{l.stage}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* WhatsApp Share Modal (+ Photo & Google Maps) */}
      {showWaShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Share via WhatsApp</h3>
                  <p className="text-[11px] text-zinc-500">Includes property photo & Google Maps location</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWaShareModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-200">
              <div className="flex items-center gap-3">
                <img
                  src={property.images?.[0] || getPropertyFallbackImage(property.category, property.title)}
                  alt={property.title}
                  className="w-12 h-12 object-cover rounded-lg shrink-0 border border-zinc-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-950 truncate">{property.title}</h4>
                  <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    {property.address?.locality || 'Prime Locality'}, {property.address?.city || 'Gurugram'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-800 font-medium pt-1">
                <span className="bg-emerald-100 px-2 py-0.5 rounded">📸 Photo Included</span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded">📍 Google Map Pin Included</span>
              </div>
            </div>

            <form onSubmit={handleShareToWhatsApp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Recipient WhatsApp Phone
                </label>
                <input
                  type="tel"
                  required
                  value={waRecipientPhone}
                  onChange={(e) => setWaRecipientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs border border-zinc-300 rounded-lg px-3 py-2 font-mono outline-none focus:border-zinc-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWaShareModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={sharingWa}
                  icon={Send}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Dispatch via WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
