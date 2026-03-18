export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  password?: string;
};

export type Session = {
  user: User;
  token: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
