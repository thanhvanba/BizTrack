import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const UserEditModal = ({ visible, onCancel, onSave, userData, allRoles }) => {
  console.log("🚀 ~ UserEditModal ~ userData:", userData)
  console.log("🚀 ~ UserEditModal ~ allRoles:", allRoles)
  const [form] = Form.useForm();

  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        fullname: userData.fullname,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        role_id: userData.role_id,
        status: userData.status,
      });
    } else {
      form.resetFields();
    }
  }, [userData, form]);

  const handleSave = () => {
    form.validateFields().then(values => {
      onSave({ ...userData, ...values });
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      visible={visible}
      title="Chỉnh sửa thông tin người dùng"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Lưu
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="user_edit_form"
      >
        <Form.Item
          name="fullname"
          label="Tên hiển thị"
        // rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="username"
          label="Tên đăng nhập"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="role_id"
          label="Vai trò"
          rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
        >
          <Select placeholder="Chọn vai trò">
            {allRoles.map(role => (
              <Option key={role.role_id} value={role.role_id}>
                {role.role_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="active">Đang hoạt động</Option>
            <Option value="inactive">Đã khóa</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserEditModal;
