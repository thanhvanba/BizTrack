const hasPermission = (permissions, code) => {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some((p) => p.permission_code === code);
};

const hasGroup = (permissions, groupCode) => {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some((p) => p.group_code === groupCode);
};
export { hasPermission, hasGroup };
