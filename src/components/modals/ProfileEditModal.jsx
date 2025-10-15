import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Select } from "antd";
import roleService from "../../service/roleService";

export default function ProfileEditModal({ open, onClose, onSave, user }) {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await roleService.getAllRoles();
      if (res && res.data) {
        setRoles(res.data);
      }
    };
    if (open && user) {
      form.setFieldsValue({
        fullname: user.fullname || "",
        username: user.username || "",
        role_id: user.role_id || null,
        phone: user.phone || "",
        email: user.email || "",
      });
      fetchRoles();
    }
  }, [open, user, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

  return (
    <Modal
      open={open}
      title={`Sửa thông tin của ${user?.username || ""}`}
      okText="Lưu"
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onClose}
      width={800}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="fullname" label="Tên hiển thị">
            <Input placeholder="Nhập tên hiển thị" />
          </Form.Item>

          <Form.Item name="username" label="Tên đăng nhập">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Vai trò" name="role_id">
            <Select disabled placeholder="Chọn vai trò">
              {roles.map(role => (
                <Select.Option key={role.role_id} value={role.role_id}>
                  {role.role_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="Điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input placeholder="Nhập email" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
