import React, { useState } from 'react';
import { 
  Network, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { loginUser } from '../utils/auth';
import { User } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Autentikasi gagal! Periksa username & password.');
      }
    }, 400);
  };

  const handleQuickLogin = (usr: string, pwd: string) => {
    setUsername(usr);
    setPassword(pwd);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(usr, pwd);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/60 to-blue-100/50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-poppins">
      
      {/* Decorative Bright Background Ornaments */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay for Unique Network Tech Feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-blue-200/80 text-blue-700 text-xs font-medium shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>NetIPAM • Network Address Management</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-500/10 transition-all">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white rounded-2xl shadow-lg shadow-blue-500/30 mb-3 transform hover:scale-105 transition-transform">
              <Network className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Silakan login untuk mengakses data grup IP & alokasi host
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider text-center mb-3">
              1-Klik Masuk Demo (Pilih Akun)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  admin / admin123
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator', 'operator123')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                  <span>Operator</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  operator / operator123
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Feature Badges (Cerah, Unik & Modern) */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Kalkulator Subnet</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Visual IP Grid</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Auto Free IP</span>
          </span>
        </div>

      </div>

    </div>
  );
};
