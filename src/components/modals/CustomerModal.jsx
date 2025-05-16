import { Modal, Form, Input, Select, Button } from "antd"
import { useEffect, useState } from "react"

const { Option } = Select

const CustomerModal = ({
  open,
  onCancel,
  onSubmit,
  mode = "create", // "create" or "edit"
  customer = null,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === "edit" && customer) {
        form.setFieldsValue({
          name: customer.customer_name,
          phone: customer.phone,
          email: customer.email,
          gender: customer.gender,
          address: customer.address,
          status: customer.status, 
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, customer, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const customerData = {
        ...(mode === "edit" ? customer : {}),
        ...values,
      }

      setTimeout(() => {
        setLoading(false)
        onSubmit(customerData)
        form.resetFields()
      }, 500)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  if (mode === "edit" && !customer) return null

  return (
    <Modal
      title={mode === "create" ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          {mode === "create" ? "Thêm" : "Cập nhật"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="customer_name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="email" label="Email">
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomerModal
