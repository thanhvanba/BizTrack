"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, InputNumber, Upload, Button, message } from "antd"
import { PlusOutlined } from "@ant-design/icons"

const { Option } = Select
const { TextArea } = Input

const CreateProductModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  // Mock data for categories and locations
  const categories = ["Điện tử", "Điện thoại", "Phụ kiện", "Máy tính bảng", "Laptop", "Đồng hồ thông minh"]
  const locations = ["Kho A - Kệ 1", "Kho A - Kệ 2", "Kho B - Kệ 1", "Kho B - Kệ 2", "Kho C - Kệ 1"]

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Prepare product data
      const productData = {
        ...values,
        images: fileList.map((file) => file.thumbUrl || file.url),
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(productData)
        form.resetFields()
        setFileList([])
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open, form])

  // Handle image upload
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  // Upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  )

  return (
    <Modal
      title="Thêm sản phẩm mới"
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Thêm sản phẩm
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ quantity: 0, price: 0 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            name="sku"
            label="Mã sản phẩm (SKU)"
            rules={[{ required: true, message: "Vui lòng nhập mã sản phẩm" }]}
          >
            <Input placeholder="Nhập mã sản phẩm" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}>
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item name="price" label="Giá bán" rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}>
            <InputNumber
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              className="w-full"
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item name="costPrice" label="Giá nhập" rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}>
            <InputNumber
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              className="w-full"
              addonAfter="VNĐ"
            />
          </Form.Item>

          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Mô tả sản phẩm">
          <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
        </Form.Item>

        <Form.Item name="images" label="Hình ảnh sản phẩm">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/")
              if (!isImage) {
                message.error("Chỉ có thể tải lên file hình ảnh!")
              }
              const isLt2M = file.size / 1024 / 1024 < 2
              if (!isLt2M) {
                message.error("Hình ảnh phải nhỏ hơn 2MB!")
              }
              return false // Prevent auto upload
            }}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateProductModal
