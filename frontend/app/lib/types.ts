export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
}

export interface AuthContextType {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

