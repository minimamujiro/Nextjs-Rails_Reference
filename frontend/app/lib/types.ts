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
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

