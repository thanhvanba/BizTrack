import { useState, useEffect } from "react"
import { Modal, Form, Select, Input, Button } from "antd"

const { Option } = Select
const { TextArea } = Input

const EditOrderModal = ({ open, onCancel, onSubmit, order }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Set form values when order changes
  useEffect(() => {
    if (order && open) {
      form.setFieldsValue({
        status: order.status,
        note: order.note || "",
      })
    }
  }, [order, open, form])

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Prepare order data
      const orderData = {
        ...order,
        ...values,
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(orderData)
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  if (!order) return null

  return (
    <Modal
      title="Cập nhật trạng thái đơn hàng"
      open={open}
      onCancel={onCancel}
      width={500}
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
        <Form.Item
          name="status"
          label="Trạng thái đơn hàng"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="Đang xử lý">Đang xử lý</Option>
            <Option value="Đang giao">Đang giao</Option>
            <Option value="Đã giao">Đã giao</Option>
            <Option value="Đã hủy">Đã hủy</Option>
          </Select>
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditOrderModal
