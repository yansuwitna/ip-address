import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Activity,
  UserPlus,
  X,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { loginUser, loadUsers, createUser } from '../utils/auth';
import { User } from '../types/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onBackToHome?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToHome }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNoUsers, setHasNoUsers] = useState(false);

  // Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'operator'>('admin');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadUsers();
    if (existing.length === 0) {
      setHasNoUsers(true);
      setRegRole('admin');
    } else {
      setHasNoUsers(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan kata sandi wajib diisi!');
      return;
    }

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
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi!');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Username wajib diisi!');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('Kata sandi minimal 4 karakter!');
      return;
    }

    const res = createUser({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPassword,
      role: regRole
    });

    if (!res.success || !res.user) {
      setRegError(res.error || 'Gagal membuat pengguna baru!');
      return;
    }

    setRegSuccess(`Pengguna "${res.user.username}" berhasil dibuat! Masuk otomatis...`);
    setHasNoUsers(false);

    // Automatically log in
    setTimeout(() => {
      const loginRes = loginUser(res.user!.username, regPassword);
      if (loginRes.success && loginRes.user) {
        onLoginSuccess(loginRes.user);
      } else {
        setIsRegisterOpen(false);
        setUsername(res.user!.username);
        setPassword(regPassword);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-sky-50/60 to-blue-100/50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-poppins">
      
      {/* Decorative Bright Background Ornaments */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e40af 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">

        {/* Back to Home Button */}
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Halaman Beranda (Home)</span>
          </button>
        )}
        
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
              Silakan login untuk mengakses sistem manajemen grup & alokasi IP
            </p>
          </div>

          {/* Alert if No Users Exist */}
          {hasNoUsers && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Belum Ada Akun Pengguna</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Database akun saat ini kosong (misal setelah hapus semua data). Silakan buat akun Administrator pertama Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRegRole('admin');
                  setIsRegisterOpen(true);
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Buat Pengguna Pertama</span>
              </button>
            </div>
          )}

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
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Create User Link */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setRegError(null);
                setRegSuccess(null);
                setIsRegisterOpen(true);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Belum punya akun? Buat Pengguna Baru</span>
            </button>
          </div>

        </div>

        {/* Bottom Feature Badges */}
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

      {/* Modal Buat Pengguna Baru */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {hasNoUsers ? 'Buat Pengguna Pertama (Admin)' : 'Buat Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Daftarkan akun pengguna baru ke sistem NetIPAM
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Budi Hartono, S.Kom"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="Contoh: budi_admin"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Contoh: budi@netipam.corp"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran Otorisasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      regRole === 'admin'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Administrator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('operator')}
                    disabled={hasNoUsers}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      hasNoUsers
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                        : regRole === 'operator'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 cursor-pointer'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Operator</span>
                  </button>
                </div>
                {hasNoUsers && (
                  <p className="text-[10px] text-amber-700 mt-1">
                    * Akun pertama wajib memiliki peran Administrator.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Buat Pengguna
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

