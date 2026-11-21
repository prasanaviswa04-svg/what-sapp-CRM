import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Mail,
  Phone,
  Lock,
  User,
  MapPin,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const OwnerRegistration = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    currentCity: 'Gurugram',
    idProofType: 'Aadhaar / National ID',
    idProofNumber: '',
    ownershipType: 'Individual'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      addToast('Please fill all required personal and contact fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/marketplace/auth/register-owner', formData);
      if (res.data.success) {
        localStorage.setItem('marketplace_token', res.data.token);
        localStorage.setItem('marketplace_user', JSON.stringify(res.data.user));
        addToast('Owner registration complete! Welcome to EstateFlow.', 'success');
        navigate('/marketplace/owner/dashboard');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed. Please check inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-black tracking-tight text-zinc-950">
          Property Owner Registration
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Register to submit your flat, villa, land, or commercial unit directly to our verified luxury buyer network.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
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
                    placeholder="e.g. Rajesh"
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
                  placeholder="e.g. Singhania"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">WhatsApp Phone Number *</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Current City / Locality</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                    placeholder="e.g. Gurugram"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">Ownership Type</label>
                <select
                  value={formData.ownershipType}
                  onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })}
                  className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none bg-white"
                >
                  <option value="Individual">Individual Sole Owner</option>
                  <option value="Joint">Joint Ownership / Family</option>
                  <option value="Corporate">Corporate / Company Owned</option>
                </select>
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
                Your listing details are protected. Official WhatsApp updates and customer enquiry notifications will be dispatched directly to your registered number.
              </span>
            </div>

            <Button type="submit" isLoading={loading} className="w-full" size="md">
              Complete Owner Registration <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Already registered?</span>
            <Link to="/marketplace/login" className="font-semibold text-zinc-950 hover:underline">
              Portal Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
