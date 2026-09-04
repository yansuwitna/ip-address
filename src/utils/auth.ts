import { User } from '../types/auth';

const AUTH_STORAGE_KEY = 'netipam_auth_session';

export const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: 'usr-1',
      username: 'admin',
      name: 'Budi Hartono, S.Kom',
      email: 'admin@netipam.corp',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    }
  },
  operator: {
    password: 'operator123',
    user: {
      id: 'usr-2',
      username: 'operator',
      name: 'Siti Rahmawati',
      email: 'operator@netipam.corp',
      role: 'operator',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    }
  }
};

export function loginUser(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const account = DEMO_USERS[username.trim().toLowerCase()];
  if (!account) {
    return { success: false, error: 'Username tidak ditemukan!' };
  }

  if (account.password !== password) {
    return { success: false, error: 'Password salah!' };
  }

  const authenticatedUser: User = {
    ...account.user,
    lastLogin: new Date().toISOString()
  };

  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
  } catch (e) {
    console.error('Failed to save session:', e);
  }

  return { success: true, user: authenticatedUser };
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read session:', e);
    return null;
  }
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove session:', e);
  }
}
