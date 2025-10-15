import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";
import permisstionService from "../../service/permissionService";
import roleService from "../../service/roleService";
import userService from "../../service/userService/index.js";
import UserEditModal from "../../components/modals/UserEditModal";
import useToastNotify from "../../utils/useToastNotify.js";

const { Text } = Typography;

const UserInfoTab = ({ user }) => {
  console.log("🚀 ~ UserInfoTab ~ user:", user)
  const [permissions, setPermissions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allRoles, setAllRoles] = useState([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.role_id) {
        const res = await permisstionService.getPermissionsByRole(user.role_id);
        if (res && res.data) {
          setPermissions(res.data);
        }
      }
    };
    fetchPermissions();

    const fetchRoles = async () => {
      const res = await roleService.getAllRoles();
      if (res && res.data) {
        setAllRoles(res.data);
      }
    };
    fetchRoles();
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card bordered className="mb-2">
      <Row gutter={[16, 8]}>
        <Col xs={12} md={12}>
          <Text type="secondary">Tên hiển thị</Text>
          <div className="font-medium">{user.fullname || 'Chưa có'}</div>
        </Col>
        <Col xs={12} md={12}>
          <Text type="secondary">Tên đăng nhập</Text>
          <div className="font-medium">{user.username || 'Chưa có'}</div>
        </Col>
        <Col xs={12} md={12}>
          <Text type="secondary">Email</Text>
          <div className="font-medium">{user.email || 'Chưa có'}</div>
        </Col>
        <Col xs={12} md={12}>
          <Text type="secondary">Số điện thoại</Text>
          <div className="font-medium">{user.phone || 'Chưa có'}</div>
        </Col>
        <Col xs={12} md={12}>
          <Text type="secondary">Vai trò</Text>
          <div className="font-medium">{user.role_name || 'Chưa có'}</div>
        </Col>
        <Col xs={12} md={12}>
          <Text type="secondary">Mô tả vai trò</Text>
          <div className="font-medium">{user.role_description || 'Chưa có'}</div>
        </Col>
      </Row>
      <div className="flex justify-end mt-4">
        <Button type="primary" icon={<EditOutlined />} onClick={() => setIsModalVisible(true)}>Chỉnh sửa</Button>
      </div>

      <UserEditModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSave={async (values) => {
          try {
            const res = await userService.updateUser(values.user_id, values);
            useToastNotify("Cập nhật người dùng thành công", "success");
            if (res) {
              console.log("User updated successfully:", res);
              // Optionally, refresh user data or show a success message
            }
          } catch (error) {
            console.error("Error updating user:", error);
            useToastNotify(error, "error");
            // Optionally, show an error message
          }
          setIsModalVisible(false);
        }}
        userData={user}
        allRoles={allRoles}
      />
    </Card>
  );
};

export default UserInfoTab;
