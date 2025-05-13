import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, InputNumber, Button } from "antd"

const { Option } = Select
const { TextArea } = Input

const AddInventoryItemModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Mock data for products and locations
  const products = [
    { id: 1, name: "Laptop Dell XPS 13" },
    { id: 2, name: "iPhone 14 Pro" },
    { id: 3, name: "Tai nghe Sony WH-1000XM4" },
    { id: 4, name: "Samsung Galaxy S23" },
    { id: 5, name: "iPad Pro 12.9" },
    { id: 6, name: "Chuột Logitech MX Master 3" },
  ]

  const locations = [
    "Kho A - Kệ 1",
    "Kho A - Kệ 2",
    "Kho B - Kệ 1",
    "Kho B - Kệ 2",
    "Kho B - Kệ 3",
    "Kho B - Kệ 4",
    "Kho C - Kệ 1",
  ]

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(values)
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
      title="Thêm sản phẩm vào kho"
      open={open}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Thêm vào kho
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ quantity: 1 }}>
        <Form.Item name="productId" label="Sản phẩm" rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}>
          <Select
            placeholder="Chọn sản phẩm"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            {products.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí trong kho"
          rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
        >
          <Select placeholder="Chọn vị trí">
            {locations.map((location) => (
              <Option key={location} value={location}>
                {location}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}>
          <InputNumber min={1} className="w-full" />
        </Form.Item>

        <Form.Item name="batchNumber" label="Mã lô hàng">
          <Input placeholder="Nhập mã lô hàng (nếu có)" />
        </Form.Item>

        <Form.Item name="expiryDate" label="Ngày hết hạn (nếu có)">
          <Input placeholder="Nhập ngày hết hạn (nếu có)" />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddInventoryItemModal
