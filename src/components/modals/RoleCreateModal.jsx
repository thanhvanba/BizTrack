import React, { useEffect, useState } from 'react';
import { Modal, Input, Checkbox, Button, Spin, Collapse } from 'antd';
import permissionService from '../../service/permissionService';

export default function RoleCreateModal({ visible, onClose, onSave, roleId, selectedPermissions = {} }) {
  console.log("🚀 ~ RoleCreateModal ~ selectedPermissions:", selectedPermissions)
  const [permissions, setPermissions] = useState({});
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState('');
  console.log("🚀 ~ RoleCreateModal ~ roleName:", roleName)
  const [roleDesc, setRoleDesc] = useState('');
  const [permissionIds, setPermissionIds] = useState([]);
  console.log("🚀 ~ RoleCreateModal ~ permissionIds:", permissionIds)

  // 🔥 Hàm build selected state (map giữa allPermissions và rolePermissions)
  const buildSelectedState = (allPermissions, rolePermissions) => {
    const selectedMap = {};
    const roleIds = new Set(rolePermissions.map(p => p.permission_id));

    Object.entries(allPermissions).forEach(([groupCode, groupValue]) => {
      selectedMap[groupCode] = {};
      groupValue.permissions.forEach(p => {
        selectedMap[groupCode][p.permission_id] = roleIds.has(p.permission_id);
      });
    });

    // Cập nhật danh sách permissionIds đã được chọn
    const ids = rolePermissions.map(p => p.permission_id);
    setPermissionIds(ids);

    return selectedMap;
  };

  // 🧩 Lấy dữ liệu khi mở modal
  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    // Reset form fields when creating a new role
    if (!selectedPermissions || Object.keys(selectedPermissions).length === 0) {
      setRoleName('');
      setRoleDesc('');
      setPermissionIds([]);
      setSelected({});
    }

    const fetchData = async () => {
      try {
        const allRes = await permissionService.getAllPermissions();
        let allPermissions = allRes?.data || {};
        let selectedData = {};

        if (selectedPermissions?.permissions?.length > 0) {
          selectedData = buildSelectedState(allPermissions, selectedPermissions.permissions);
          setRoleName(selectedPermissions.role_name || '');
          setRoleDesc(selectedPermissions.role_description || '');
        }

        setPermissions(allPermissions);
        setSelected(selectedData);
      } catch (err) {
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, selectedPermissions]);

  // 🧩 Khi click chọn 1 quyền
  const handleCheck = (group, code) => {
    setSelected(prev => {
      const newSelected = {
        ...prev,
        [group]: {
          ...(prev[group] || {}),
          [code]: !prev[group]?.[code]
        }
      };

      const ids = [];
      Object.values(newSelected).forEach(groupObj => {
        Object.entries(groupObj).forEach(([id, checked]) => {
          if (checked) ids.push(id);
        });
      });
      setPermissionIds(ids);
      return newSelected;
    });
  };

  // 🧩 Chọn toàn bộ quyền trong một nhóm
  const handleCheckAllModule = (group, checked) => {
    setSelected(prev => {
      const newSelected = {
        ...prev,
        [group]: permissions[group]?.permissions.reduce((acc, p) => {
          acc[p.permission_id] = checked;
          return acc;
        }, {})
      };

      const ids = [];
      Object.values(newSelected).forEach(groupObj => {
        Object.entries(groupObj).forEach(([id, checked]) => {
          if (checked) ids.push(id);
        });
      });
      setPermissionIds(ids);
      return newSelected;
    });
  };

  const handleSave = () => {
    onSave && onSave({
      roleName,
      roleDesc,
      permissionIds
    });
  };
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      className="!w-[1100px] !top-10"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white py-4">
        <h2 className="text-xl font-bold mb-4">
          {roleId ? 'Chỉnh sửa vai trò' : 'Tạo vai trò'}
        </h2>
        <div className="flex items-center gap-6 px-10">
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium">Tên vai trò</label>
            <Input
              placeholder="Nhập tên vai trò"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              className="w-72"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <label className="text-gray-700 font-medium">Mô tả</label>
            <Input
              placeholder="Nhập mô tả"
              value={roleDesc}
              onChange={e => setRoleDesc(e.target.value)}
              className="w-[400px]"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[60vh] overflow-y-auto px-10 bg-slate-50 pt-6">
        {loading ? (
          <Spin />
        ) : (
          <Collapse bordered={false} className="bg-transparent">
            {Object.entries(permissions).map(([group, value]) => {
              const allChecked = value.permissions.every(p => selected[group]?.[p.permission_id]);
              return (
                <Collapse.Panel
                  header={
                    <div className="flex flex-row-reverse justify-end items-center pb-2 border-b border-gray-200 gap-2">
                      <Checkbox
                        checked={allChecked}
                        indeterminate={
                          !allChecked &&
                          value.permissions.some(p => selected[group]?.[p.permission_id])
                        }
                        onChange={e => handleCheckAllModule(group, e.target.checked)}
                      >
                        <span className="font-semibold text-lg">{value.group_name}</span>
                      </Checkbox>
                    </div>
                  }
                  key={group}
                  className="bg-white rounded-lg shadow mb-4"
                >
                  <div className="flex flex-wrap gap-4">
                    {value.permissions.map(p => (
                      <Checkbox
                        key={p.permission_id}
                        checked={!!selected[group]?.[p.permission_id]}
                        onChange={() => handleCheck(group, p.permission_id)}
                        className="min-w-[180px] mb-2"
                      >
                        {p.permission_name}
                      </Checkbox>
                    ))}
                  </div>
                </Collapse.Panel>
              );
            })}
          </Collapse>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-20 bg-white px-10 py-4 flex justify-end gap-2">
        <Button onClick={onClose}>Bỏ qua</Button>
        <Button type="primary" onClick={handleSave}>
          {roleId ? 'Cập nhật' : 'Lưu'}
        </Button>
      </div>
    </Modal>
  );
}
