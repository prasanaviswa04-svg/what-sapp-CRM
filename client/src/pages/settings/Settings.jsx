import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Building,
  Shield,
  Key,
  Save,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  X,
  Laptop,
  Link as LinkIcon
} from 'lucide-react';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'security'
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [loginHistory, setLoginHistory] = useState([]);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Company Form State
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [timeZone, setTimeZone] = useState('Asia/Kolkata');
  const [savingCompany, setSavingCompany] = useState(false);

  // Initialize from Auth user and backend
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setUserPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch detailed profile & session history
        const meRes = await api.get('/auth/me');
        if (meRes.data.success && meRes.data.user) {
          const u = meRes.data.user;
          setFirstName(u.firstName || '');
          setLastName(u.lastName || '');
          setUserPhone(u.phone || '');
          setAvatar(u.avatar || '');
          if (u.loginHistory) setLoginHistory(u.loginHistory);
        }

        // Fetch company settings
        const settingsRes = await api.get('/settings');
        if (settingsRes.data.success && settingsRes.data.settings) {
          const s = settingsRes.data.settings;
          setCompanyName(s.name || '');
          setCompanyEmail(s.email || '');
          setCompanyPhone(s.phone || '');
          setCurrencySymbol(s.currency?.symbol || '₹');
          setCurrencyCode(s.currency?.code || 'INR');
          setTimeZone(s.timeZone || 'Asia/Kolkata');
        }
      } catch (err) {
        console.error('Error fetching settings/profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Handle User File Upload for Profile Picture (auto-optimizes and saves immediately)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Auto-scale to max 400x400 to keep it sharp and fast
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setAvatar(dataUrl);

        // Instantly save to database and AuthContext so it is persisted across refreshes
        try {
          const res = await api.put('/auth/profile', { avatar: dataUrl });
          if (res.data.success) {
            updateUser({ ...user, avatar: dataUrl });
            addToast('Profile picture uploaded and saved successfully!', 'success');
          }
        } catch (err) {
          console.error('Error saving uploaded avatar:', err);
          addToast('Photo preview ready. Click "Save Profile Changes" to finalize.', 'info');
        } finally {
          setUploadingAvatar(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle Remove Profile Picture (persists immediately to DB and AuthContext)
  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      // 1. Immediately persist empty avatar in backend database
      const res = await api.put('/auth/profile', { avatar: '' });
      if (res.data.success) {
        // 2. Clear state and file input
        setAvatar('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        // 3. Immediately update AuthContext and localStorage
        updateUser({ ...user, avatar: '' });

        addToast('Profile picture removed and saved permanently!', 'success');
      }
    } catch (err) {
      console.error('Error removing profile photo:', err);
      // Fallback local clear
      setAvatar('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      updateUser({ ...user, avatar: '' });
      addToast('Profile photo cleared. Click "Save Profile Changes" to confirm.', 'info');
    } finally {
      setRemovingAvatar(false);
    }
  };

  // Handle Apply Custom Web URL (persists immediately)
  const handleApplyUrl = async () => {
    if (customAvatarUrl.trim()) {
      const url = customAvatarUrl.trim();
      setAvatar(url);
      setCustomAvatarUrl('');
      setShowUrlInput(false);

      try {
        const res = await api.put('/auth/profile', { avatar: url });
        if (res.data.success) {
          updateUser({ ...user, avatar: url });
          addToast('Profile picture URL applied and saved successfully!', 'success');
        }
      } catch (err) {
        addToast('Link applied! Click "Save Profile Changes" to confirm.', 'info');
      }
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      addToast('First name and last name are required', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: userPhone.trim(),
        avatar: avatar || ''
      });

      if (res.data.success) {
        updateUser(res.data.user);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        addToast('Password updated successfully! Keep your credentials secure.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update password. Verify current password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Save Company Settings
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const res = await api.put('/settings', {
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        currency: { code: currencyCode, symbol: currencySymbol },
        timeZone
      });
      if (res.data.success) {
        addToast('Brokerage settings saved successfully!', 'success');
      }
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSavingCompany(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'Full infrastructure root access, multi-tenant governance, system health telemetry & audit logs.';
      case 'Company Admin':
        return 'Full brokerage executive control, revenue analytics, broker management, listings and billing.';
      case 'Real Estate Manager':
        return 'Pipeline supervisor, broker workload balancing, showing schedules, and lead distribution.';
      case 'Property Broker':
        return 'Luxury property inventory showcase, WhatsApp client takeover, site showings, and direct closing.';
      case 'Sales Agent':
        return 'Inbound lead qualification, daily call quota tracking, and active CRM follow-up checklist.';
      case 'Customer Support Agent':
        return 'First-touch WhatsApp reception, rapid FAQ responses, SLA tracking, and visit bookings.';
      default:
        return 'Standard CRM workspace access.';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300/80">
              SYSTEM PREFERENCES & ACCOUNT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Account & Platform Settings</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your personal profile, credentials, brokerage company branding, and system configurations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold" size="md">
            Logged in as: {user?.role || 'Company Admin'}
          </Badge>
        </div>
      </div>

      {/* Modern Minimalist Tabs */}
      <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#ff9e43] text-amber-950 bg-amber-50/60 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-amber-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'company'
              ? 'border-[#ff9e43] text-amber-950 bg-amber-50/60 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-amber-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company & Agency</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#ff9e43] text-amber-950 bg-amber-50/60 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-amber-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Security & Passwords</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY PROFILE */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Role Summary Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Profile Picture"
                subtitle="Only you can upload and manage your photo"
              />
              <CardContent className="space-y-5">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full border-2 border-zinc-200 overflow-hidden bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-3xl shadow-sm">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span>
                          {firstName?.[0] || 'U'}{lastName?.[0] || 'S'}
                        </span>
                      )}
                    </div>

                    {/* Quick remove X on top-right of avatar */}
                    {avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={removingAvatar}
                        className="absolute -top-1 -right-1 p-1 bg-white border border-zinc-300 text-zinc-600 hover:text-zinc-950 rounded-full shadow-sm transition hover:bg-zinc-100"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Camera icon trigger */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-md transition"
                      title="Upload new photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-950 mt-3">
                    {firstName} {lastName}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-900 text-white">
                      {user?.role || 'Company Admin'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">{user?.email}</p>
                </div>

                {/* File Upload Controls */}
                <div className="space-y-2 pt-2 border-t border-zinc-100">
                  {/* Hidden Native File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Primary Upload Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    isLoading={uploadingAvatar}
                    className="w-full flex items-center justify-center gap-2 border-zinc-300 text-zinc-900 hover:bg-zinc-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload From Device</span>
                  </Button>

                  {/* Remove Button (Only visible if avatar exists) */}
                  {avatar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      isLoading={removingAvatar}
                      className="w-full flex items-center justify-center gap-2 border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </Button>
                  )}

                  <p className="text-[10px] text-zinc-400 text-center leading-tight">
                    JPG, PNG or WebP up to 5MB. Photo is scaled automatically.
                  </p>

                  {/* Secondary option: Web URL */}
                  <div className="pt-2 border-t border-zinc-100">
                    {!showUrlInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="w-full text-center text-[11px] text-zinc-500 hover:text-zinc-950 font-medium py-1 transition flex items-center justify-center gap-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Or use photo web link</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-zinc-700">Image Web URL</label>
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(false)}
                            className="text-[10px] text-zinc-400 hover:text-zinc-700"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="url"
                            value={customAvatarUrl}
                            onChange={(e) => setCustomAvatarUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                            className="flex-1 p-1 text-xs border border-zinc-300 rounded focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyUrl}
                            className="px-2 py-1 text-xs bg-zinc-900 text-white rounded hover:bg-zinc-800 font-medium"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Privileges Box */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900">
                    <Shield className="w-3.5 h-3.5 text-zinc-700" />
                    <span>Role Privileges</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    {getRoleDescription(user?.role)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right 2 Columns: Edit Details Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Personal Information"
                subtitle="Update your basic contact details and brokerage profile"
              />
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="e.g. Aarav"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="e.g. Singhania"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">
                        Work Email Address
                        <span className="text-[10px] font-normal text-zinc-400 ml-1.5">(Primary ID)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={user?.email || ''}
                          className="w-full p-2 text-xs border border-zinc-200 bg-zinc-50 text-zinc-500 rounded-lg cursor-not-allowed"
                        />
                        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-[10px] font-semibold text-zinc-700">
                          <CheckCircle2 className="w-3 h-3 text-zinc-900" /> Verified
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Email cannot be changed directly as it is bound to your role permissions.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Direct Phone / WhatsApp *</label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={(e) => setUserPhone(e.target.value)}
                          className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Used for direct lead routing and client WhatsApp escalations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                      <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Assigned Brokerage
                      </span>
                      <p className="text-xs font-bold text-zinc-900 mt-0.5">
                        {user?.companyName || 'EstateFlow Luxury Realty'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                      <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Security Status
                      </span>
                      <p className="text-xs font-bold text-zinc-900 mt-0.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-zinc-900"></span> Active & Authenticated
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      Changes update immediately across the platform.
                    </span>
                    <Button type="submit" variant="gold" size="sm" isLoading={savingProfile} icon={Save}>
                      Save Profile Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Session & Security Preview */}
            <Card>
              <CardHeader
                title="Current Session & Login Audit"
                subtitle="Your active device and recent authentication events"
              />
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md border border-zinc-200 text-zinc-800">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                          <span>Current Web Session</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-900 text-white font-medium">
                            Active Now
                          </span>
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          IP: 127.0.0.1 • Local Workspace
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-600">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {loginHistory.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                        Recent Logins
                      </p>
                      <div className="space-y-1.5">
                        {loginHistory.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 px-2.5 rounded border border-zinc-100 text-[11px] text-zinc-600">
                            <span className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span>IP {item.ip || '127.0.0.1'} ({item.device || 'Desktop'})</span>
                            </span>
                            <span className="text-zinc-400">
                              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMPANY & AGENCY SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Company & Brokerage Profile"
                subtitle="Public agency contact information, brand identity and currency"
              />
              <CardContent>
                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1">Company / Agency Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                      placeholder="e.g. EstateFlow Luxury Realty"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Official Business Email</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                          placeholder="contact@estateflow.io"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Official Business Phone</label>
                      <input
                        type="tel"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Currency Code</label>
                      <input
                        type="text"
                        value={currencyCode}
                        onChange={(e) => setCurrencyCode(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="INR"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Timezone</label>
                      <input
                        type="text"
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="Asia/Kolkata"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex justify-end">
                    <Button type="submit" variant="gold" size="sm" isLoading={savingCompany} icon={Save}>
                      Save Company Profile
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-zinc-200 bg-zinc-50/50">
              <CardHeader title="Brokerage Details" subtitle="Global agency metadata" />
              <CardContent className="space-y-3 text-xs text-zinc-600">
                <div className="p-3 bg-white rounded-lg border border-zinc-200">
                  <span className="block text-[10px] uppercase font-semibold text-zinc-400">Company ID</span>
                  <p className="font-mono text-zinc-800 text-[11px] truncate mt-0.5">{user?.companyId || 'company_default'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-zinc-200">
                  <span className="block text-[10px] uppercase font-semibold text-zinc-400">Meta API Status</span>
                  <p className="font-semibold text-zinc-900 mt-0.5">Webhook Active & Verified</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SECURITY & PASSWORD CHANGE */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader
                title="Change Account Password"
                subtitle="Ensure your brokerage account remains secure with strong authentication"
              />
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-1">Current Password *</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1">Confirm New Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 focus:outline-none"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="gold" size="sm" isLoading={savingPassword} icon={Key}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-zinc-200 bg-zinc-50/50">
              <CardHeader title="Security Recommendations" subtitle="Best practices for agents & admins" />
              <CardContent className="space-y-3 text-xs text-zinc-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span>Use at least 8 alphanumeric characters and special symbols.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span>Never share your login credentials across unauthorized devices.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span>JWT tokens expire automatically to protect client customer databases.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
