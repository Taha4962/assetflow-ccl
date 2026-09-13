import React from 'react';
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';

const ProtectedRoleRoute = ({ component: Component, allowedRoles }) => (
  <ProtectedRoute>
    <RoleGuard allowedRoles={allowedRoles}>
      <Component />
    </RoleGuard>
  </ProtectedRoute>
);

export default ProtectedRoleRoute;