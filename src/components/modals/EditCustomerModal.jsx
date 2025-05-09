"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, Button } from "antd"

const { Option } = Select

const EditCustomerModal = ({ open, onCancel, onSubmit, customer }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Set form values when customer changes
  useEffect(() => {
    if (customer && open) {
      // Map status to customerType
      const customerTypeMap = {
        Mới: "new",
        "Thường xuyên": "regular",
        "Thân thiết": "loyal",
        VIP: "vip",
      }

      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customerTypeMap[customer.status] || "new",
        // Add other fields as needed
      })
    }
  }, [customer, open, form])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Map customerType to status
      const statusMap = {
        new: "Mới",
        regular: "Thường xuyên",
        loyal: "Thân thiết",
        vip: "VIP",
      }

      // Prepare customer data
      const customerData = {
        ...customer,
        ...values,
        status: statusMap[values.customerType],
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(customerData)
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  if (!customer) return null

  return (
    <Modal
      title="Chỉnh sửa khách hàng"
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Cập nhật
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

export default EditCustomerModal
