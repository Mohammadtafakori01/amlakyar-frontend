import { UserRole } from '../types';
import { PropertyFileZone, PropertyFile } from '../../domains/property-files/types';

/**
 * Check if user can create a file in the specified zone
 */
export const canCreateFile = (role: UserRole, zone: PropertyFileZone): boolean => {
  if (role === UserRole.ADMIN) return true;
  if (role === UserRole.SECRETARY && zone === PropertyFileZone.OFFICE_MASTER) return true;
  if (role === UserRole.CONSULTANT && zone === PropertyFileZone.PERSONAL) return true;
  if (role === UserRole.SUPERVISOR && zone === PropertyFileZone.PERSONAL) return true;
  return false;
};

/**
 * Check if user can edit a file
 */
export const canEditFile = (
  role: UserRole,
  file: PropertyFile,
  currentUserId: string,
  currentEstateId?: string
): boolean => {
  // EXTERNAL_NETWORK files are read-only and cannot be edited
  if (file.zone === PropertyFileZone.EXTERNAL_NETWORK) return false;
  
  // Admin can edit all files in their estate
  if (role === UserRole.ADMIN && file.estate.id === currentEstateId) return true;
  
  // Secretary can edit OFFICE_MASTER files
  if (role === UserRole.SECRETARY && file.zone === PropertyFileZone.OFFICE_MASTER) return true;
  
  // Users can edit their own PERSONAL files
  if (file.zone === PropertyFileZone.PERSONAL && file.createdBy.id === currentUserId) return true;
  
  return false;
};

/**
 * Check if user can delete a file
 */
export const canDeleteFile = (
  role: UserRole,
  file: PropertyFile,
  currentUserId: string,
  currentEstateId?: string
): boolean => {
  // EXTERNAL_NETWORK files are read-only and cannot be deleted
  if (file.zone === PropertyFileZone.EXTERNAL_NETWORK) return false;
  
  // Admin can delete all files in their estate
  if (role === UserRole.ADMIN && file.estate.id === currentEstateId) return true;
  
  // Secretary can delete OFFICE_MASTER files
  if (role === UserRole.SECRETARY && file.zone === PropertyFileZone.OFFICE_MASTER) return true;
  
  // Users can delete their own PERSONAL files
  if (file.zone === PropertyFileZone.PERSONAL && file.createdBy.id === currentUserId) return true;
  
  return false;
};

/**
 * Get available zones for a user role
 * Note: This returns zones that user can access (view or edit)
 * For read-only zones, they are included but editing is restricted by canEditFile
 */
export const getAvailableZones = (role: UserRole): PropertyFileZone[] => {
  if (role === UserRole.ADMIN) {
    return [
      PropertyFileZone.OFFICE_MASTER,
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
      PropertyFileZone.PERSONAL,
    ];
  }
  if (role === UserRole.SECRETARY) {
    return [
      PropertyFileZone.OFFICE_MASTER,
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
    ];
  }
  if (role === UserRole.SUPERVISOR) {
    return [
      PropertyFileZone.OFFICE_MASTER,
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
      PropertyFileZone.PERSONAL,
    ];
  }
  if (role === UserRole.CONSULTANT) {
    return [
      PropertyFileZone.PERSONAL,
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
    ];
  }
  return [];
};

/**
 * Check if user can access contacts
 */
export const canAccessContacts = (role: UserRole): boolean => {
  return [
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.SECRETARY,
    UserRole.CONSULTANT,
  ].includes(role);
};

/**
 * Check if user can access client logs
 */
export const canAccessClientLogs = (role: UserRole): boolean => {
  return [UserRole.ADMIN, UserRole.SECRETARY].includes(role);
};

/**
 * Check if user can share files internally
 */
export const canShareInternal = (role: UserRole, file: PropertyFile): boolean => {
  // Only files in OFFICE_MASTER zone can be shared internally
  if (file.zone !== PropertyFileZone.OFFICE_MASTER) return false;
  
  // Admin and Secretary can share
  return [UserRole.ADMIN, UserRole.SECRETARY].includes(role);
};

/**
 * Check if user can share files externally
 * Admin can share: OFFICE_MASTER, INTERNAL_COOPERATION, PERSONAL files
 * Supervisor can share: only their own PERSONAL files
 */
export const canShareExternal = (
  role: UserRole,
  file: PropertyFile,
  currentUserId?: string
): boolean => {
  // Admin can share OFFICE_MASTER, INTERNAL_COOPERATION, and PERSONAL files
  if (role === UserRole.ADMIN) {
    // For PERSONAL files, admin can only share their own files
    if (file.zone === PropertyFileZone.PERSONAL) {
      if (!currentUserId) return false;
      return file.createdBy.id === currentUserId;
    }
    // For OFFICE_MASTER and INTERNAL_COOPERATION, admin can share all files in their estate
    return [
      PropertyFileZone.OFFICE_MASTER,
      PropertyFileZone.INTERNAL_COOPERATION,
    ].includes(file.zone);
  }
  
  // Supervisor can only share their own PERSONAL files externally
  if (role === UserRole.SUPERVISOR) {
    if (file.zone !== PropertyFileZone.PERSONAL) return false;
    if (!currentUserId) return false;
    return file.createdBy.id === currentUserId;
  }
  
  return false;
};

/**
 * Check if user can share from personal files to internal cooperation
 */
export const canShareFromPersonal = (
  role: UserRole,
  file: PropertyFile,
  currentUserId: string
): boolean => {
  // Only personal files can be shared
  if (file.zone !== PropertyFileZone.PERSONAL) return false;
  
  // Only owner can share their personal files
  if (file.createdBy.id !== currentUserId) return false;
  
  // Admin, Supervisor, and Consultant can share their personal files
  return [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CONSULTANT].includes(role);
};

/**
 * Check if user can share from personal files to external network
 * Supervisor can share their own PERSONAL files to external
 * Admin can share PERSONAL, INTERNAL_COOPERATION, and OFFICE_MASTER files to external
 */
export const canShareFromPersonalToExternal = (
  role: UserRole,
  file: PropertyFile,
  currentUserId: string
): boolean => {
  // Supervisor can only share their own PERSONAL files to external
  if (role === UserRole.SUPERVISOR) {
    if (file.zone !== PropertyFileZone.PERSONAL) return false;
    return file.createdBy.id === currentUserId;
  }
  
  // Admin can share PERSONAL files to external (handled by canShareExternal)
  if (role === UserRole.ADMIN && file.zone === PropertyFileZone.PERSONAL) {
    return file.createdBy.id === currentUserId;
  }
  
  return false;
};

/**
 * Check if user can view a file (read-only access)
 * Supervisors can view all zones but cannot edit cooperation zones
 * Secretaries can view cooperation zones but cannot edit them
 */
export const canViewFile = (
  role: UserRole,
  file: PropertyFile,
  currentUserId: string,
  currentEstateId?: string
): boolean => {
  // All roles can view files in their estate
  if (file.estate.id === currentEstateId) {
    // Supervisors can view all zones (read-only for cooperation zones)
    if (role === UserRole.SUPERVISOR) return true;
    
    // Secretaries can view cooperation zones (read-only)
    if (role === UserRole.SECRETARY) {
      return [
        PropertyFileZone.OFFICE_MASTER,
        PropertyFileZone.INTERNAL_COOPERATION,
        PropertyFileZone.EXTERNAL_NETWORK,
      ].includes(file.zone);
    }
    
    // Consultants can view their personal files and cooperation zones (read-only)
    if (role === UserRole.CONSULTANT) {
      return file.zone === PropertyFileZone.PERSONAL || 
             file.zone === PropertyFileZone.INTERNAL_COOPERATION ||
             file.zone === PropertyFileZone.EXTERNAL_NETWORK;
    }
    
    // Admin can view all zones
    if (role === UserRole.ADMIN) return true;
  }
  
  return false;
};

/**
 * Check if user has read-only access to a zone
 * Supervisors: read-only for OFFICE_MASTER, INTERNAL_COOPERATION, EXTERNAL_NETWORK
 * Secretaries: read-only for INTERNAL_COOPERATION, EXTERNAL_NETWORK
 * Consultants: read-only for INTERNAL_COOPERATION, EXTERNAL_NETWORK
 */
export const isReadOnlyZone = (
  role: UserRole,
  zone: PropertyFileZone
): boolean => {
  if (role === UserRole.SUPERVISOR) {
    return [
      PropertyFileZone.OFFICE_MASTER,
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
    ].includes(zone);
  }
  
  if (role === UserRole.SECRETARY) {
    return [
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
    ].includes(zone);
  }
  
  if (role === UserRole.CONSULTANT) {
    return [
      PropertyFileZone.INTERNAL_COOPERATION,
      PropertyFileZone.EXTERNAL_NETWORK,
    ].includes(zone);
  }
  
  return false;
};

