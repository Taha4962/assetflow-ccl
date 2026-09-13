import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoleGuard = ({ allowedRoles, children }) => {
  const { user, getRoleDashboardPath } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const fallbackPath = user ? getRoleDashboardPath(user.role) : '/login';
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default RoleGuard;
