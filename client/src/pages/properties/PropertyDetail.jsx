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
  ArrowLeft
} from 'lucide-react';

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [property, setProperty] = useState(null);
  const [interestedLeads, setInterestedLeads] = useState([]);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
};
