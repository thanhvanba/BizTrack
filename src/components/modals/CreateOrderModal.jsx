"use client"

import { useState, useEffect } from "react"
import { Modal, Form, Input, Select, InputNumber, DatePicker, Button, Table, Typography } from "antd"
import { PlusOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"

const { Option } = Select
const { Text } = Typography
const { TextArea } = Input

const CreateOrderModal = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm()
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(false)
  const [warehouseId, setWarehouseId] = useState(null)

  // Mock data for customers
  const customers = [
    { id: "CUST001", name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@example.com" },
    { id: "CUST002", name: "Trần Thị B", phone: "0912345678", email: "tranthib@example.com" },
    { id: "CUST003", name: "Lê Văn C", phone: "0923456789", email: "levanc@example.com" },
    { id: "CUST004", name: "Phạm Thị D", phone: "0934567890", email: "phamthid@example.com" },
    { id: "CUST005", name: "Hoàng Văn E", phone: "0945678901", email: "hoangvane@example.com" },
  ]

  // Mock data for warehouses
  const warehouses = [
    { id: "WH001", name: "Kho Hà Nội" },
    { id: "WH002", name: "Kho Hồ Chí Minh" },
    { id: "WH003", name: "Kho Đà Nẵng" },
  ]

  // Mock data for products
  const products = [
    { id: "PROD001", name: "Laptop Dell XPS 13", price: 32000000, stock: 25, warehouse_id: "WH001" },
    { id: "PROD002", name: "iPhone 14 Pro", price: 28000000, stock: 18, warehouse_id: "WH001" },
    { id: "PROD003", name: "Tai nghe Sony WH-1000XM4", price: 7500000, stock: 5, warehouse_id: "WH002" },
    { id: "PROD004", name: "Samsung Galaxy S23", price: 24000000, stock: 12, warehouse_id: "WH002" },
    { id: "PROD005", name: "iPad Pro 12.9", price: 26000000, stock: 0, warehouse_id: "WH003" },
    { id: "PROD006", name: "Chuột Logitech MX Master 3", price: 2500000, stock: 8, warehouse_id: "WH003" },
  ]

  // Filter products based on search text and warehouse
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) &&
      product.stock > 0 &&
      (!warehouseId || product.warehouse_id === warehouseId),
  )

  // Calculate totals
  const calculateTotalAmount = () => {
    return selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateDiscountAmount = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0)
  }

  const calculateFinalAmount = () => {
    return calculateTotalAmount() - calculateDiscountAmount()
  }

  // Add product to order
  const addProduct = (product) => {
    const existingProduct = selectedProducts.find((item) => item.id === product.id)

    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1, discount: 0 }])
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

  // Update product discount
  const updateDiscount = (productId, discount) => {
    if (discount >= 0) {
      setSelectedProducts(selectedProducts.map((item) => (item.id === productId ? { ...item, discount } : item)))
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // Generate order ID and code
      const orderId = `ORD${Date.now().toString().slice(-6)}`
      const orderCode = `OC${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

      // Prepare order data
      const orderData = {
        order_id: orderId,
        customer_id: values.customer_id,
        order_date: values.order_date.format("YYYY-MM-DD HH:mm:ss"),
        order_code: orderCode,
        total_amount: calculateTotalAmount(),
        discount_amount: calculateDiscountAmount(),
        final_amount: calculateFinalAmount(),
        order_status: "Đang xử lý",
        shipping_address: values.shipping_address,
        payment_method: values.payment_method,
        note: values.note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        warehouse_id: values.warehouse_id,
        order_details: selectedProducts.map((product) => ({
          order_detail_id: `ORDD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`,
          order_id: orderId,
          product_id: product.id,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          warehouse_id: values.warehouse_id,
        })),
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(orderData)
        form.resetFields()
        setSelectedProducts([])
        setWarehouseId(null)
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
      setWarehouseId(null)
    }
  }, [open, form])

  // Handle warehouse change
  const handleWarehouseChange = (value) => {
    setWarehouseId(value)
    // Clear selected products when warehouse changes
    setSelectedProducts([])
  }

  // Product selection table columns
  const productColumns = [
    {
      title: "Mã SP",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Button type="link" onClick={() => addProduct(record)} className="p-0 hover:text-gray-700">
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
      title: "Mã SP",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
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
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "right",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.price}
          value={record.discount}
          onChange={(value) => updateDiscount(record.id, value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          className="w-24"
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      align: "right",
      render: (_, record) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
          (record.price - (record.discount || 0)) * record.quantity,
        ),
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
      width={900}
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
      <Form form={form} layout="vertical" initialValues={{ order_date: null }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="customer_id"
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
            name="order_date"
            label="Ngày đặt hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngày đặt hàng" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>


        </div>

        <Form.Item
          name="shipping_address"
          label="Địa chỉ giao hàng"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}
        >
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item
          name="payment_method"
          label="Phương thức thanh toán"
          rules={[{ required: true, message: "Vui lòng chọn phương thức thành toán" }]}
        >
          <Select placeholder="Chọn phương thức">
            <Option value="Chuyển khoản">Chuyển khoản</Option>
            <Option value="COD">COD</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="warehouse_id"
          label="Kho hàng"
          rules={[{ required: true, message: "Vui lòng chọn kho hàng" }]}
        >
          <Select placeholder="Chọn kho hàng" onChange={handleWarehouseChange}>
            {warehouses.map((warehouse) => (
              <Option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>



        {warehouseId && (
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
        )}

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
            <div className="flex flex-col items-end">
              <div className="text-right mb-1">
                <Text className="mr-4">Tổng tiền:</Text>
                <Text strong>
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    calculateTotalAmount(),
                  )}
                </Text>
              </div>
              <div className="text-right mb-1">
                <Text className="mr-4">Giảm giá:</Text>
                <Text strong className="text-red-500">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    calculateDiscountAmount(),
                  )}
                </Text>
              </div>
              <div className="text-right">
                <Text className="mr-4">Thành tiền:</Text>
                <Text strong className="text-lg">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                    calculateFinalAmount(),
                  )}
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
