export interface MeDTO {
  email: string;
  isAdmin: boolean;
  features: string[];
}

export interface AdminUserDTO {
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  lastLoginAt: string;
  features: string[];
}
