import '../css/components/AuthPage.css';
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
    <div className="authpage-element-1">
      {/* Animated Background */}
      <div className="authpage-element-2">
        <div className="authpage-element-3"></div>
        <div className="authpage-element-4" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="authpage-element-5">
        <div className="authpage-element-6">
          {/* Left Side - Branding */}
          <div className="authpage-element-7">
            <div className="authpage-element-8">
              <div className="authpage-element-9">
                <img src="/logo.jpg" alt="RAD" className="authpage-element-10" />
                <div>
                  <h1 className="authpage-element-11">RAD</h1>
                  <p className="authpage-element-12">Emergency Response System</p>
                </div>
              </div>
              
              <h2 className="authpage-element-13">
                Save Lives Through Smart Resource Allocation
              </h2>
              
              <p className="authpage-element-14">
                Real-time disaster management platform connecting citizens, authorities, and first responders for faster emergency response.
              </p>
            </div>

            <div className="authpage-element-15">
              <div className="authpage-element-16">
                <div className="authpage-element-17">24/7</div>
                <div className="authpage-element-18">Active Monitoring</div>
              </div>
              <div className="authpage-element-19">
                <div className="authpage-element-20">98%</div>
                <div className="authpage-element-21">Response Rate</div>
              </div>
              <div className="authpage-element-22">
                <div className="authpage-element-23">&lt;5m</div>
                <div className="authpage-element-24">Avg Response</div>
              </div>
            </div>

            <div className="authpage-element-25">
              <div className="authpage-element-26">
                <CheckCircle className="authpage-element-27" />
                <span>AI-powered resource allocation</span>
              </div>
              <div className="authpage-element-28">
                <CheckCircle className="authpage-element-29" />
                <span>Real-time incident tracking</span>
              </div>
              <div className="authpage-element-30">
                <CheckCircle className="authpage-element-31" />
                <span>Offline-first architecture</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="authpage-element-32">
            {/* Mobile Header */}
            <div className="authpage-element-33">
              <div className="authpage-element-34">
                <img src="/logo.jpg" alt="RAD" className="authpage-element-35" />
                <div>
                  <h1 className="authpage-element-36">RAD</h1>
                  <p className="authpage-element-37">Emergency Response</p>
                </div>
              </div>
            </div>

            <div className="authpage-element-38">
              <h3 className="authpage-element-39">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="authpage-element-40">
                {isLogin ? 'Sign in to access your dashboard' : 'Join the emergency response network'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="authpage-element-41">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="authpage-element-42">{error}</p>
              </div>
            )}

            {success && (
              <div className="authpage-element-43">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="authpage-element-44">{success}</p>
              </div>
            )}

            {/* Quick Login Demo Accounts */}
            {isLogin && (
              <div className="authpage-element-45">
                <p className="authpage-element-46">DEMO ACCOUNTS (Click to login):</p>
                <div className="authpage-element-47">
                  <button
                    type="button"
                    onClick={() => quickLogin('citizen@example.com', 'citizen123')}
                    className="group authpage-element-48"
                  >
                    <div className="authpage-element-49">
                      <Smartphone className="authpage-element-50" />
                      <span className="authpage-element-51">Citizen</span>
                    </div>
                    <p className="authpage-element-52">citizen@example.com</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('admin@emergency.gov', 'admin123')}
                    className="group authpage-element-53"
                  >
                    <div className="authpage-element-54">
                      <Briefcase className="authpage-element-55" />
                      <span className="authpage-element-56">Authority</span>
                    </div>
                    <p className="authpage-element-57">admin@emergency.gov</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLogin('responder@emergency.gov', 'responder123')}
                    className="group authpage-element-58"
                  >
                    <div className="authpage-element-59">
                      <Siren className="authpage-element-60" />
                      <span className="authpage-element-61">Responder</span>
                    </div>
                    <p className="authpage-element-62">responder@emergency.gov</p>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="authpage-element-63">
              {!isLogin && (
                <div>
                  <label className="authpage-element-64">Full Name</label>
                  <div className="authpage-element-65">
                    <User className="authpage-element-66" />
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
                <label className="authpage-element-67">Email Address</label>
                <div className="authpage-element-68">
                  <Mail className="authpage-element-69" />
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
                  <label className="authpage-element-70">Phone Number</label>
                  <div className="authpage-element-71">
                    <Phone className="authpage-element-72" />
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
                <label className="authpage-element-73">Password</label>
                <div className="authpage-element-74">
                  <Lock className="authpage-element-75" />
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
                    className="authpage-element-76"
                  >
                    {showPassword ? <EyeOff className="authpage-element-77" /> : <Eye className="authpage-element-78" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="authpage-element-79">Register As</label>
                  <div className="authpage-element-80">
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
                      <div className="authpage-element-81">Citizen</div>
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
                      <div className="authpage-element-82">Responder</div>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="authpage-element-83"
              >
                {loading ? (
                  <div className="authpage-element-84">
                    <div className="authpage-element-85"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="authpage-element-86">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="authpage-element-87"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <div className="authpage-element-88">
              <p className="authpage-element-89">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
