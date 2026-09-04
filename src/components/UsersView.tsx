import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Edit3, 
  Trash2, 
  Mail, 
  User as UserIcon, 
  Key, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  CheckCircle2
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
    role: 'admin' | 'operator';
    avatar?: string;
  }) => { success: boolean; error?: string };
  onDeleteUser: (userId: string) => { success: boolean; error?: string };
}

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  currentUser,
  onSaveUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('operator');
  const [avatar, setAvatar] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('operator');
    setAvatar('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setPassword(''); // leave blank if unchanged
    setRole(user.role);
    setAvatar(user.avatar || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
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
    if (!editingUser && (!password || password.length < 4)) {
      setFormError('Kata sandi wajib diisi minimal 4 karakter untuk pengguna baru!');
      return;
    }
    if (password && password.length < 4) {
      setFormError('Kata sandi minimal 4 karakter!');
      return;
    }

    const res = onSaveUser({
      id: editingUser?.id,
      name,
      username,
      email,
      password: password || undefined,
      role,
      avatar: avatar.trim() || undefined
    });

    if (!res.success) {
      setFormError(res.error || 'Gagal menyimpan data pengguna!');
      return;
    }

    setIsModalOpen(false);
  };

  const handleDelete = (user: UserAccount) => {
    if (user.id === currentUser.id) {
      alert('Tidak dapat menghapus akun yang sedang Anda gunakan untuk login!');
      return;
    }

    const admins = users.filter(u => u.role === 'admin');
    if (user.role === 'admin' && admins.length <= 1) {
      alert('Tidak dapat menghapus akun: Sistem harus memiliki setidaknya satu akun Administrator!');
      return;
    }

    if (window.confirm(`Hapus pengguna "${user.name}" (@${user.username})?`)) {
      const res = onDeleteUser(user.id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus pengguna!');
      }
    }
  };

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalOperators = users.filter(u => u.role === 'operator').length;

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Manajemen Pengguna & Otorisasi
            </h2>
            <p className="text-xs text-slate-500">
              Kelola akun operator dan administrator yang memiliki hak akses sistem NetIPAM.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Akun Terdaftar</div>
            <div className="text-xl font-bold text-slate-900">{users.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Administrator</div>
            <div className="text-xl font-bold text-slate-900">{totalAdmins}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Operator Jaringan</div>
            <div className="text-xl font-bold text-slate-900">{totalOperators}</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Daftar Pengguna Aktif</h3>
            <p className="text-xs text-slate-500">Semua akun yang berhak login ke aplikasi ini</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {users.length} Akun
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum ada akun pengguna</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sistem saat ini belum memiliki akun terdaftar. Klik tombol di bawah untuk membuat akun baru.
            </p>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Buat Pengguna Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px] border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Pengguna / Nama</th>
                  <th className="px-5 py-3.5">Username</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Peran (Role)</th>
                  <th className="px-5 py-3.5">Terakhir Login</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded-md border border-blue-200">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-800">
                        @{user.username}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {user.email || '-'}
                      </td>

                      <td className="px-5 py-4">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserIcon className="w-3 h-3" />
                            <span>Operator</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(user.lastLogin).toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum pernah login</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit Pengguna"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isCurrent}
                            title={isCurrent ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Hartono, S.Kom"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="Contoh: budi_admin"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: budi@netipam.corp"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUser ? 'Kata Sandi Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? 'Masukkan kata sandi baru jika ingin mengganti' : 'Minimal 4 karakter'}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran Otorisasi (Role)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'operator'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Operator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
