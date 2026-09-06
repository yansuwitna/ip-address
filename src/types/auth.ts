export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  appName?: string;
  appLogo?: string;
  lastLogin?: string;
  createdAt?: string;
  magicToken?: string;
}


export interface UserAccount extends User {
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

