export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  avatar?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
