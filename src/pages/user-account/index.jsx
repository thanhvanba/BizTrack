import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Checkbox, Tabs } from 'antd';
import { EditOutlined, CopyOutlined } from '@ant-design/icons';
import RoleCreateModal from '../../components/modals/RoleCreateModal';
import userService from '../../service/userService';
import roleService from '../../service/roleService';
import permisstionService from '../../service/permissionService';
import ExpandedUserTabs from './ExpandedUserTabs';
import useToastNotify from '../../utils/useToastNotify';
import { useSelector } from 'react-redux';

export default function UserAccountPage() {
  const [activeTab, setActiveTab] = useState('user');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [allUser, setAllUser] = useState([]);
  console.log("🚀 ~ UserAccountPage ~ allUser:", allUser)
  const [allRole, setAllRole] = useState([]);
  const [editRoleData, setEditRoleData] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);

  const [expandedRowKeys, setExpandedRowKeys] = useState([])

  const profileInfo = useSelector(state => state.user.userInfo)

  const handleEditRole = async (role) => {
    try {
      const res = await permisstionService.getPermissionsByRole(role.role_id);
      if (res && res.data) {
        setRolePermissions(res.data);
      }
      setEditRoleData(role);
      setShowRoleModal(true);
    } catch (err) {
      console.error("Lỗi khi lấy quyền vai trò:", err);
    }
  };


  const handleGetAllUser = async () => {
    // Hàm lấy dữ liệu từ API
    const resAllUser = await userService.getAllUser()

    if (resAllUser && resAllUser.data) {
      setAllUser(resAllUser.data)
      console.log("🚀 ~ handleGetData ~ resAllUser.data:", resAllUser.data)
    }
  }

  const handleGetAllRole = async () => {
    const resAllRole = await roleService.getAllRoles()
    if (resAllRole && resAllRole.data) {
      setAllRole(resAllRole.data)
      console.log("🚀 ~ handleGetData ~ resAllRole.data:", resAllRole.data)
    }

  };

  const handleAssignPermissionsToRole = async (roleId, data) => {
    try {
      const res = await roleService.createRoleWithPermissions(roleId, { permissionIds: data });
      if (res) {
        console.log("🚀 ~ handleassignPermissionsToRole ~ res:", res)
        // Gọi lại hàm lấy dữ liệu để cập nhật giao diện
        handleGetData();
      }
    } catch (err) {
      console.error("Lỗi khi gán quyền cho vai trò:", err);
    }


  };

  const toggleExpand = (key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys([])
    } else {
      setExpandedRowKeys([key])
    }
  }
  useEffect(() => {
    handleGetAllUser();
    handleGetAllRole();
  }, []);

  const columns = [
    {
      title: 'Tên hiển thị',
      dataIndex: 'fullname',
      render: (text, record) =>
        record.user_id === profileInfo.data.user_id ? (
          <>
            {record.fullname} <Tag color="blue">Tôi</Tag>
          </>
        ) : (
          record.fullname
        ),
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (text) => text === 'active' ? <Tag color="cyan">Đang hoạt động</Tag> : <Tag color="red">Đã khóa</Tag>,
    },
  ];

  const roleColumns = [
    {
      title: 'Vai trò',
      dataIndex: 'role_name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'role_description',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'accounts',
      render: (accounts, record) => {
        if (!accounts || accounts.length === 0) return <span>Chưa có</span>;
        if (accounts.length === 1) return <span>{accounts[0]}</span>;
        return <span>{accounts.length} tài khoản. <a style={{ color: '#1677ff' }} href="#">Xem</a></span>;
      },
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      render: (_, record) => (
        <span className="flex gap-2">
          <EditOutlined style={{ cursor: 'pointer' }} onClick={() => handleEditRole(record)} />
          <CopyOutlined style={{ cursor: 'pointer' }} />
        </span>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'user',
            label: 'Tài khoản người dùng',
            children: (
              <>
                {/* <div className="flex items-center justify-between mb-4">
                      <div>
                        <Button type="primary">Tạo tài khoản</Button>
                      </div>
                      <div>
                        <Button> Lọc </Button>
                      </div>
                    </div> */}
                <Table
                  dataSource={allUser}
                  columns={columns}
                  pagination={false}
                  rowKey="user_id"
                  expandable={{
                    expandedRowRender: (record) => (
                      <ExpandedUserTabs record={record} />
                    ),
                    expandedRowKeys,
                    onExpand: (expanded, record) => {
                      console.log("🚀 ~ record:", record)
                      setExpandedRowKeys(expanded ? [record.user_id] : []);
                    },
                  }}
                  onRow={(record) => ({
                    onClick: () => toggleExpand(record.user_id),
                    className: "cursor-pointer",
                  })}
                  rowClassName={(record) =>
                    expandedRowKeys.includes(record.user_id)
                      ? "z-10 bg-blue-100 rounded-md shadow-sm"
                      : "hover:bg-gray-50 transition-colors"
                  }
                  scroll={{ x: "max-content" }}
                  locale={{ emptyText: "Không có sản phẩm nào" }}
                />
              </>
            ),
          },
          {
            key: 'role',
            label: 'Quản lý vai trò',
            children: (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Button type="primary" onClick={() => {
                      // setEditRoleData(null);
                      setRolePermissions([]);
                      setShowRoleModal(true);
                    }}>+ Tạo vai trò</Button>
                  </div>
                </div>
                <Table
                  dataSource={allRole}
                  columns={roleColumns}
                  pagination={false}
                  rowKey="key"
                  showHeader
                />
                <RoleCreateModal
                  visible={showRoleModal}
                  onClose={() => setShowRoleModal(false)}
                  onSave={async (data) => {
                    console.log("🚀 ~ data:", data);
                    setShowRoleModal(false);

                    try {
                      if (editRoleData) {
                        // 👉 Cập nhật vai trò và quyền
                        const res = await roleService.updateRoleWithPermissions(editRoleData.role_id, {
                          role: {
                            role_name: data.roleName,
                            role_description: data.roleDesc,
                          },
                          permissionIds: data.permissionIds,
                        });
                        useToastNotify("Cập nhật vai trò thành công", "success");
                        console.log("✅ Vai trò đã cập nhật:", res);
                      } else {
                        // 👉 Tạo mới vai trò và gán quyền
                        const res = await roleService.createRoleWithPermissions({
                          role: {
                            role_name: data.roleName,
                            role_description: data.roleDesc,
                          },
                          permissionIds: data.permissionIds,
                        });
                        useToastNotify("Tạo vai trò thành công", "success");
                        console.log("✅ Vai trò đã tạo:", res);
                      }

                      // Làm mới dữ liệu
                      handleGetData();
                      setEditRoleData(null);
                      setRolePermissions([]);
                    } catch (err) {
                      console.error("❌ Lỗi khi lưu vai trò:", err);
                    }
                  }}
                  editRole={editRoleData}
                  selectedPermissions={rolePermissions}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
}