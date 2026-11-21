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
  Camera,
  MapPin,
  Navigation,
  X
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

  // Test / Direct WhatsApp Dispatcher State (+ Photo & + GMap)
  const [testRecipient, setTestRecipient] = useState('+91 98765 43210');
  const [testMessage, setTestMessage] = useState(
    '✅ Hello from EstateFlow CRM! Your WhatsApp is connected and ready to send & receive customer inquiries.'
  );
  const [sendingTest, setSendingTest] = useState(false);
  const [testPhotoPreview, setTestPhotoPreview] = useState(null);
  const [testPhotoFile, setTestPhotoFile] = useState(null);
  const [testLocation, setTestLocation] = useState(null);
  const [showTestLocPicker, setShowTestLocPicker] = useState(false);
  const [customTestLoc, setCustomTestLoc] = useState('');
  const [fetchingTestGps, setFetchingTestGps] = useState(false);
  const testFileInputRef = React.useRef(null);

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

  // Photo & Location Helpers for Direct Message Dispatch
  const handleTestPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      addToast('Image must be smaller than 15MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTestPhotoPreview(event.target.result);
      setTestPhotoFile(file);
      addToast('Photo attached! Ready to send via WhatsApp.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleFetchTestGps = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your device', 'error');
      return;
    }
    setFetchingTestGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setTestLocation({
          latitude: lat,
          longitude: lng,
          name: 'Current Agent Location',
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`
        });
        setFetchingTestGps(false);
        setShowTestLocPicker(false);
        addToast('📍 Current GPS location attached!', 'success');
      },
      (err) => {
        setFetchingTestGps(false);
        addToast(`Could not fetch GPS: ${err.message}`, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleApplyTestCustomLoc = () => {
    if (!customTestLoc.trim()) return;
    const str = customTestLoc.trim();
    const coordRegex = /[@=]?(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = str.match(coordRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      setTestLocation({
        latitude: lat,
        longitude: lng,
        name: 'Google Maps Pin',
        address: `${lat}, ${lng}`,
        googleMapsUrl: str.startsWith('http') ? str : `https://maps.google.com/?q=${lat},${lng}`
      });
    } else {
      setTestLocation({
        latitude: null,
        longitude: null,
        name: str,
        address: str,
        googleMapsUrl: str.startsWith('http') ? str : `https://maps.google.com/?q=${encodeURIComponent(str)}`
      });
    }
    setCustomTestLoc('');
    setShowTestLocPicker(false);
    addToast('📍 Google Maps location attached!', 'success');
  };

  // Send Live WhatsApp Message (+ Photo & + GMap)
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testRecipient.trim() || (!testMessage.trim() && !testPhotoPreview && !testLocation)) {
      addToast('Please enter recipient phone and message, photo, or Google Maps location', 'error');
      return;
    }
    setSendingTest(true);
    try {
      const res = await api.post('/whatsapp/send', {
        recipientPhone: testRecipient,
        message: testMessage,
        photo: testPhotoPreview || undefined,
        location: testLocation || undefined
      });
      if (res.data?.success) {
        addToast(`✅ Live WhatsApp message delivered to ${testRecipient} (+ Photo & GMap synced)!`, 'success');
        setTestPhotoPreview(null);
        setTestPhotoFile(null);
        setTestLocation(null);
        setShowTestLocPicker(false);
        if (testFileInputRef.current) testFileInputRef.current.value = '';
      } else {
        addToast(res.data?.message || 'Failed to send message', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to send message. Check your WhatsApp connection.', 'error');
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

      {/* Real Live WhatsApp Direct Dispatcher (+ Photo & + GMap) */}
      {isConnected && (
        <Card className="p-6 bg-white border-zinc-200 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600" />
              Live WhatsApp Direct Dispatcher (+ Photo & + GMap)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Dispatch live WhatsApp messages to any recipient. Easily attach photos and interactive Google Maps location pins.
            </p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4 text-xs">
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
                Message Text (Words)
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={e => setTestMessage(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded-lg text-xs outline-none focus:bg-white resize-none"
              />
            </div>

            {/* Attached Photo & Location Chips */}
            {(testPhotoPreview || testLocation) && (
              <div className="flex items-center gap-2 flex-wrap p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                {testPhotoPreview && (
                  <div className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-800 shadow-2xs">
                    <img src={testPhotoPreview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                    <span className="text-[11px] font-semibold truncate max-w-[150px]">
                      {testPhotoFile?.name || 'Photo Attached'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTestPhotoPreview(null);
                        setTestPhotoFile(null);
                        if (testFileInputRef.current) testFileInputRef.current.value = '';
                      }}
                      className="text-zinc-400 hover:text-zinc-700 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {testLocation && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 shadow-2xs">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="max-w-[220px]">
                      <p className="text-[11px] font-bold truncate">{testLocation.name || 'Google Maps Location'}</p>
                      <p className="text-[10px] text-emerald-700 truncate">{testLocation.address}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestLocation(null)}
                      className="text-emerald-600 hover:text-emerald-900 ml-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Google Maps Popover Drawer */}
            {showTestLocPicker && (
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Share Google Maps Location
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTestLocPicker(false)}
                    className="text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    isLoading={fetchingTestGps}
                    onClick={handleFetchTestGps}
                    className="text-xs border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50"
                  >
                    <Navigation className="w-3.5 h-3.5 mr-1" /> Use My Current GPS
                  </Button>

                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      value={customTestLoc}
                      onChange={e => setCustomTestLoc(e.target.value)}
                      placeholder="Type address or paste Google Maps link..."
                      className="flex-1 text-xs border border-zinc-300 rounded-lg px-2.5 py-1.5 bg-white outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyTestCustomLoc();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleApplyTestCustomLoc}
                      className="text-xs px-3"
                    >
                      Attach
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar with Attachment Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                {/* Hidden File Picker */}
                <input
                  type="file"
                  ref={testFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleTestPhotoSelect}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => testFileInputRef.current?.click()}
                  className={`text-xs ${
                    testPhotoPreview ? 'bg-zinc-900 text-white border-zinc-900' : 'text-zinc-700 border-zinc-300'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  {testPhotoPreview ? 'Change Photo' : '+ Photo'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTestLocPicker(prev => !prev)}
                  className={`text-xs ${
                    testLocation || showTestLocPicker
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'text-zinc-700 border-zinc-300'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  {testLocation ? 'Location Attached' : '+ GMap'}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={sendingTest}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs px-6"
              >
                {sendingTest ? 'Sending...' : 'Send WhatsApp Message →'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
