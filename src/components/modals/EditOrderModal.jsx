"use client"

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
        order_status: order.order_status,
        note: order.note || "",
        payment_method: order.payment_method,
        shipping_address: order.shipping_address || "",
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
        updated_at: new Date().toISOString(),
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

        <Form.Item name="shipping_address" label="Địa chỉ giao hàng">
          <TextArea rows={2} placeholder="Nhập địa chỉ giao hàng" />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditOrderModal
