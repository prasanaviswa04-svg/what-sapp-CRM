import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Building2, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      addToast('Company registered successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-950 shadow-sm">
            <Building2 className="w-5 h-5 text-zinc-950 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-white">
          Create Realty Workspace
        </h2>
        <p className="mt-1 text-center text-xs text-zinc-400 tracking-tight">
          Enterprise real estate CRM and automation
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-zinc-200">
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. Apex Realty"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Aarav"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Sharma"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Business Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="aarav@apexrealty.com"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
              Complete Setup <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-zinc-500">Already registered? </span>
            <Link to="/login" className="text-xs font-semibold text-zinc-950 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
