export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    count: number;
  };
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments?: number;
  totalRevenue?: number;
  doctors?: number;
  patients?: number;
  appointments?: number;
  users?: number;
}

