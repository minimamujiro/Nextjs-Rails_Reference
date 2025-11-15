import type { LoginResponse, User, Video } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

class ApiClient {
  constructor(private baseUrl: string) {}

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (response.status === 204) {
      return null as T;
    }

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const errorMessage =
        (data as { error?: string } | null)?.error || "An error occurred";
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    await this.request<null>("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request<{ user: User }>("/auth/me");
  }

  // Video endpoints
  async getVideos() {
    return this.request<Video[]>("/videos");
  }

  async getVideo(id: number) {
    return this.request<Video>(`/videos/${id}`);
  }

  async createVideo(data: {
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string;
  }) {
    return this.request<Video>("/videos", {
      method: "POST",
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
    return this.request<Video>(`/videos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ video: data }),
    });
  }

  async deleteVideo(id: number) {
    await this.request<null>(`/videos/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

