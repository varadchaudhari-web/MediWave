import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { demoCredentials } from '@/data/mockData';
import { toast } from 'sonner';
import { sanitizeEmail, sanitizeMobile, sanitizeName, sanitizePassword } from '@/lib/validation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterAccountInput) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export interface RegisterAccountInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: User[] = [
  {
    id: 'p1',
    name: 'John Smith',
    email: 'patient@mediwave.health',
    role: 'patient',
    avatar: '/avatars/patient-1.svg',
    phone: '+91 98765 43210',
    address: '42, Green Park, New Delhi 110016',
    dateOfBirth: '1988-03-15',
    bloodGroup: 'O+',
    gender: 'Male',
    createdAt: '2024-01-10',
  },
  {
    id: 'd1',
    name: 'Dr. Sarah Mitchell',
    email: 'doctor@mediwave.health',
    role: 'doctor',
    avatar: '/avatars/dr-priya.svg',
    phone: '+91 99887 65432',
    address: 'Apollo Hospitals, Bandra West, Mumbai',
    gender: 'Female',
    createdAt: '2023-06-01',
  },
  {
    id: 'a1',
    name: 'Raj Malhotra',
    email: 'admin@mediwave.health',
    role: 'admin',
    avatar: '/avatars/patient-5.svg',
    phone: '+91 88776 65544',
    createdAt: '2023-01-01',
  },
  {
    id: 'ph1',
    name: 'MediMart Plus',
    email: 'pharmacy@mediwave.health',
    role: 'pharmacy',
    avatar: '',
    phone: '+91 77665 54433',
    createdAt: '2023-03-15',
  },
  {
    id: 'sa1',
    name: 'Super Admin',
    email: 'superadmin@mediwave.health',
    role: 'superadmin',
    avatar: '',
    phone: '+91 99999 00000',
    createdAt: '2023-01-01',
  },
  {
    id: 'l1',
    name: 'MediWave Diagnostics',
    email: 'lab@mediwave.health',
    role: 'lab' as UserRole,
    avatar: '',
    phone: '+91 66554 43322',
    createdAt: '2023-04-01',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<(User & { password: string })[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mediwave_registered_users') || '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('mediwave_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('mediwave_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = sanitizePassword(password);
    const registeredUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
    const cred = demoCredentials.find(c => c.email === cleanEmail && c.password === cleanPassword);
    if (!cred && !registeredUser) {
      setIsLoading(false);
      return false;
    }

    const foundUser = registeredUser || mockUsers.find(u => u.email === cleanEmail);
    if (foundUser) {
      const { password: _password, ...safeUser } = foundUser as User & { password?: string };
      setUser(safeUser);
      localStorage.setItem('mediwave_user', JSON.stringify(safeUser));
      toast.success(`Welcome back, ${safeUser.name}!`, {
        description: `Logged in as ${safeUser.role}`,
      });
    }

    setIsLoading(false);
    return true;
  };

  const register = async (data: RegisterAccountInput): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 650));
    const normalizedEmail = sanitizeEmail(data.email);
    const emailExists = [...mockUsers, ...registeredUsers].some(u => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      setIsLoading(false);
      toast.error('An account already exists for this email');
      return false;
    }

    const newUser: User & { password: string } = {
      id: `${data.role}_${Date.now()}`,
      name: sanitizeName(data.name).trim(),
      email: normalizedEmail,
      role: data.role,
      phone: sanitizeMobile(data.phone),
      avatar: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    newUser.password = sanitizePassword(data.password);

    const updatedUsers = [newUser, ...registeredUsers];
    setRegisteredUsers(updatedUsers);
    localStorage.setItem('mediwave_registered_users', JSON.stringify(updatedUsers));
    const { password: _password, ...safeUser } = newUser;
    setUser(safeUser);
    localStorage.setItem('mediwave_user', JSON.stringify(safeUser));
    toast.success('Account created successfully', { description: `Signed in as ${safeUser.role}` });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediwave_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data, name: data.name ? sanitizeName(data.name).trim() : user.name, email: data.email ? sanitizeEmail(data.email) : user.email, phone: data.phone ? sanitizeMobile(data.phone) : user.phone };
      setUser(updated);
      localStorage.setItem('mediwave_user', JSON.stringify(updated));
      toast.success('Profile updated successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
