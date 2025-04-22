import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type AuthUser = {
  id: number;
  username: string;
  name: string;
  title: string;
  email: string;
  profileImageUrl: string | null;
};

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterCredentials = {
  username: string;
  name: string;
  email: string;
  title: string;
  password: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginMutation: UseMutationResult<any, Error, LoginCredentials>;
  registerMutation: UseMutationResult<any, Error, RegisterCredentials>;
  logoutMutation: UseMutationResult<any, Error, void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch the current user
  const {
    data: user,
    isLoading,
    error
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/me");
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated is not an error, just return null
            return null;
          }
          throw new Error("Failed to fetch current user");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false,
    // Don't need to refetch on window focus for auth
    refetchOnWindowFocus: false
  });

  // Login mutation
  const loginMutation = useMutation<AuthUser, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/me"], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<AuthUser, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiRequest("POST", "/api/register", credentials);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/me"], data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.name}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout", null);
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convenience functions
  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}