import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, InputNumber, Button } from "antd"

const { Option } = Select
const { TextArea } = Input

const EditInventoryItemModal = ({ open, onCancel, onSubmit, item }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Mock data for locations
  const locations = [
    "Kho A - Kệ 1",
    "Kho A - Kệ 2",
    "Kho B - Kệ 1",
    "Kho B - Kệ 2",
    "Kho B - Kệ 3",
    "Kho B - Kệ 4",
    "Kho C - Kệ 1",
  ]

  // Set form values when item changes
  useEffect(() => {
    if (item && open) {
      form.setFieldsValue({
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        notes: item.notes || "",
      })
    }
  }, [item, open, form])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit({ ...item, ...values })
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

  if (!item) return null

  return (
    <Modal
      title="Chỉnh sửa sản phẩm trong kho"
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
        <Form.Item name="name" label="Tên sản phẩm">
          <Input disabled />
        </Form.Item>

        <Form.Item name="category" label="Danh mục">
          <Input disabled />
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
          <InputNumber min={0} className="w-full" />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditInventoryItemModal
