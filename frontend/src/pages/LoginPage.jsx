import React, { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      if (email.toLowerCase() === 'analyst@breatheesg.com' && password === 'password123') {
        localStorage.setItem('auth', 'true');
        if (onLogin) onLogin();
      } else {
        setError('Invalid credentials. Please use the demo account details.');
      }
    }, 800);
  };

  const handleAutofill = () => {
    setEmail('analyst@breatheesg.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left panel - Branding and Animation */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B132B] relative overflow-hidden flex-col justify-between p-12">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
            <Leaf className="text-white fill-white" size={24} />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Breathe <span className="text-xs font-mono text-blue-400 block -mt-1 ml-0.5">ESG</span>
          </span>
        </div>

        {/* CSS/SVG Clean Energy Illustration */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center">
          <svg viewBox="0 0 400 300" className="w-full h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
            {/* Sky gradient background */}
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0B132B" />
              </linearGradient>
              <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#15343A" />
                <stop offset="100%" stopColor="#0f2427" />
              </linearGradient>
              <linearGradient id="sunRay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Back Hills */}
            <path d="M-50,300 C100,220 180,240 250,280 C320,240 380,250 450,300 Z" fill="#0f2427" opacity="0.6" />

            {/* Front Hill */}
            <path d="M-50,300 C80,240 180,230 280,260 C350,250 400,260 450,300 Z" fill="url(#hillGrad)" />

            {/* Solar Panel Blocks */}
            <g transform="translate(60, 240) scale(0.8)" stroke="#115e59" strokeWidth="1" fill="#1e293b">
              <polygon points="0,30 40,30 30,50 -10,50" fill="#14532d" />
              <line x1="10" y1="30" x2="0" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="20" y1="30" x2="10" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="30" y1="30" x2="20" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="0" y1="40" x2="35" y2="40" stroke="#22c55e" opacity="0.4" />
            </g>
            <g transform="translate(110, 248) scale(0.7)" stroke="#115e59" strokeWidth="1" fill="#1e293b">
              <polygon points="0,30 40,30 30,50 -10,50" fill="#14532d" />
              <line x1="10" y1="30" x2="0" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="20" y1="30" x2="10" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="30" y1="30" x2="20" y2="50" stroke="#22c55e" opacity="0.4" />
              <line x1="0" y1="40" x2="35" y2="40" stroke="#22c55e" opacity="0.4" />
            </g>

            {/* Wind Turbines */}
            {/* Turbine 1 (Large - Center) */}
            <g transform="translate(200, 130)">
              {/* Pole */}
              <line x1="0" y1="0" x2="0" y2="120" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              <line x1="0" y1="0" x2="0" y2="120" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
              
              {/* Rotating Blades */}
              <g className="animate-spin" style={{ transformOrigin: '0px 0px', animationDuration: '6s' }}>
                <circle cx="0" cy="0" r="4" fill="#64748b" />
                {/* Blade 1 */}
                <path d="M0,0 Q6,-40 0,-70 Q-6,-40 0,0 Z" fill="#e2e8f0" />
                {/* Blade 2 */}
                <path d="M0,0 Q34,22 60,35 Q22,25 0,0 Z" fill="#cbd5e1" />
                {/* Blade 3 */}
                <path d="M0,0 Q-40,18 -60,35 Q-28,15 0,0 Z" fill="#cbd5e1" />
              </g>
            </g>

            {/* Turbine 2 (Smaller - Left) */}
            <g transform="translate(290, 160) scale(0.7)">
              {/* Pole */}
              <line x1="0" y1="0" x2="0" y2="120" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
              
              {/* Rotating Blades */}
              <g className="animate-spin" style={{ transformOrigin: '0px 0px', animationDuration: '8s' }}>
                <circle cx="0" cy="0" r="4" fill="#64748b" />
                {/* Blade 1 */}
                <path d="M0,0 Q6,-40 0,-70 Q-6,-40 0,0 Z" fill="#e2e8f0" />
                {/* Blade 2 */}
                <path d="M0,0 Q34,22 60,35 Q22,25 0,0 Z" fill="#cbd5e1" />
                {/* Blade 3 */}
                <path d="M0,0 Q-40,18 -60,35 Q-28,15 0,0 Z" fill="#cbd5e1" />
              </g>
            </g>
          </svg>

          {/* Animated styles injection */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .animate-spin {
              animation: spin infinite linear;
            }
          `}} />

          <h2 className="text-2xl font-bold text-white text-center mt-6">Automating ESG Compliance</h2>
          <p className="text-gray-400 text-sm text-center mt-2 max-w-sm">
            Collect, normalize, validate, and report your carbon emissions across all scopes with enterprise integrity.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between text-xs text-gray-500">
          <span>&copy; 2026 Breathe ESG</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-gray-300">Privacy</a>
            <a href="#terms" className="hover:text-gray-300">Terms</a>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-20 bg-gray-50">
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 space-y-8">
          
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Leaf className="text-white fill-white" size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-wide">Breathe ESG</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Welcome back 👋</h3>
            <p className="text-gray-500 text-sm">Sign in to your account to manage your ESG data</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-semibold flex items-start gap-2 shadow-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900 transition-colors bg-gray-50/50"
                />
                <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-bold text-gray-700 tracking-wide uppercase">Password</label>
                <a href="#forgot" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" 
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-gray-900 transition-colors bg-gray-50/50"
                />
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={16} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-500 font-medium cursor-pointer select-none">Remember this device</label>
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

            {/* Demo Account Credentials Banner */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-blue-800 tracking-wide uppercase flex items-center gap-1">
                  <Info size={12} className="text-blue-600" /> Demo Credentials
                </span>
                <button 
                  type="button"
                  onClick={handleAutofill}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded transition-colors shadow-sm"
                >
                  Autofill
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-blue-800">
                <div>
                  <span className="text-[9px] text-blue-600 block font-bold uppercase tracking-wider">Email</span>
                  <span className="font-mono">analyst@breatheesg.com</span>
                </div>
                <div>
                  <span className="text-[9px] text-blue-600 block font-bold uppercase tracking-wider">Password</span>
                  <span className="font-mono">password123</span>
                </div>
              </div>
            </div>

          </form>

          <p className="text-center text-xs text-gray-400 font-medium leading-relaxed max-w-[320px] mx-auto">
            By signing in, you agree to our <a href="#terms" className="text-gray-500 hover:text-blue-600 underline">Terms of Service</a> and <a href="#privacy" className="text-gray-500 hover:text-blue-600 underline">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </div>
  );
}
