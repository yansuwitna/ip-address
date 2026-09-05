import os
import re

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# 1. Imports
if "Link2" not in content:
    content = content.replace("  CheckCircle2,\n  Lock\n} from 'lucide-react';", "  CheckCircle2,\n  Lock,\n  Link2,\n  Copy,\n  RefreshCw\n} from 'lucide-react';")

# 2. Add generateToken handler
handler = """  const generateMagicToken = () => {
    if (!singleUser) return;
    
    // Generate 100 char alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(100);
    crypto.getRandomValues(array);
    for (let i = 0; i < 100; i++) {
      token += chars[array[i] % chars.length];
    }
    
    onSaveUser({
      ...singleUser,
      password: undefined, // ensure password isn't overridden with empty
      magicToken: token
    } as any);
  };
  
  const copyMagicLink = () => {
    if (singleUser?.magicToken) {
      const url = `${window.location.origin}${window.location.pathname}?token=${singleUser.magicToken}`;
      navigator.clipboard.writeText(url);
      setIsSuccessToast(true);
      setTimeout(() => setIsSuccessToast(false), 3000);
    }
  };

"""

if "const generateMagicToken" not in content:
    content = content.replace("  return (\n    <div", handler + "  return (\n    <div")

# 3. Add Magic Link UI
# Put it after the Architecture Notice
old_notice = """          {/* Single User Architecture Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/60 rounded-2xl border border-blue-100 dark:border-blue-800/60 text-xs text-blue-900 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Sistem Akun Tunggal (Single User):</strong> Sistem IP & DNS dikonfigurasi untuk menggunakan 1 akun utama terpusat. Anda dapat memperbarui nama, username, email, dan kata sandi kapan saja melalui tombol ubah di atas.
            </div>
          </div>"""

new_notice = """          {/* Single User Architecture Notice */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/60 rounded-2xl border border-blue-100 dark:border-blue-800/60 text-xs text-blue-900 flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Sistem Akun Tunggal (Single User):</strong> Sistem IP & DNS dikonfigurasi untuk menggunakan 1 akun utama terpusat. Anda dapat memperbarui nama, username, email, dan kata sandi kapan saja melalui tombol ubah di atas.
            </div>
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
          </div>"""

content = content.replace(old_notice, new_notice)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx patched for magic link.")
