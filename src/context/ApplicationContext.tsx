import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Application, PortfolioProject, User, Stat } from "@shared/schema";

// Context interface
interface ApplicationContextType {
  userId: number;
  user: User | null;
  applications: Application[];
  portfolioProjects: PortfolioProject[];
  stats: Stat | null;
  loading: boolean;
  error: Error | null;
  updateApplicationStatus: (id: number, status: string) => Promise<void>;
}

// Create the context
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Provider component
export function ApplicationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [userId] = useState<number>(1); // Default to first user in the system
  
  // Fetch user data
  const { 
    data: user,
    isLoading: isLoadingUser,
    error: userError
  } = useQuery({
    queryKey: [`/api/users/${userId}`],
    staleTime: Infinity,
  });
  
  // Fetch applications
  const { 
    data: applications = [],
    isLoading: isLoadingApplications,
    error: applicationsError
  } = useQuery({
    queryKey: [`/api/applications?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Fetch portfolio projects
  const { 
    data: portfolioProjects = [],
    isLoading: isLoadingProjects,
    error: projectsError
  } = useQuery({
    queryKey: [`/api/portfolio-projects?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Fetch stats
  const { 
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: [`/api/stats?userId=${userId}`],
    enabled: !!userId,
  });
  
  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: number; 
      status: string 
    }) => {
      return apiRequest("PUT", `/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/applications?userId=${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats?userId=${userId}`] });
    },
  });
  
  // Combined loading and error states
  const loading = isLoadingUser || isLoadingApplications || isLoadingProjects || isLoadingStats;
  const error = userError || applicationsError || projectsError || statsError;
  
  // Update application status handler
  const updateApplicationStatus = async (id: number, status: string) => {
    await updateApplicationMutation.mutateAsync({ id, status });
  };
  
  // Context value
  const value = {
    userId,
    user,
    applications,
    portfolioProjects,
    stats,
    loading,
    error: error as Error | null,
    updateApplicationStatus,
  };
  
  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Custom hook to use the context
export function useApplicationContext() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplicationContext must be used within an ApplicationProvider");
  }
  return context;
}
