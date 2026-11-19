import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  MessageSquare,
  Sparkles,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Copy,
  ExternalLink,
  Save,
  Key
} from 'lucide-react';

export const Integrations = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [whatsappForm, setWhatsappForm] = useState({
    wabaId: '',
    phoneNumberId: '',
    accessToken: '',
    appId: '',
    appSecret: '',
    webhookVerifyToken: 'estateflow_verify_token_2026',
    status: 'connected'
  });

  const [aiForm, setAiForm] = useState({
    apiKey: '',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    autoReplyEnabled: true
  });

  const { addToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
        if (res.data.settings.whatsappConfig) {
          setWhatsappForm(res.data.settings.whatsappConfig);
        }
        if (res.data.settings.aiConfig) {
          setAiForm(res.data.settings.aiConfig);
        }
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

  const handleSaveIntegrations = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', {
        whatsappConfig: whatsappForm,
        aiConfig: aiForm
      });
      if (res.data.success) {
        addToast('Integration credentials saved securely!', 'success');
        fetchSettings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  const currentOrigin = window.location.origin;
  const webhookUrl = `${currentOrigin}/api/whatsapp/webhook`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">API & Integration Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect the official Meta WhatsApp Business Cloud API, OpenAI GPT engine, and database services.
        </p>
      </div>

      <form onSubmit={handleSaveIntegrations} className="space-y-6">
        {/* Meta WhatsApp Cloud API Section */}
        <Card>
          <CardHeader
            title="Meta WhatsApp Business Cloud API (Official)"
            subtitle="Configure your Meta Developer App and WhatsApp Business Account (WABA)"
            action={
              <Badge variant={whatsappForm.status === 'connected' ? 'available' : 'urgent'}>
                {whatsappForm.status === 'connected' ? 'Connected (Live)' : 'Test Mode'}
              </Badge>
            }
          />
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 text-xs space-y-2">
              <span className="font-bold text-slate-800 block">
                Meta Developer App Webhook Configuration
              </span>
              <p className="text-slate-600 leading-relaxed">
                In your Meta App Dashboard under <strong>WhatsApp &gt; Configuration</strong>, set the Callback URL and Verify Token below:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Callback URL (Webhook Endpoint)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="w-full text-xs font-mono p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                      className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Webhook Verification Token
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      readOnly
                      value={whatsappForm.webhookVerifyToken}
                      className="w-full text-xs font-mono p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(whatsappForm.webhookVerifyToken, 'Verify Token')}
                      className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number ID</label>
                <input
                  type="text"
                  value={whatsappForm.phoneNumberId || ''}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
                  placeholder="e.g. 104598234857612"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Business Account ID (WABA)</label>
                <input
                  type="text"
                  value={whatsappForm.wabaId || ''}
                  onChange={(e) => setWhatsappForm({ ...whatsappForm, wabaId: e.target.value })}
                  placeholder="e.g. 109283746501928"
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent System User Access Token</label>
              <input
                type="text"
                value={whatsappForm.accessToken || ''}
                onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
                placeholder="EAA..."
                className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Generated from Meta Business Manager with permissions <code className="text-teal-600">whatsapp_business_messaging</code> and <code className="text-teal-600">whatsapp_business_management</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI Engine Section */}
        <Card>
          <CardHeader
            title="OpenAI Intelligence Engine"
            subtitle="Grounds conversational answers on your verified MongoDB property records"
            action={
              <Badge variant={aiForm.apiKey ? 'available' : 'warm'}>
                {aiForm.apiKey ? 'OpenAI GPT Active' : 'Smart Rule-Based Fallback Engine Active'}
              </Badge>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={aiForm.apiKey || ''}
                  onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave blank to use EstateFlow's built-in real estate conversational grounder.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Selection</label>
                <select
                  value={aiForm.model || 'gpt-4o-mini'}
                  onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended for WhatsApp)</option>
                  <option value="gpt-4o">gpt-4o (Most Intelligent Reasoning)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoReply"
                checked={aiForm.autoReplyEnabled}
                onChange={(e) => setAiForm({ ...aiForm, autoReplyEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="autoReply" className="text-xs font-semibold text-slate-800">
                Enable AI Auto-Reply for Incoming WhatsApp Customer Inquiries
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end gap-3">
          <Button type="submit" size="md" isLoading={saving} icon={Save}>
            Save Integration Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
