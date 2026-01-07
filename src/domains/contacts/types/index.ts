// Contact Interface
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: string;
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
  address?: string;
  isEstateContact?: boolean;
  estateId?: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  isEstateContact?: boolean;
  estateId?: string;
}

// Search Types
export interface SearchContactsDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  search?: string; // جستجوی کلی در همه فیلدها
}

// State Types
export interface ContactsState {
  contacts: Contact[];
  selectedContact: Contact | null;
  isLoading: boolean;
  error: string | null;
}

