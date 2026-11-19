import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Building2, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('admin@estateflow.io');
  const [password, setPassword] = useState('Admin@12345');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to EstateFlow CRM', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillRole = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('Admin@12345');
    addToast(`Filled credentials for ${roleEmail}`, 'info');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 border-b border-zinc-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-sm border border-zinc-800">
            <Building2 className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-zinc-950">
          EstateFlow CRM
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-500 tracking-tight">
          Professional Real Estate WhatsApp Automation
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl sm:px-8 border border-zinc-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@estateflow.io"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none transition font-mono"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Role Auto-Fill Pills */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2 text-center">
              Quick Role Test Logins
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Company Admin', email: 'admin@estateflow.io' },
                { label: 'Super Admin', email: 'superadmin@estateflow.io' },
                { label: 'Manager', email: 'manager@estateflow.io' },
                { label: 'Broker', email: 'broker@estateflow.io' },
                { label: 'Sales Agent', email: 'agent@estateflow.io' },
                { label: 'Support Agent', email: 'support@estateflow.io' }
              ].map((r) => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => handleFillRole(r.email)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                    email === r.email
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-center text-zinc-400 mt-2 font-mono">
              Universal Password: <span className="font-bold text-zinc-700">Admin@12345</span>
            </p>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-zinc-500">Don't have an account? </span>
            <Link to="/register" className="text-xs font-semibold text-zinc-950 hover:underline">
              Register Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
