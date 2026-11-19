import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import {
  Settings as SettingsIcon,
  Building2,
  Save,
  Sparkles,
  Database,
  Globe,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');

  const { addToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        setCompanyName(res.data.settings.name || '');
        setEmail(res.data.settings.email || '');
        setPhone(res.data.settings.phone || '');
        setCurrencySymbol(res.data.settings.currency?.symbol || '₹');
        setCurrencyCode(res.data.settings.currency?.code || 'INR');
        setTimeZone(res.data.settings.timeZone || 'Asia/Kolkata');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', {
        name: companyName,
        email,
        phone,
        currency: { code: currencyCode, symbol: currencySymbol },
        timeZone
      });
      if (res.data.success) {
        addToast('Company settings saved successfully!', 'success');
      }
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!window.confirm('Reset and seed rich realistic real estate demo data? (Properties, customers, pipeline leads, and WhatsApp chats will be regenerated)')) return;

    setSeeding(true);
    try {
      const res = await api.post('/settings/seed-data');
      if (res.data.success) {
        addToast('Complete real estate demo dataset seeded successfully!', 'success');
      }
    } catch (err) {
      addToast('Failed to seed demo data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company & Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your real estate brokerage branding, local currency, timezone, and interactive demo dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Company Profile */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Company & Brokerage Profile" subtitle="Public agency contact information and identity" />
            <CardContent>
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    placeholder="e.g. EstateFlow Luxury Realty"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Business Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="contact@estateflow.io"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Business Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Code</label>
                    <input
                      type="text"
                      value={currencyCode}
                      onChange={(e) => setCurrencyCode(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="INR"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                    <input
                      type="text"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      placeholder="Asia/Kolkata"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" isLoading={saving} icon={Save}>
                    Save Company Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Demo Data Seeder */}
        <div className="space-y-6">
          <Card className="border-teal-200 bg-teal-50/40">
            <CardHeader
              title="Interactive Demo Seeder"
              subtitle="One-click dataset reset and population"
            />
            <CardContent className="space-y-3 text-xs leading-relaxed text-slate-700">
              <p>
                Click below to populate or reset the platform with rich real estate listings (The Camellias, Trump Towers, Eco Villas), active CRM pipeline leads, and WhatsApp chat history.
              </p>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                isLoading={seeding}
                icon={RefreshCw}
                onClick={handleSeedDemoData}
              >
                Seed Rich Demo Real Estate Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
