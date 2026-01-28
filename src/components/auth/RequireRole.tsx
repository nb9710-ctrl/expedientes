import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { UserRole } from '../../types';

interface RequireRoleProps {
  children: React.ReactNode;
  roles: UserRole[];
}

const RequireRole: React.FC<RequireRoleProps> = ({ children, roles }) => {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
