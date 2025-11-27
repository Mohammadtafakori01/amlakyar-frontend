// Contact Interface
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isEstateContact: boolean;
  estate?: {
    id: string;
    establishmentName: string;
  };
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isEstateContact?: boolean;
  estateId?: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isEstateContact?: boolean;
  estateId?: string;
}

// State Types
export interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
}

