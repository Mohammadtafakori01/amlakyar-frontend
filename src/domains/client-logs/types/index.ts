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

// State Types
export interface ClientLogsState {
  clientLogs: ClientLog[];
  selectedLog: ClientLog | null;
  isLoading: boolean;
  error: string | null;
}

