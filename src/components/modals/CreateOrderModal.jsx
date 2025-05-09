"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, InputNumber, DatePicker, Button, Table, Typography } from "antd"
import { PlusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"

const { Option } = Select
const { Text } = Typography

const CreateOrderModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock data for customers
  const customers = [
    { id: 1, name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@example.com" },
    { id: 2, name: "Trần Thị B", phone: "0912345678", email: "tranthib@example.com" },
    { id: 3, name: "Lê Văn C", phone: "0923456789", email: "levanc@example.com" },
    { id: 4, name: "Phạm Thị D", phone: "0934567890", email: "phamthid@example.com" },
    { id: 5, name: "Hoàng Văn E", phone: "0945678901", email: "hoangvane@example.com" },
  ]

  // Mock data for products
  const products = [
    { id: 1, name: "Laptop Dell XPS 13", price: 32000000, stock: 25 },
    { id: 2, name: "iPhone 14 Pro", price: 28000000, stock: 18 },
    { id: 3, name: "Tai nghe Sony WH-1000XM4", price: 7500000, stock: 5 },
    { id: 4, name: "Samsung Galaxy S23", price: 24000000, stock: 12 },
    { id: 5, name: "iPad Pro 12.9", price: 26000000, stock: 0 },
    { id: 6, name: "Chuột Logitech MX Master 3", price: 2500000, stock: 8 },
  ]

  // Filter products based on search text
  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchText.toLowerCase()) && product.stock > 0,
  )

  // Calculate total
  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Add product to order
  const addProduct = (product) => {
    const existingProduct = selectedProducts.find((item) => item.id === product.id)

    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }])
    }
  }

  // Remove product from order
  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((item) => item.id !== productId))
  }

  // Update product quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity > 0) {
      setSelectedProducts(selectedProducts.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Prepare order data
      const orderData = {
        ...values,
        orderDate: values.orderDate.format("YYYY-MM-DD"),
        items: selectedProducts,
        total: calculateTotal(),
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(orderData)
        form.resetFields()
        setSelectedProducts([])
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setSelectedProducts([])
      setSearchText("")
    }
  }, [open, form])

  // Product selection table columns
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Button type="link" onClick={() => addProduct(record)} className="p-0 text-blue-500 hover:text-blue-600">
            {text}
          </Button>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      align: "center",
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => addProduct(record)} />
      ),
    },
  ]

  // Selected products table columns
  const selectedProductColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(value) => updateQuantity(record.id, value)}
          className="w-16"
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      align: "right",
      render: (_, record) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(record.price * record.quantity),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeProduct(record.id)} />
      ),
    },
  ]

  return (
    <Modal
      title="Tạo đơn hàng mới"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={selectedProducts.length === 0}
        >
          Tạo đơn hàng
        </Button>,
      ]}
      bodyStyle={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
    >
      <Form form={form} layout="vertical" initialValues={{ orderDate: null }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
          >
            <Select
              placeholder="Chọn khách hàng"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="orderDate"
            label="Ngày đặt hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngày đặt hàng" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} />
        </Form.Item>

        <div className="mb-4">
          <div className="font-medium mb-2">Thêm sản phẩm</div>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="mb-2"
          />
          <Table
            columns={productColumns}
            dataSource={filteredProducts}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 5 }}
            className="mb-4"
          />
        </div>

        {selectedProducts.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <div className="font-medium mb-2">Sản phẩm đã chọn</div>
            <Table
              columns={selectedProductColumns}
              dataSource={selectedProducts}
              rowKey="id"
              size="small"
              pagination={false}
              className="mb-4"
            />
            <div className="flex justify-end">
              <div className="text-right">
                <Text className="mr-4">Tổng tiền:</Text>
                <Text strong className="text-lg">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(calculateTotal())}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default CreateOrderModal
