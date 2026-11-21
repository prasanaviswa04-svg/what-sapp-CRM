import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Building2, Lock, Mail, ArrowRight, Settings, Wifi, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { setCustomApiHost } from '../../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Server configuration state for mobile network flexibility
  const [serverUrl, setServerUrl] = useState(() => {
    return localStorage.getItem('estateflow_api_host') || 'http://10.1.40.60:5000';
  });
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ tested: false, success: false, message: '' });

  const handleTestConnection = async () => {
    let clean = (serverUrl || '').trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    setIsTesting(true);
    setConnectionStatus({ tested: false, success: false, message: '' });
    try {
      const res = await axios.get(`${clean}/api/health`, { timeout: 5000 });
      if (res.data?.status === 'healthy') {
        setConnectionStatus({
          tested: true,
          success: true,
          message: `Connected successfully! (${res.data.service || 'EstateFlow CRM Backend'})`,
        });
        addToast('Server connection test successful!', 'success');
      } else {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'Server responded, but unexpected response payload.',
        });
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus({
        tested: true,
        success: false,
        message: `Failed to reach ${clean}. Make sure your PC is running the backend server and phone is on the same Wi-Fi.`,
      });
      addToast('Cannot reach server at this address', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveServer = () => {
    let clean = (serverUrl || '').trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    setServerUrl(clean);
    setCustomApiHost(clean);
    addToast(`Server URL updated to: ${clean}`, 'success');
  };

  const handleResetServer = () => {
    const defaultUrl = 'http://10.1.40.60:5000';
    setServerUrl(defaultUrl);
    setCustomApiHost(defaultUrl);
    setConnectionStatus({ tested: false, success: false, message: '' });
    addToast('Server URL reset to: ' + defaultUrl, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to EstateFlow CRM', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error';
      if (isNetworkError) {
        setShowServerConfig(true);
      }
      const errorMsg =
        err.response?.data?.message ||
        (isNetworkError
          ? 'Cannot connect to server. Please verify your phone is on the same Wi-Fi network as the PC!'
          : err.message) ||
        'Login failed. Please check credentials.';
      addToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address to reset password', 'info');
      return;
    }
    addToast(`Password reset link sent to ${email}`, 'success');
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
                  placeholder="name@company.com"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                />
                <span className="text-[11px]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-zinc-600 hover:text-zinc-950 font-medium hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
              Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>

            {/* Quick Demo Access for Mobile / Convenience */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-zinc-400">or 1-Tap Demo Sign-in</span>
                <div className="flex-grow border-t border-zinc-200"></div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setEmail('admin@estateflow.io');
                  setPassword('Admin@12345');
                  setIsLoading(true);
                  try {
                    await login('admin@estateflow.io', 'Admin@12345');
                    addToast('Signed in as Admin', 'success');
                    navigate('/dashboard');
                  } catch (err) {
                    console.error('Demo login error:', err);
                    const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error';
                    if (isNetworkError) {
                      setShowServerConfig(true);
                    }
                    const errorMsg =
                      err.response?.data?.message ||
                      (isNetworkError
                        ? 'Cannot connect to server. Please ensure phone is connected to the same Wi-Fi network as the PC!'
                        : err.message) ||
                      'Login failed';
                    addToast(errorMsg, 'error');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full py-2 px-3 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition border border-zinc-300 flex items-center justify-center gap-1.5"
              >
                ⚡ 1-Tap Admin Demo Sign-in
              </button>
            </div>
          </form>

          {/* Server Connection Settings Configuration */}
          <div className="mt-4 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="w-full flex items-center justify-between text-[11px] text-zinc-500 hover:text-zinc-800 transition py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Settings className="w-3.5 h-3.5 text-zinc-600" />
                Server: <code className="text-zinc-700 bg-zinc-100 px-1 py-0.5 rounded font-mono text-[10px]">{serverUrl}</code>
              </span>
              <span className="text-zinc-400 font-semibold">{showServerConfig ? '▲ Hide' : '▼ Configure'}</span>
            </button>

            {showServerConfig && (
              <div className="mt-2.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Backend Server URL / IP
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => {
                      setServerUrl(e.target.value);
                      setConnectionStatus({ tested: false, success: false, message: '' });
                    }}
                    placeholder="http://10.1.40.60:5000"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="flex-1 py-1.5 px-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-lg text-[11px] font-medium transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" /> Testing...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-600" /> Test Connection
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveServer}
                    className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[11px] font-medium transition"
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    onClick={handleResetServer}
                    title="Reset to default (http://10.1.40.60:5000)"
                    className="py-1.5 px-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-[11px] font-medium transition"
                  >
                    Reset
                  </button>
                </div>

                {connectionStatus.tested && (
                  <div
                    className={`p-2 rounded-lg text-[11px] flex items-start gap-1.5 leading-snug ${
                      connectionStatus.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {connectionStatus.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{connectionStatus.message}</span>
                  </div>
                )}

                <p className="text-[10px] text-zinc-400 leading-tight">
                  💡 If your PC Wi-Fi IP changes, type the new IP here and tap Save. PC and phone must be on the same Wi-Fi.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 text-center">
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
