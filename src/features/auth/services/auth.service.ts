import { User, Session, AuthResponse } from '../types/auth.types';
import { storageService } from '../../../services/storage.service';
import { generateId } from '../../../utils/id';

const USERS_KEY = 'orion_users';

export const authService = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const users = storageService.get<User[]>(USERS_KEY) || [];
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = { id: generateId(), name, email, password };
    storageService.set(USERS_KEY, [...users, newUser]);

    const { password: _, ...userWithoutPassword } = newUser;
    return {
      user: userWithoutPassword,
      token: generateId(),
    };
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const users = storageService.get<User[]>(USERS_KEY) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: generateId(),
    };
  },
};
