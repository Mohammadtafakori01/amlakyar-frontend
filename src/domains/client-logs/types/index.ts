import { VisitType } from '../../property-files/types';

// Re-export VisitType for convenience
export { VisitType };

// Client Log Interface
export interface ClientLog {
  id: string;
  clientName: string;
  phoneNumber: string;
  propertyNeed?: string;
  visitTime: string;
  visitType: VisitType;
  isPublic?: boolean;
  estate: {
    id: string;
    establishmentName: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

// Request Types
export interface CreateClientLogRequest {
  clientName: string;
  phoneNumber: string;
  propertyNeed?: string;
  visitTime: string;
  visitType: VisitType;
}

export interface UpdateClientLogRequest {
  clientName?: string;
  phoneNumber?: string;
  propertyNeed?: string;
  visitTime?: string;
  visitType?: VisitType;
}

// Public Client Logs Filters
export interface PublicClientLogsFilters {
  page?: number;
  limit?: number;
  visitType?: VisitType;
}

// State Types
export interface ClientLogsState {
  clientLogs: ClientLog[];
  selectedLog: ClientLog | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

