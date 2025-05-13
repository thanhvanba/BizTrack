import { Modal, Form, Input, Select, Button } from "antd"
import { useState, useEffect } from "react"

const { Option } = Select

const CategoryModal = ({
  open,
  onCancel,
  onSubmit,
  mode = "create", // "create" or "edit"
  category = null
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (mode === "edit" && category) {
        form.setFieldsValue({
          category_name: category.category_name,
          status: category.status,
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, mode, category, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const categoryData = {
        ...(mode === "edit" ? category : {}),
        category_name: values.category_name,
        status: values.status,
      }

      setTimeout(() => {
        setLoading(false)
        onSubmit(categoryData)
        form.resetFields()
      }, 500)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  if (mode === "edit" && !category) return null

  return (
    <Modal
      title={mode === "create" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {mode === "create" ? "Thêm" : "Cập nhật"}
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="category_name"
          label="Tên danh mục"
          rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Tạm ngưng</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CategoryModal
