import { Modal, Form, Input, Button } from "antd"
import { useEffect, useState } from "react"
import supplierService from "../../service/supplierService"
import useToastNotify from "../../utils/useToastNotify"

const SupplierModal = ({
  open,
  onCancel,
  onSubmit,
  mode = "create", // "create" or "edit"
  supplier = null,
}) => {
  console.log("🚀 ~ supplier:", supplier)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  console.log("🚀 ~ mode:", mode)
  useEffect(() => {
    if (open) {
      if (mode === "edit" && supplier) {
        form.setFieldsValue({
          supplier_name: supplier.supplier_name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, supplier, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const supplierData = {
        ...(mode === "edit" ? supplier : {}),
        ...values,
      }

      setTimeout(() => {
        setLoading(false)
        onSubmit(supplierData)
        form.resetFields()
      }, 500)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  if (mode === "edit" && !supplier) return null

  return (
    <Modal
      title={mode === "create" ? "Thêm nhà cung cấp" : "Chỉnh sửa nhà cung cấp"}
      open={open}
      onCancel={onCancel}
      width={600}
      destroyOnClose
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
            name="supplier_name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}

export default SupplierModal
