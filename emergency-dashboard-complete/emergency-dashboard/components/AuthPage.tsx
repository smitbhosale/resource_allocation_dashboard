import React, { useState } from 'react';
import { UserRole } from '../types';
import { authService } from '../services/authService';
import { Shield, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Eye, EyeOff, Smartphone, Briefcase, Siren } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: (role: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'citizen' as UserRole
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    setTimeout(() => {
      if (isLogin) {
        const result = authService.login(formData.email, formData.password);
        if (result.success && result.user) {
          setSuccess(result.message);
          setTimeout(() => onAuthSuccess(result.user!.role), 500);
        } else {
          setError(result.message);
        }
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const result = authService.signup(formData);
        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ ...formData, password: '' });
          }, 1000);
        } else {
          setError(result.message);
        }
      }
      setLoading(false);
    }, 800);
  };

  const quickLogin = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setError('');
    setLoading(true);
    
    setTimeout(() => {
      const result = authService.login(email, password);
      if (result.success && result.user) {
        setSuccess('Login successful!');
        setTimeout(() => onAuthSuccess(result.user!.role), 500);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block text-white space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight">DPI-4</h1>
                  <p className="text-blue-300 text-sm font-medium">Emergency Response System</p>
                </div>
              </div>
              
              <h2 className="text-5xl font-black leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                Save Lives Through Smart Resource Allocation
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Real-time disaster management platform connecting citizens, authorities, and first responders for faster emergency response.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-black text-blue-400">24/7</div>
                <div className="text-sm text-slate-300 mt-1">Active Monitoring</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-black text-green-400">98%</div>
                <div className="text-sm text-slate-300 mt-1">Response Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-3xl font-black text-purple-400">&lt;5m</div>
                <div className="text-sm text-slate-300 mt-1">Avg Response</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>AI-powered resource allocation</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Real-time incident tracking</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Offline-first architecture</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">DPI-4</h1>
                  <p className="text-blue-600 text-xs font-medium">Emergency Response</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-3xl font-black text-slate-900 mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-slate-500">
                {isLogin ? 'Sign in to access your dashboard' : 'Join the emergency response network'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}

            {/* Quick Login Demo Accounts */}
            {isLogin && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-900 mb-3">DEMO ACCOUNTS (Click to login):</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLogin('citizen@example.com', 'citizen123')}
                    className="p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-all group text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Citizen</span>
                    </div>
                    <p className="text-[10px] text-slate-500">citizen@example.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('admin@emergency.gov', 'admin123')}
                    className="p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-all group text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Authority</span>
                    </div>
                    <p className="text-[10px] text-slate-500">admin@emergency.gov</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('responder@emergency.gov', 'responder123')}
                    className="p-3 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-500 transition-all group text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Siren className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Responder</span>
                    </div>
                    <p className="text-[10px] text-slate-500">responder@emergency.gov</p>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-medium"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-medium"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-medium"
                      placeholder="+91-9876543210"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all text-slate-900 font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Register As</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'citizen' })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.role === 'citizen'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'citizen' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="text-sm font-bold text-slate-900">Citizen</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'civil_servant' })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.role === 'civil_servant'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Siren className={`w-6 h-6 mx-auto mb-2 ${formData.role === 'civil_servant' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div className="text-sm font-bold text-slate-900">Responder</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:text-blue-700 font-bold text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
