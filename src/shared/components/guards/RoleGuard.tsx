import { useRouter } from 'next/router';
import { useAuth } from '../../../domains/auth/hooks/useAuth';
import { UserRole } from '../../../shared/types';
import { Alert, Box } from '@mui/material';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

/**
 * Role hierarchy levels:
 * MASTER (6) - Highest level, access to everything
 * ADMIN (5) - Access to SUPERVISOR, SECRETARY, CONSULTANT, CUSTOMER endpoints
 * SUPERVISOR (4) - Access to SECRETARY, CONSULTANT, CUSTOMER endpoints
 * SECRETARY (3) - Access to CONSULTANT, CUSTOMER endpoints
 * CONSULTANT (2) - Access to CUSTOMER endpoints
 * CUSTOMER (1) - Lowest level, only their own endpoints
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 1,
  [UserRole.CONSULTANT]: 2,
  [UserRole.SECRETARY]: 3,
  [UserRole.SUPERVISOR]: 4,
  [UserRole.ADMIN]: 5,
  [UserRole.MASTER]: 6,
};

/**
 * Check if user role has access based on hierarchical access control
 * Higher roles can access endpoints for lower roles
 */
function hasRoleAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  // Direct match
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  const userRoleLevel = ROLE_HIERARCHY[userRole];

  // Check if user's role level is higher than any of the allowed roles
  // This means the user can access endpoints for lower-level roles
  return allowedRoles.some(allowedRole => {
    const allowedRoleLevel = ROLE_HIERARCHY[allowedRole];
    return userRoleLevel > allowedRoleLevel;
  });
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (!hasRoleAccess(user.role, allowedRoles)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          شما دسترسی به این صفحه را ندارید.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}

