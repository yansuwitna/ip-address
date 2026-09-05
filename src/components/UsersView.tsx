import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { 
  User as UserIcon, 
  UserCheck, 
  Edit3, 
  Mail, 
  Key, 
  X, 
  AlertCircle,
  Clock,
  Calendar,
  Shield,
  CheckCircle2,
  Lock,
  Link2,
  Copy,
  RefreshCw,
  Download
} from 'lucide-react';
import { User, UserAccount } from '../types/auth';

interface UsersViewProps {
  users: UserAccount[];
  currentUser: User;
  onSaveUser: (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
    magicToken?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  onDeleteUser?: (userId: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onSaveUser
}) => {
  const singleUser = users[0] || (currentUser as UserAccount) || null;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccessToast, setIsSuccessToast] = useState(false);


  const openEditModal = () => {
    if (singleUser) {
      setName(singleUser.name);
      setUsername(singleUser.username);
      setEmail(singleUser.email || '');
      setPassword('');
      setAvatar(singleUser.avatar || '');
    } else {
      setName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setAvatar('');
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama lengkap wajib diisi!');
      return;
    }
    if (!username.trim()) {
      setFormError('Username wajib diisi!');
      return;
    }
    if (!singleUser && (!password || password.length < 4)) {
      setFormError('Kata sandi wajib diisi minimal 4 karakter!');
      return;
    }
    if (password && password.length < 4) {
      setFormError('Kata sandi minimal 4 karakter!');
      return;
    }

    const res = await onSaveUser({
      id: singleUser?.id,
      name,
      username,
      email,
      password: password || undefined,
      avatar: avatar.trim() || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan data pengguna!');
      return;
    }

    setIsModalOpen(false);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  const handleInstallPWA = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      const isIos = /ipad|iphone|ipod|macintosh/.test(navigator.userAgent.toLowerCase());
      const isAndroid = /android/.test(navigator.userAgent.toLowerCase());

      let htmlContent = '';
      if (isIos) {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Perangkat <b>Apple (iPhone/iPad/Mac)</b> memerlukan langkah manual untuk instalasi:</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Ketuk ikon <b>Bagikan (Share)</b> <svg class="inline w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> di menu Safari bagian bawah atau atas.</li>
              <li>Gulir ke bawah dan ketuk opsi <b>Tambah ke Layar Utama (Add to Home Screen)</b> <svg class="inline w-4 h-4 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>.</li>
              <li>Ketuk <b>Tambah (Add)</b> di sudut kanan atas.</li>
            </ol>
          </div>
        `;
      } else if (isAndroid) {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Sepertinya aplikasi sudah terinstal, atau peramban Chrome/Android Anda memblokir *popup*. Lakukan langkah manual ini:</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Ketuk menu <b>Titik Tiga</b> di pojok kanan atas layar peramban Anda.</li>
              <li>Pilih menu <b>Tambahkan ke Layar Utama (Add to Home screen)</b> atau <b>Instal Aplikasi</b>.</li>
            </ol>
          </div>
        `;
      } else {
        htmlContent = `
          <div class="text-sm text-slate-600 dark:text-slate-300 text-left space-y-3">
            <p>Sepertinya aplikasi sudah terinstal di PC Anda, atau peramban (browser) tidak menampilkan *prompt*.</p>
            <ol class="list-decimal pl-5 space-y-2">
              <li>Periksa <b>Bilah Alamat (Address Bar)</b> di Chrome/Edge bagian kanan.</li>
              <li>Cari ikon "Layar Komputer dengan tanda Plus" atau panah ke bawah, lalu klik untuk menginstal.</li>
              <li>Atau buka menu titik tiga browser dan cari opsi <b>Install app / Install NetIPAM</b>.</li>
            </ol>
          </div>
        `;
      }

      Swal.fire({
        title: 'Petunjuk Instalasi',
        html: htmlContent,
        icon: 'info',
        confirmButtonText: 'Saya Mengerti',
        confirmButtonColor: '#2563eb',
        background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a'
      });
      return;
    }
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    if (result.outcome === 'accepted') {
      (window as any).deferredPrompt = null;
    }
  };

  const generateMagicToken = () => {
    if (!singleUser) return;
    
    Swal.fire({
      title: singleUser.magicToken ? 'Generate Ulang Token?' : 'Buat Token Baru?',
      text: singleUser.magicToken 
        ? 'Token lama akan hangus dan URL/PWA shortcut lama Anda tidak bisa lagi digunakan untuk bypass login. Yakin ingin mengganti?' 
        : 'Token ini akan menghasilkan link khusus yang memungkinkan Anda login langsung tanpa password. Lanjutkan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Buat Token',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Generate 100 char alphanumeric string
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const array = new Uint8Array(100);
        crypto.getRandomValues(array);
        for (let i = 0; i < 100; i++) {
          token += chars[array[i] % chars.length];
        }
        
        const res = await onSaveUser({
          ...singleUser,
          password: undefined, // ensure password isn't overridden with empty
          magicToken: token
        } as any);
        
        // @ts-ignore
        if (res && res.success === false) {
          // @ts-ignore
          setFormError(res.error || 'Gagal menyimpan token ke database!');
        } else {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Token baru telah aktif dan tersimpan ke database.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  };
  
  const copyMagicLink = () => {
    if (singleUser?.magicToken) {
      const url = `${window.location.origin}${window.location.pathname}?token=${singleUser.magicToken}`;
      navigator.clipboard.writeText(url);
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-800/60">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Manajemen Akun Pengguna
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kelola kredensial login, nama profil, email, dan kata sandi akun sistem IP & DNS.
            </p>

          </div>
        </div>

        {singleUser && (
          <button
            onClick={openEditModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer w-full sm:w-auto justify-center sm:justify-start flex-shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profil & Kata Sandi</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {isSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Informasi akun berhasil diperbarui!</span>
        </div>
      )}

      {/* Single User Card */}
      {!singleUser ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum Ada Akun Pengguna</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Database pengguna saat ini kosong. Klik tombol di bawah untuk membuat akun pengguna sistem.
          </p>
          <button
            onClick={openEditModal}
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Buat Akun Pengguna
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-4">
              {singleUser.avatar ? (
                <img
                  src={singleUser.avatar}
                  alt={singleUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
                  {singleUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {singleUser.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Akun Utama
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  @{singleUser.username}
                </p>
              </div>
            </div>

            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
            >
              <Edit3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Ubah Kredensial</span>
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Alamat Email</span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 break-all">
                {singleUser.email || '-'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Sesi Terakhir Login</span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {singleUser.lastLogin ? new Date(singleUser.lastLogin).toLocaleString('id-ID') : 'Baru saja'}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Terdaftar</span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {singleUser.createdAt ? new Date(singleUser.createdAt).toLocaleDateString('id-ID') : '01/01/2026'}
              </div>
            </div>

          </div>

          {/* Single User Architecture Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/60 rounded-2xl border border-blue-100 dark:border-blue-800/60 text-xs text-blue-900 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Sistem Akun Tunggal (Single User):</strong> Sistem IP & DNS dikonfigurasi untuk menggunakan 1 akun utama terpusat. Anda dapat memperbarui nama, username, email, dan kata sandi kapan saja melalui tombol ubah di atas.
            </div>
          </div>

          {/* PWA Install Section */}
          <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl border border-blue-500 shadow-lg text-white space-y-4 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Instal Aplikasi (PWA)</h4>
                  <p className="text-[11px] text-blue-100 max-w-sm">Jadikan sistem ini sebagai aplikasi desktop/mobile independen di perangkat Anda untuk akses cepat dan layar penuh.</p>
                </div>
              </div>
              <button
                onClick={handleInstallPWA}
                className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto flex-shrink-0"
              >
                Instal Sekarang
              </button>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>

          {/* Magic Link Section */}
          <div className="p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Akses Login Instan (Magic Link)</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Gunakan URL token untuk masuk tanpa username & sandi selamanya.</p>
                </div>
              </div>
              <button
                onClick={generateMagicToken}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-[11px] font-bold transition-all cursor-pointer w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{singleUser.magicToken ? 'Generate Ulang Token' : 'Buat Token Sekarang'}</span>
              </button>
            </div>
            
            {singleUser.magicToken ? (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 overflow-hidden">
                  <code className="text-[10px] text-slate-600 dark:text-slate-400 break-all select-all block whitespace-pre-wrap">
                    {`${window.location.origin}${window.location.pathname}?token=${singleUser.magicToken}`}
                  </code>
                </div>
                <button
                  onClick={copyMagicLink}
                  className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all cursor-pointer flex-shrink-0"
                  title="Salin URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">
                Token login instan belum dibuat untuk akun ini.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Edit / Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:items-center sm:pt-4 overflow-y-auto p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {singleUser ? 'Ubah Profil & Kata Sandi' : 'Buat Akun Pengguna'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Perbarui informasi akun sistem IP & DNS
                  </p>
                </div>
              </div>


              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Hartono, S.Kom"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="Contoh: admin"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: admin@ipaddress.lan"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {singleUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={singleUser ? 'Masukkan sandi baru jika ingin mengganti' : 'Minimal 4 karakter'}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-100 w-full">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
