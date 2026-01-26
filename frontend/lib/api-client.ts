import { AuthResponse, ApiError, ApiResponse, Vault, MediaItem } from "./types";

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
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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

  async getCurrentUser(): Promise<any> {
    return this.request("/auth/me", { method: "GET" });
  }

  // Vault endpoints
  async getVaults(): Promise<Vault[]> {
    const data = await this.request<{ vaults: Vault[] }>("/vaults", { method: "GET" });
    return data.vaults.map(v => ({ ...v, id: v.id || v._id }));
  }

  async getVault(id: string): Promise<Vault> {
    const data = await this.request<{ vault: Vault }>(`/vaults/${id}`, { method: "GET" });
    const vault = data.vault;
    return { ...vault, id: vault.id || vault._id };
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
  async getMediaItems(vaultId: string): Promise<any[]> {
    const data = await this.request<{ media: any[] }>(`/vaults/${vaultId}/media`, { method: "GET" });
    return data.media.map(m => ({ ...m, id: m.id || m._id }));
  }

  async deleteMedia(vaultId: string, mediaId: string): Promise<void> {
    return this.request(`/vaults/${vaultId}/media/${mediaId}`, {
      method: "DELETE",
    });
  }

  async uploadMedia(vaultId: string, formData: FormData): Promise<any> {
    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/vaults/${vaultId}/media`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result: ApiResponse<any> = await response.json();
    const media = result.data;
    return { ...media, id: media.id || media._id };
  }
}

export const apiClient = new ApiClient();
