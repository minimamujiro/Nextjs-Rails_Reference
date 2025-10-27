const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'An error occurred');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      token: string;
      user: { id: number; email: string; role: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Video endpoints
  async getVideos() {
    return this.request<any[]>('/videos');
  }

  async getVideo(id: number) {
    return this.request<any>(`/videos/${id}`);
  }

  async createVideo(data: {
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
  }) {
    return this.request<any>('/videos', {
      method: 'POST',
      body: JSON.stringify({ video: data }),
    });
  }

  async updateVideo(
    id: number,
    data: {
      title?: string;
      description?: string;
      video_url?: string;
      thumbnail_url?: string;
    }
  ) {
    return this.request<any>(`/videos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ video: data }),
    });
  }

  async deleteVideo(id: number) {
    return this.request(`/videos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

