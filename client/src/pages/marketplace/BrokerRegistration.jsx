import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Building2,
  Mail,
  Phone,
  Lock,
  User,
  MapPin,
  Award,
  FileText,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const BrokerRegistration = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    operatingLocations: 'Golf Course Road, DLF Phase 5, Cyber City',
    serviceAreas: 'Luxury Residential, Commercial Leasing',
    propertyCategories: ['Residential', 'Commercial'],
    yearsExperience: 5,
    reraNumber: '',
    licenseNumber: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.companyName || !formData.password) {
      addToast('Please fill all required personal, company, and contact fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/marketplace/auth/register-broker', formData);
      if (res.data.success) {
        localStorage.setItem('marketplace_token', res.data.token);
        localStorage.setItem('marketplace_user', JSON.stringify(res.data.user));
        addToast('Broker Network registration complete! Welcome Partner.', 'success');
        navigate('/marketplace/broker/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed. Check details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-black tracking-tight text-zinc-950">
          Broker Network Partner Registration
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Join our verified partner exchange to submit multiple listings, post client requirements, and co-broker transactions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="p-6 sm:p-8 bg-white border-zinc-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">First Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="e.g. Karan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="e.g. Varma"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Brokerage / Agency Name *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="e.g. Prime Acre Realty Advisors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Business Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="karan@agency.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">WhatsApp Business Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Primary Operating Locations *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={formData.operatingLocations}
                  onChange={(e) => setFormData({ ...formData, operatingLocations: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="e.g. Golf Course Road, DLF Phase 5, Cyber City"
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Separate localities with commas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">RERA Registration No. (Optional)</label>
                <div className="relative">
                  <Award className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.reraNumber}
                    onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                    placeholder="HARERA/GGM/2021/XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-950 shrink-0 mt-0.5" />
              <span>
                By registering, you gain access to the dedicated Broker Portal to submit property inventory, share verified buyer requirements, and co-broker with our internal desk.
              </span>
            </div>

            <Button type="submit" isLoading={loading} className="w-full" size="md">
              Complete Broker Partner Registration <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Already a registered partner?</span>
            <Link to="/marketplace/login" className="font-semibold text-zinc-950 hover:underline">
              Broker Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
