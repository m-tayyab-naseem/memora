import { AuthResponse, ApiError, ApiResponse, Vault, MediaItem, User, VaultMember } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Add existing headers if provided
    if (options.headers) {
      const additionalHeaders = new Headers(options.headers);
      additionalHeaders.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    const token = this.getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}`,
        code: String(response.status),
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.details = errorData.details;
      } catch {
        // Response is not JSON
      }

      throw error;
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  // Auth endpoints
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    const data = await this.request<{ user: User }>("/auth/me", { method: "GET" });
    return data.user;
  }

  // Vault endpoints
  async getVaults(): Promise<Vault[]> {
    const data = await this.request<{ vaults: Vault[] }>("/vaults", { method: "GET" });
    console.log(data);
    return data.vaults.map(v => ({ ...v, id: v.id || v._id }));
  }

  async getVault(id: string): Promise<Vault> {
    const data = await this.request<{ vault: Vault }>(`/vaults/${id}`, { method: "GET" });
    const vault = data.vault;
    return { ...vault, id: vault.id || vault._id };
  }

  async getVaultMembers(vaultId: string): Promise<VaultMember[]> {
    const data = await this.request<{ members: any[] }>(`/vaults/${vaultId}/members`, { method: "GET" });
    return data.members.map(m => ({
      id: m.userId?._id || m.userId?.id || m._id,
      name: m.userId?.name || "Unknown",
      email: m.userId?.email || "",
      role: m.role,
      joinedAt: m.createdAt
    }));
  }

  async createVault(name: string, description?: string): Promise<Vault> {
    const data = await this.request<{ vault: Vault }>("/vaults", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    const vault = data.vault;
    return { ...vault, id: vault.id || vault._id };
  }

  async deleteVault(id: string): Promise<void> {
    return this.request(`/vaults/${id}`, { method: "DELETE" });
  }

  // Media endpoints
  async getMediaItems(vaultId: string): Promise<MediaItem[]> {
    const data = await this.request<{ media: any[] }>(`/media/${vaultId}`, { method: "GET" });
    return data.media.map(m => ({
      ...m,
      id: m.id || m._id,
      url: m.signedUrl || m.mediaUrl, // Prefer signedUrl from backend
      type: m.mediaType === "image" ? "photo" : "video",
      uploadedAt: m.createdAt,
      uploadedBy: typeof m.uploadedBy === 'object' ? m.uploadedBy._id : m.uploadedBy,
      uploadedByName: typeof m.uploadedBy === 'object' ? m.uploadedBy.name : undefined,
      caption: m.description,
      memoryDate: m.capturedAt,
      tags: m.tags || []
    }));
  }

  async deleteMedia(vaultId: string, mediaId: string): Promise<void> {
    return this.request(`/media/${vaultId}/${mediaId}`, {
      method: "DELETE",
    });
  }

  async uploadMedia(vaultId: string, formData: FormData): Promise<any> {
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/media/${vaultId}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result: ApiResponse<{ media: any }> = await response.json();
    const media = result.data.media;
    return {
      ...media,
      id: media.id || media._id,
      url: media.signedUrl || media.mediaUrl,
      type: media.mediaType === "image" ? "photo" : "video",
      uploadedAt: media.createdAt,
      uploadedBy: typeof media.uploadedBy === 'object' ? media.uploadedBy._id : media.uploadedBy,
      uploadedByName: typeof media.uploadedBy === 'object' ? media.uploadedBy.name : undefined,
      caption: media.description,
      memoryDate: media.capturedAt,
      tags: media.tags || []
    };
  }
}

export const apiClient = new ApiClient();
