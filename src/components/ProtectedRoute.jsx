// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasPermission } from "../utils/permissionHelper";
const ProtectedRoute = ({ permission, element }) => {

  const permissions = useSelector(state => state.permission.permissions.permissions)

  // Nếu có quyền thì render, không thì redirect hoặc hiển thị thông báo
  if (!hasPermission(permissions, permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default ProtectedRoute;
