import { User, UserAccount } from '../types/auth';

const AUTH_STORAGE_KEY = 'netipam_auth_session';
const USERS_STORAGE_KEY = 'netipam_users_list_v1';

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'admin123',
    name: 'Budi Hartono, S.Kom',
    email: 'admin@netipam.corp',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'usr-2',
    username: 'operator',
    password: 'operator123',
    name: 'Siti Rahmawati',
    email: 'operator@netipam.corp',
    role: 'operator',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T09:30:00.000Z'
  }
];

export function loadUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw === null) {
      // First initialization
      saveUsers(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users:', e);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function createUser(userData: {
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'operator';
  avatar?: string;
}): { success: boolean; error?: string; user?: UserAccount } {
  const users = loadUsers();
  const normalizedUsername = userData.username.trim().toLowerCase();

  if (!normalizedUsername) {
    return { success: false, error: 'Username wajib diisi!' };
  }
  if (!userData.password || userData.password.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter!' };
  }
  if (!userData.name.trim()) {
    return { success: false, error: 'Nama lengkap wajib diisi!' };
  }

  const exists = users.some(u => u.username.toLowerCase() === normalizedUsername);
  if (exists) {
    return { success: false, error: `Username "${userData.username}" sudah digunakan!` };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    username: normalizedUsername,
    name: userData.name.trim(),
    email: userData.email.trim(),
    password: userData.password,
    role: userData.role,
    avatar: userData.avatar || undefined,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  return { success: true, user: newUser };
}

export function updateUser(
  id: string,
  updates: Partial<Omit<UserAccount, 'id'>>
): { success: boolean; error?: string; user?: UserAccount } {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan!' };
  }

  if (updates.username) {
    const normalizedUsername = updates.username.trim().toLowerCase();
    const exists = users.some(u => u.id !== id && u.username.toLowerCase() === normalizedUsername);
    if (exists) {
      return { success: false, error: `Username "${updates.username}" sudah digunakan!` };
    }
    updates.username = normalizedUsername;
  }

  const current = users[index];
  const updatedUser: UserAccount = {
    ...current,
    ...updates,
    password: updates.password && updates.password.trim() ? updates.password : current.password
  };

  users[index] = updatedUser;
  saveUsers(users);

  // If current session is this user, update session as well
  const currentSession = getCurrentUser();
  if (currentSession && currentSession.id === id) {
    const { password: _, ...sessionUser } = updatedUser;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch (e) {
      console.error('Failed to update session:', e);
    }
  }

  return { success: true, user: updatedUser };
}

export function deleteUser(id: string): { success: boolean; error?: string } {
  const users = loadUsers();
  const target = users.find(u => u.id === id);
  if (!target) {
    return { success: false, error: 'Pengguna tidak ditemukan!' };
  }

  const updatedUsers = users.filter(u => u.id !== id);
  saveUsers(updatedUsers);

  const currentSession = getCurrentUser();
  if (currentSession && currentSession.id === id) {
    logoutUser();
  }

  return { success: true };
}

export function loginUser(username: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = loadUsers();
  const account = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  
  if (!account) {
    return { success: false, error: 'Username tidak ditemukan!' };
  }

  if (account.password !== password) {
    return { success: false, error: 'Password salah!' };
  }

  const now = new Date().toISOString();
  // Update lastLogin in storage
  const updatedUsers = users.map(u => u.id === account.id ? { ...u, lastLogin: now } : u);
  saveUsers(updatedUsers);

  const authenticatedUser: User = {
    id: account.id,
    username: account.username,
    name: account.name,
    email: account.email,
    role: account.role,
    avatar: account.avatar,
    lastLogin: now,
    createdAt: account.createdAt
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

export function wipeAllUsers(): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to wipe users:', e);
  }
}

