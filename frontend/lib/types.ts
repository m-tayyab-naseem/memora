export type UserRole = "owner" | "editor" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface VaultMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  joinedAt: string;
}

export interface Vault {
  _id: string;
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members?: VaultMember[];
  memberCount?: number;
  mediaCount?: number;
  settings?: Record<string, any>;
  userRole?: UserRole;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MediaItem {
  id: string;
  vaultId: string;
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedByRole?: UserRole;
  uploadedAt: string;
  memoryDate?: string; // When the memory actually occurred
  caption?: string;
  tags?: string[];
  size: number;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
