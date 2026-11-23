import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { handleImageError, getPropertyFallbackImage } from '../../utils/propertyImages';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Share2,
  MapPin,
  ArrowRight
} from 'lucide-react';

export const PropertyMatching = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomersList = async () => {
      setLoadingCustomers(true);
      try {
        const res = await api.get('/customers?limit=50');
        if (res.data.success) {
          setCustomers(res.data.customers || []);
          if (res.data.customers?.length > 0) {
            setSelectedCustomerId(res.data.customers[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomersList();
  }, []);

  const fetchMatches = async (customerId) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.get(`/matching/customer/${customerId}`);
      if (res.data.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Matching engine error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMatches(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  const handleShareToWhatsApp = async (property) => {
    try {
      const convRes = await api.get(`/whatsapp/conversations?search=${selectedCustomer.phone}`);
      const conv = convRes.data.conversations?.[0];

      if (!conv) {
        addToast('No active WhatsApp conversation found for this customer.', 'warning');
        return;
      }

      await api.post('/whatsapp/send', {
        conversationId: conv._id,
        propertyId: property._id
      });

      addToast(`Shared ${property.title} to ${selectedCustomer.fullName}'s WhatsApp!`, 'success');
    } catch (err) {
      addToast('Failed to share to WhatsApp', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300/80 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> AI-POWERED RECOMMENDATION ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Intelligent Property Matching
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Compares verified inventory against customer budget, locality, bedrooms, and amenities using multi-factor weighted scoring.
          </p>
        </div>
      </div>

      {/* Customer Selector Card */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wider mb-1.5">
                Select Customer Profile To Match Against
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs font-medium border border-zinc-300 rounded-lg p-2.5 bg-white text-zinc-800 focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.fullName} ({c.phone}) • Budget: ₹{((c.requirements?.maxBudget || 0) / 10000000).toFixed(2)} Cr • {c.preferredLocation || 'Gurugram'}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs sm:w-80">
                <div className="font-bold text-zinc-950">{selectedCustomer.fullName}</div>
                <div className="text-zinc-500 mt-0.5">
                  Target: {selectedCustomer.requirements?.bedrooms || 3} BHK {selectedCustomer.requirements?.propertyCategory || 'Apartment'}
                </div>
                <div className="text-zinc-950 font-bold mt-1">
                  Budget: ₹{((selectedCustomer.requirements?.minBudget || 0) / 10000000).toFixed(2)} - ₹
                  {((selectedCustomer.requirements?.maxBudget || 0) / 10000000).toFixed(2)} Cr
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <Card className="p-8 text-center text-xs text-zinc-400">
          No matching available properties found for this customer's criteria. Try adjusting budget or locality preferences.
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-zinc-500 flex items-center justify-between">
            <span>Ranked Recommendations ({matches.length} listings)</span>
            <span className="text-[11px] text-zinc-900 font-medium">Sorted by Match Score Descending</span>
          </div>

          {matches.map(({ property, matchScore, matchPercentage, matchFactors, missingFactors, recommendedAction }) => (
            <Card key={property._id} hover className="overflow-hidden border border-zinc-200">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto bg-zinc-100 flex-shrink-0">
                  <img
                    src={property.images?.[0] || getPropertyFallbackImage(property.category, property.title)}
                    alt={property.title}
                    onError={(e) => handleImageError(e, property.category, property.title)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/95 text-zinc-900 border border-zinc-200 shadow-xs">
                      {property.propertyCode}
                    </span>
                  </div>
                </div>

                {/* Details & Explanation */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                            matchScore >= 80
                              ? 'bg-amber-100/90 text-amber-950 border-amber-300 font-bold shadow-2xs'
                              : 'bg-amber-50/50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {matchPercentage} Match Score
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">{recommendedAction}</span>
                      </div>
                      <div className="text-lg font-black text-amber-950">
                        ₹{(property.totalPrice / 10000000).toFixed(2)} Cr
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-zinc-950 mt-2">{property.title}</h3>

                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {property.address?.locality}, {property.address?.city} • {property.bedrooms} BHK ({property.builtUpArea} sq.ft)
                    </p>

                    {/* Match Factors Breakdown */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-950 block">
                          Matching Criteria
                        </span>
                        {matchFactors.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-zinc-800 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-zinc-950 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {missingFactors.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                            Deviations / Differences
                          </span>
                          {missingFactors.map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="gold"
                      icon={Share2}
                      onClick={() => handleShareToWhatsApp(property)}
                    >
                      Share with Customer via WhatsApp
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/properties/${property._id}`)}
                    >
                      View Property Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
