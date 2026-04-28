import { UserRole } from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string; // In production, this would be hashed
  location?: { lat: number; lng: number };
  createdAt: string;
  avatar?: string;
}

class AuthService {
  private readonly USERS_KEY = 'dpi4_users';
  private readonly CURRENT_USER_KEY = 'dpi4_current_user';

  private defaultUsers: User[] = [
    {
      id: 'user-001',
      name: 'Admin Authority',
      email: 'admin@emergency.gov',
      phone: '+91-9876543210',
      role: 'authority',
      password: 'admin123',
      createdAt: new Date().toISOString(),
      avatar: '👨‍💼'
    },
    {
      id: 'user-002',
      name: 'Field Responder',
      email: 'responder@emergency.gov',
      phone: '+91-9876543211',
      role: 'civil_servant',
      password: 'responder123',
      createdAt: new Date().toISOString(),
      avatar: '👨‍🚒'
    },
    {
      id: 'user-003',
      name: 'Citizen User',
      email: 'citizen@example.com',
      phone: '+91-9876543212',
      role: 'citizen',
      password: 'citizen123',
      createdAt: new Date().toISOString(),
      avatar: '👤'
    }
  ];

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers() {
    const users = localStorage.getItem(this.USERS_KEY);
    if (!users) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
    }
  }

  getAllUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : this.defaultUsers;
  }

  signup(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
  }): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email already registered' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      avatar: this.getDefaultAvatar(userData.role)
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    return { success: true, message: 'Account created successfully', user: newUser };
  }

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Store current user
    const userWithoutPassword = { ...user };
    delete (userWithoutPassword as any).password;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    localStorage.setItem('dpi4_role', user.role);

    return { success: true, message: 'Login successful', user: userWithoutPassword };
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem('dpi4_role');
  }

  updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Update current user if it's the same
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...users[index] };
      delete (updatedUser as any).password;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    return true;
  }

  private getDefaultAvatar(role: UserRole): string {
    const avatars = {
      authority: '👨‍💼',
      civil_servant: '👨‍🚒',
      citizen: '👤',
      guest: '👥'
    };
    return avatars[role];
  }
}

export const authService = new AuthService();
