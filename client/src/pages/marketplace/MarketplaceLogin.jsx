import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Users
} from 'lucide-react';

export const MarketplaceLogin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/marketplace/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('marketplace_token', res.data.token);
        localStorage.setItem('marketplace_user', JSON.stringify(res.data.user));
        addToast(`Welcome back, ${res.data.user.name}!`, 'success');

        if (res.data.user.userType === 'Broker') {
          navigate('/marketplace/broker/dashboard');
        } else {
          navigate('/marketplace/owner/dashboard');
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Check email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xs">
            <Store className="w-5 h-5 text-white" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-black tracking-tight text-zinc-950">
          Partner & Owner Portal
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500">
          Sign in to manage your submitted properties, track buyer requirements, and view approvals.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 bg-white border-zinc-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Registered Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                  placeholder="name@agency.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full" size="md">
              Sign In to Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Pre-fill Pills */}
          <div className="mt-5 pt-4 border-t border-zinc-100">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
              Quick Test Sign-In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('owner.rajesh@gmail.com')}
                className="p-2 rounded-lg border border-zinc-200 text-left hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <Building2 className="w-3 h-3 text-zinc-700" />
                  <span>Property Owner</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">owner.rajesh@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('karan@primeacrerealty.com')}
                className="p-2 rounded-lg border border-zinc-200 text-left hover:bg-zinc-50 transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <Users className="w-3 h-3 text-zinc-700" />
                  <span>Real Estate Broker</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 truncate">karan@primeacre...</p>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
            <Link to="/marketplace/register/owner" className="font-semibold text-zinc-700 hover:text-zinc-950 hover:underline">
              Register as Owner
            </Link>
            <span className="text-zinc-300">•</span>
            <Link to="/marketplace/register/broker" className="font-semibold text-zinc-700 hover:text-zinc-950 hover:underline">
              Register as Broker
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
