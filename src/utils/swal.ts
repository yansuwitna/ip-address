import Swal from 'sweetalert2';

// Helper to check if dark mode is active
const isDarkMode = () => {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
};

const getThemeConfig = () => {
  const dark = isDarkMode();
  return {
    background: dark ? '#1e293b' : '#ffffff',
    color: dark ? '#f1f5f9' : '#0f172a',
    customClass: {
      popup: dark ? 'border border-slate-700 shadow-2xl rounded-3xl font-poppins' : 'border border-slate-200 shadow-2xl rounded-3xl font-poppins',
      title: dark ? 'text-slate-100 font-bold text-lg' : 'text-slate-900 font-bold text-lg',
      htmlContainer: dark ? 'text-slate-300 text-xs' : 'text-slate-600 text-xs',
      confirmButton: 'px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer',
      cancelButton: 'px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer'
    }
  };
};

/**
 * Tampilkan pesan sukses
 */
export const showSuccess = (title: string, text?: string) => {
  const cfg = getThemeConfig();
  return Swal.fire({
    icon: 'success',
    title,
    text,
    background: cfg.background,
    color: cfg.color,
    confirmButtonColor: '#2563eb',
    customClass: cfg.customClass,
    timer: 2500,
    timerProgressBar: true
  });
};

/**
 * Tampilkan pesan error
 */
export const showError = (title: string, text?: string) => {
  const cfg = getThemeConfig();
  return Swal.fire({
    icon: 'error',
    title,
    text,
    background: cfg.background,
    color: cfg.color,
    confirmButtonColor: '#e11d48',
    customClass: cfg.customClass
  });
};

/**
 * Tampilkan pesan peringatan (warning)
 */
export const showWarning = (title: string, text?: string) => {
  const cfg = getThemeConfig();
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    background: cfg.background,
    color: cfg.color,
    confirmButtonColor: '#d97706',
    customClass: cfg.customClass
  });
};

/**
 * Tampilkan pesan informasi
 */
export const showInfo = (title: string, text?: string) => {
  const cfg = getThemeConfig();
  return Swal.fire({
    icon: 'info',
    title,
    text,
    background: cfg.background,
    color: cfg.color,
    confirmButtonColor: '#2563eb',
    customClass: cfg.customClass
  });
};

/**
 * Tampilkan dialog konfirmasi dengan Promise<boolean>
 */
export const showConfirm = async ({
  title,
  text,
  confirmButtonText = 'Ya, Lanjutkan',
  cancelButtonText = 'Batal',
  isDanger = false
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDanger?: boolean;
}): Promise<boolean> => {
  const cfg = getThemeConfig();
  const result = await Swal.fire({
    title,
    text,
    icon: isDanger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonColor: isDanger ? '#e11d48' : '#2563eb',
    cancelButtonColor: isDarkMode() ? '#475569' : '#94a3b8',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    background: cfg.background,
    color: cfg.color,
    customClass: cfg.customClass
  });

  return result.isConfirmed;
};

/**
 * Tampilkan toast notification di pojok kanan atas
 */
export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const cfg = getThemeConfig();
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: cfg.background,
    color: cfg.color,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  return Toast.fire({
    icon,
    title
  });
};

export default Swal;
