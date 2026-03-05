import { apiRequest, tokenStorage } from "./api";

type BackendRole = "student" | "teacher" | "admin";

export type FrontendRole = "STUDENT" | "TEACHER" | "ADMIN";

export type BackendUser = {
  id: string | number;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: BackendRole;
  avatar?: string;
  isEmailVerified?: boolean;
};

export type FrontendUser = {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  role: FrontendRole;
  avatar: string;
  phone?: string;
  enrolledCourses: string[];
};

function roleToFrontend(role: BackendRole): FrontendRole {
  if (role === "teacher") return "TEACHER";
  if (role === "admin") return "ADMIN";
  return "STUDENT";
}

export function mapBackendUserToFrontend(user: BackendUser): FrontendUser {
  return {
    id: String(user.id),
    fullName: user.name,
    username: user.username,
    email: user.email,
    role: roleToFrontend(user.role),
    avatar:
      user.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`,
    phone: user.phone,
    enrolledCourses: [],
  };
}

export const authService = {
  async login(params: {
    email?: string;
    username?: string;
    password: string;
  }): Promise<{ user: FrontendUser; token: string }> {
    const data = await apiRequest<{
      user: BackendUser;
      token: string;
    }>("auth/login", {
      method: "POST",
      body: JSON.stringify(params),
      auth: false,
    });

    tokenStorage.set(data.token);

    return {
      token: data.token,
      user: mapBackendUserToFrontend(data.user),
    };
  },

  async register(params: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
    role?: BackendRole;
  }): Promise<{ user: FrontendUser; verificationCode?: string }> {
    const data = await apiRequest<{
      user: BackendUser;
      verificationCode?: string;
    }>("auth/register", {
      method: "POST",
      body: JSON.stringify(params),
      auth: false,
    });

    return {
      user: mapBackendUserToFrontend(data.user),
      verificationCode: data.verificationCode,
    };
  },

  async verifyEmailCode(token: string): Promise<{ user: FrontendUser }> {
    const data = await apiRequest<{ user: BackendUser }>("auth/verify-email-code", {
      method: "POST",
      body: JSON.stringify({ token }),
      auth: false,
    });

    return { user: mapBackendUserToFrontend(data.user) };
  },

  async me(): Promise<FrontendUser> {
    const data = await apiRequest<BackendUser>("auth/me", {
      method: "GET",
    });

    return mapBackendUserToFrontend(data);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiRequest<unknown>("auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    });
  },

  logout() {
    tokenStorage.clear();
  },
};
