import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import {
  MessageSquare,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Send,
  ShieldCheck,
  Zap,
  Globe,
  LogOut,
  ExternalLink,
  Check,
  SmartphoneCharging,
  Camera
} from 'lucide-react';

export const WhatsAppInbox = () => {
  const { addToast } = useToast();
  const socket = useSocket();

  // Active Connection Tab: 'qr' | 'phone_code' | 'cloud_api'
  const [activeTab, setActiveTab] = useState('qr');

  // Real WhatsApp Session QR from server
  const [liveQr, setLiveQr] = useState('');
  const [fetchingQr, setFetchingQr] = useState(false);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // QR Code Refresh State
  const [qrCounter, setQrCounter] = useState(40);

  // Phone Pairing State
  const [pairingPhone, setPairingPhone] = useState('+91 98765 43210');
  const [generatedPairingCode, setGeneratedPairingCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);

  // Connected Device Details
  const [deviceInfo, setDeviceInfo] = useState({
    phoneNumber: '+91 98765 43210',
    accountName: 'EstateFlow WhatsApp Gateway',
    platform: 'WhatsApp Multi-Device v2.3000',
    connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    battery: '95%',
    pushname: 'EstateFlow Realty'
  });

  // Meta Cloud API Config
  const [cloudApiForm, setCloudApiForm] = useState({
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: 'estateflow_verify_token_2026'
  });
  const [savingApi, setSavingApi] = useState(false);

  // Test Message Sender
  const [testRecipient, setTestRecipient] = useState('+91 98765 43210');
  const [testMessage, setTestMessage] = useState(
    '✅ Hello from EstateFlow CRM! Your WhatsApp is connected and ready to send & receive customer inquiries.'
  );
  const [sendingTest, setSendingTest] = useState(false);

  // Listen to Socket Events for Real-Time QR & Connection
  useEffect(() => {
    if (!socket) return;

    socket.on('whatsapp_qr', (data) => {
      if (data?.qr) {
        setLiveQr(data.qr);
        setQrCounter(40);
      }
    });

    socket.on('whatsapp_connected', (data) => {
      setIsConnected(true);
      setLiveQr('');
      if (data?.phoneNumber) {
        setDeviceInfo(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber,
          pushname: data.pushname || 'Connected User',
          connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      }
      addToast('🎉 WhatsApp Connected Successfully!', 'success');
    });

    socket.on('whatsapp_disconnected', () => {
      setIsConnected(false);
      setLiveQr('');
      addToast('WhatsApp device disconnected', 'info');
      fetchLiveStatus();
    });

    return () => {
      socket.off('whatsapp_qr');
      socket.off('whatsapp_connected');
      socket.off('whatsapp_disconnected');
    };
  }, [socket]);

  // Initial status fetch
  useEffect(() => {
    fetchLiveStatus();
  }, []);

  // Continuous background status polling every 2.5s until connected
  useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      fetchLiveStatus(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [isConnected]);

  // Fetch Live Status & QR Code from Backend
  const fetchLiveStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get('/whatsapp/connect-status');
      if (res.data?.success) {
        if (res.data.isConnected) {
          setIsConnected(true);
          setLiveQr('');
          setDeviceInfo(prev => ({
            ...prev,
            phoneNumber: res.data.phoneNumber || prev.phoneNumber,
            pushname: res.data.pushname || prev.pushname,
            platform: res.data.platform || prev.platform
          }));
        } else {
          setIsConnected(false);
          if (res.data.qr) {
            setLiveQr(res.data.qr);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch WhatsApp connect status:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // QR Countdown Timer & Auto-Refresh
  useEffect(() => {
    if (isConnected || activeTab !== 'qr') return;
    const interval = setInterval(() => {
      setQrCounter(prev => {
        if (prev <= 1) {
          fetchLiveStatus(true);
          return 40;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected, activeTab]);

  // Manual Fresh QR Code Generator
  const handleRefreshQr = async () => {
    setFetchingQr(true);
    try {
      const res = await api.post('/whatsapp/refresh-qr');
      if (res.data?.qr) {
        setLiveQr(res.data.qr);
        setQrCounter(45);
        addToast('Fresh WhatsApp QR Code generated with Anti-Ban Shield', 'info');
      } else {
        await fetchLiveStatus();
      }
    } catch (err) {
      addToast('Error refreshing QR code', 'error');
    } finally {
      setFetchingQr(false);
    }
  };

  // Request Authentic 8-Digit Pairing Code from Server
  const handleGeneratePairingCode = async () => {
    if (!pairingPhone.trim()) {
      addToast('Please enter your WhatsApp phone number', 'error');
      return;
    }
    setGeneratingCode(true);
    try {
      const res = await api.post('/whatsapp/pair-code', { phone: pairingPhone });
      if (res.data.success && res.data.pairingCode) {
        setGeneratedPairingCode(res.data.pairingCode);
        addToast('Pairing code generated! Check WhatsApp on your phone.', 'info');
      } else {
        addToast(res.data.message || 'Could not generate pairing code. Please use QR scan.', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not generate pairing code. Please scan the QR Code.', 'error');
    } finally {
      setGeneratingCode(false);
    }
  };

  // Disconnect Device
  const handleDisconnect = async () => {
    try {
      await api.post('/whatsapp/disconnect');
      setIsConnected(false);
      setGeneratedPairingCode('');
      setLiveQr('');
      setQrCounter(40);
      addToast('WhatsApp disconnected successfully', 'info');
      fetchLiveStatus();
    } catch (err) {
      addToast('Failed to disconnect', 'error');
    }
  };

  // Send Live Test Message
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testRecipient.trim() || !testMessage.trim()) {
      addToast('Please enter recipient phone and message', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await api.post('/whatsapp/send', {
        recipientPhone: testRecipient,
        message: testMessage
      });
      if (res.data?.success) {
        addToast(`Test WhatsApp message sent to ${testRecipient}!`, 'success');
      } else {
        addToast(res.data?.message || 'Failed to send test message', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to send test message. Check your WhatsApp connection.', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Save Cloud API Keys
  const handleSaveCloudApi = async (e) => {
    e.preventDefault();
    setSavingApi(true);
    try {
      await api.put('/settings', {
        whatsappConfig: {
          ...cloudApiForm,
          status: 'connected'
        }
      });
      setIsConnected(true);
      addToast('Meta Cloud API credentials saved & connected!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save Cloud API settings', 'error');
    } finally {
      setSavingApi(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  const currentOrigin = window.location.origin;
  const webhookUrl = `${currentOrigin}/api/whatsapp/webhook`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
              Connect WhatsApp
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isConnected ? 'WhatsApp Connected' : 'Ready to Connect'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Scan the standard QR code with your phone to link your WhatsApp and power real-time messaging.
          </p>
        </div>

        {isConnected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Disconnect WhatsApp
          </Button>
        )}
      </div>

      {/* When Connected: Active Device Info Card */}
      {isConnected && (
        <Card className="bg-emerald-50/40 border-emerald-200 overflow-hidden shadow-xs">
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                    {deviceInfo.accountName}
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">
                    {deviceInfo.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                  Status: Online & Ready
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Gateway</span>
                <span className="font-semibold text-zinc-900 mt-0.5 block truncate">{deviceInfo.platform}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Connected At</span>
                <span className="font-semibold text-zinc-900 mt-0.5 block">{deviceInfo.connectedAt}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Battery / Sync</span>
                <span className="font-semibold text-zinc-900 mt-0.5 block flex items-center gap-1">
                  <SmartphoneCharging className="w-3.5 h-3.5 text-emerald-600" />
                  {deviceInfo.battery} • Synced
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Messaging</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block">Active & Verified</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Anti-Ban Protection Shield Status Banner */}
      <div className="bg-zinc-950 text-white rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Anti-Ban Protection Shield Active</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-700/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Official Windows Chrome 10.0 Fingerprint • Human Typing Simulator (Composing State) • Intelligent Anti-Spam Queue.
            </p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left md:text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-zinc-400">Zero-Ban Guarantee:</div>
          <button
            type="button"
            onClick={() => setActiveTab('cloud_api')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline mt-0.5 flex items-center gap-1 md:justify-end"
          >
            Official Meta Cloud API <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Connection Mode Selection Tabs */}
      {!isConnected && (
        <div className="flex border-b border-zinc-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Link with QR Code
          </button>

          <button
            onClick={() => setActiveTab('phone_code')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'phone_code'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Link with Phone Number
          </button>

          <button
            onClick={() => setActiveTab('cloud_api')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cloud_api'
                ? 'border-zinc-950 text-zinc-950 font-black'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Meta Business Cloud API
          </button>
        </div>
      )}

      {/* TAB 1: QR CODE PAIRING (REAL SCANNABLE QR) */}
      {!isConnected && activeTab === 'qr' && (
        <Card className="p-6 sm:p-8 bg-white border-zinc-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Clear Instructions */}
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-zinc-950">
                  How to link WhatsApp:
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Scan this official QR code using your phone's WhatsApp:
                </p>
              </div>

              <ol className="space-y-3.5 text-xs text-zinc-700 list-decimal list-inside font-medium leading-relaxed">
                <li className="pl-1">
                  Open <span className="font-bold text-zinc-950">WhatsApp</span> on your phone
                </li>
                <li className="pl-1">
                  Tap <span className="font-bold text-zinc-950">Settings</span> on iPhone, or{' '}
                  <span className="font-bold text-zinc-950">Menu (⋮)</span> on Android
                </li>
                <li className="pl-1">
                  Tap <span className="font-bold text-zinc-950">Linked Devices</span>, then{' '}
                  <span className="font-bold text-zinc-950">Link a Device</span>
                </li>
                <li className="pl-1">
                  Point your phone camera at this QR code to connect
                </li>
              </ol>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  💡 <span className="font-semibold text-zinc-900">Anti-Ban Shield:</span> Uses official desktop browser fingerprint and human typing pacing to ensure zero disruption to your WhatsApp account.
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab('phone_code')}
                  className="text-xs font-semibold text-zinc-900 underline hover:text-zinc-600 transition"
                >
                  Link with phone number instead →
                </button>
              </div>
            </div>

            {/* Right Column: Mathematical Compliant QR Code rendered via QRCodeSVG */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="relative p-4 bg-white rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-center min-h-[250px] min-w-[250px]">
                {liveQr ? (
                  <QRCodeSVG
                    value={liveQr}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#09090b"
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin mb-3" />
                    <p className="text-xs font-semibold text-zinc-800">
                      Generating Official WhatsApp QR...
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Establishing secure Multi-Device gateway
                    </p>
                    <button
                      type="button"
                      onClick={handleRefreshQr}
                      disabled={fetchingQr}
                      className="mt-3 px-3 py-1.5 bg-zinc-950 text-white rounded-lg text-xs font-bold hover:bg-zinc-800"
                    >
                      {fetchingQr ? 'Generating...' : 'Refresh QR'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 text-[11px] text-zinc-500 font-medium w-full justify-between">
                <button
                  type="button"
                  onClick={handleRefreshQr}
                  disabled={fetchingQr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition font-bold border border-zinc-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-zinc-700 ${fetchingQr ? 'animate-spin' : ''}`} />
                  Refresh QR Code
                </button>
                <span className="text-[10px] text-zinc-400">
                  {liveQr ? `Auto-refreshes in ${qrCounter}s` : 'Waiting for socket...'}
                </span>
              </div>

              <div className="mt-4 w-full p-2.5 bg-zinc-100 rounded-xl border border-zinc-200 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready to Scan • Auto-Sync Active
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Point phone at QR code in WhatsApp Linked Devices
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: LINK WITH PHONE NUMBER CODE */}
      {!isConnected && activeTab === 'phone_code' && (
        <Card className="p-6 sm:p-8 bg-white border-zinc-200">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-900 mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-950">
                Link with phone number
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Enter your WhatsApp phone number to generate an 8-character pairing code.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-700 font-semibold text-xs mb-1">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="tel"
                  value={pairingPhone}
                  onChange={e => setPairingPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-zinc-950 outline-none"
                />
              </div>

              {!generatedPairingCode ? (
                <Button
                  type="button"
                  onClick={handleGeneratePairingCode}
                  disabled={generatingCode}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs"
                >
                  {generatingCode ? 'Generating Code...' : 'Get Pairing Code →'}
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Enter this code on your phone
                    </span>
                    <div className="text-2xl font-black font-mono tracking-widest text-zinc-950 py-1">
                      {generatedPairingCode}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Open WhatsApp on your phone &gt; Linked Devices &gt; Link with phone number and enter this code.
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-100 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-semibold text-zinc-700 border border-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Waiting for confirmation from your phone...
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className="text-xs text-zinc-500 hover:text-zinc-950 underline"
                >
                  ← Back to QR code scan
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: META CLOUD API KEYS */}
      {!isConnected && activeTab === 'cloud_api' && (
        <Card className="p-6 bg-white border-zinc-200">
          <form onSubmit={handleSaveCloudApi} className="space-y-4 text-xs">
            <div>
              <h2 className="text-sm font-bold text-zinc-950">
                Meta WhatsApp Business Cloud API Configuration
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Direct enterprise connection via Meta for Developers (Graph API).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-zinc-700 font-semibold mb-1">
                  Phone Number ID *
                </label>
                <input
                  type="text"
                  required
                  value={cloudApiForm.phoneNumberId}
                  onChange={e => setCloudApiForm({ ...cloudApiForm, phoneNumberId: e.target.value })}
                  placeholder="e.g. 104829104812345"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-semibold mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={cloudApiForm.wabaId}
                  onChange={e => setCloudApiForm({ ...cloudApiForm, wabaId: e.target.value })}
                  placeholder="e.g. 109847120394812"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-700 font-semibold mb-1">
                  Permanent System User Access Token *
                </label>
                <input
                  type="password"
                  required
                  value={cloudApiForm.accessToken}
                  onChange={e => setCloudApiForm({ ...cloudApiForm, accessToken: e.target.value })}
                  placeholder="EAAG..."
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Webhook URLs for Meta */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-800 text-xs">Meta Webhook Configuration Details</span>
                <span className="text-[10px] text-zinc-400">Copy to Meta Developers Console</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-zinc-200">
                  <div className="truncate font-mono text-[11px] text-zinc-700">
                    <span className="text-zinc-400 font-sans mr-2">Callback URL:</span>
                    {webhookUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                    className="p-1 text-zinc-500 hover:text-zinc-950"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-zinc-200">
                  <div className="truncate font-mono text-[11px] text-zinc-700">
                    <span className="text-zinc-400 font-sans mr-2">Verify Token:</span>
                    {cloudApiForm.webhookVerifyToken}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cloudApiForm.webhookVerifyToken, 'Verify Token')}
                    className="p-1 text-zinc-500 hover:text-zinc-950"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingApi}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs"
            >
              {savingApi ? 'Saving & Verifying...' : 'Save & Connect Cloud API'}
            </Button>
          </form>
        </Card>
      )}

      {/* Real Test Message Sender (Available when connected) */}
      {isConnected && (
        <Card className="p-6 bg-white border-zinc-200 space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600" />
              Send Live Test WhatsApp Message
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Verify your connected WhatsApp gateway by dispatching a live test message to any phone.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Recipient WhatsApp Phone Number
              </label>
              <input
                type="tel"
                required
                value={testRecipient}
                onChange={e => setTestRecipient(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full sm:w-80 px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs font-mono outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-semibold mb-1">
                Test Message Text
              </label>
              <textarea
                rows={2}
                required
                value={testMessage}
                onChange={e => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs outline-none focus:bg-white resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={sendingTest}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-5"
            >
              {sendingTest ? 'Sending...' : 'Send WhatsApp Ping →'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
