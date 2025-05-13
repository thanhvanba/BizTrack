import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, Button, DatePicker } from "antd"

const { Option } = Select

const CreateCustomerModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Prepare customer data
      const customerData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format("YYYY-MM-DD") : null,
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(customerData)
        form.resetFields()
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      title="Thêm khách hàng mới"
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Thêm khách hàng
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
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
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Email không hợp lệ" },
              { required: true, message: "Vui lòng nhập email" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item name="birthDate" label="Ngày sinh">
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item name="gender" label="Giới tính">
          <Select placeholder="Chọn giới tính">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
            <Option value="other">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item
          name="customerType"
          label="Loại khách hàng"
          rules={[{ required: true, message: "Vui lòng chọn loại khách hàng" }]}
        >
          <Select placeholder="Chọn loại khách hàng">
            <Option value="new">Mới</Option>
            <Option value="regular">Thường xuyên</Option>
            <Option value="loyal">Thân thiết</Option>
            <Option value="vip">VIP</Option>
          </Select>
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateCustomerModal
