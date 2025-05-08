import { useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Select, Typography, Image, message } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import CreateProductModal from "../../components/modals/CreateProductModal"
import EditProductModal from "../../components/modals/EditProductModal"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"

const { Title } = Typography
const { Option } = Select

const ProductManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)

  // Sample data
  const [productsData, setProductsData] = useState([
    {
      key: "1",
      name: "Laptop Dell XPS 13",
      category: "Điện tử",
      price: 32000000,
      stock: 25,
      status: "Còn hàng",
      image:
        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9315/media-gallery/notebook-xps-9315-nt-blue-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=402&qlt=100,1&resMode=sharp2&size=402,402&chrss=full",
    },
    {
      key: "2",
      name: "iPhone 14 Pro",
      category: "Điện thoại",
      price: 28000000,
      stock: 18,
      status: "Còn hàng",
      image:
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1663703841896",
    },
    {
      key: "3",
      name: "Tai nghe Sony WH-1000XM4",
      category: "Phụ kiện",
      price: 7500000,
      stock: 5,
      status: "Sắp hết",
      image: "https://electronics.sony.com/image/5d02da5df552836db894cead8a68c5ef?fmt=png-alpha&wid=720&hei=720",
    },
    {
      key: "4",
      name: "Samsung Galaxy S23",
      category: "Điện thoại",
      price: 24000000,
      stock: 12,
      status: "Còn hàng",
      image:
        "https://images.samsung.com/is/image/samsung/p6pim/vn/2302/gallery/vn-galaxy-s23-s911-sm-s911bzgcxxv-534848082?$650_519_PNG$",
    },
    {
      key: "5",
      name: "iPad Pro 12.9",
      category: "Máy tính bảng",
      price: 26000000,
      stock: 0,
      status: "Hết hàng",
      image:
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-select-wifi-spacegray-202104?wid=940&hei=1112&fmt=png-alpha&.v=1617126635000",
    },
    {
      key: "6",
      name: "Chuột Logitech MX Master 3",
      category: "Phụ kiện",
      price: 2500000,
      stock: 8,
      status: "Còn hàng",
      image:
        "https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png",
    },
  ])

  // Filter data based on search text and category
  const filteredData = productsData.filter(
    (item) =>
      (categoryFilter === "all" || item.category === categoryFilter) &&
      (item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase())),
  )

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Handle create product
  const handleCreateProduct = (productData) => {
    // Create new product object
    const newProduct = {
      key: String(productsData.length + 1),
      name: productData.name,
      category: productData.category,
      price: productData.price,
      stock: productData.quantity,
      status: productData.quantity > 10 ? "Còn hàng" : productData.quantity > 0 ? "Sắp hết" : "Hết hàng",
      image: productData.images && productData.images.length > 0 ? productData.images[0] : "/placeholder.svg",
    }

    // Add new product to the list
    setProductsData([newProduct, ...productsData])

    // Close modal and show success message
    setCreateModalVisible(false)
    message.success(`Sản phẩm "${productData.name}" đã được thêm thành công!`)
  }

  // Handle edit product
  const handleEditProduct = (updatedProduct) => {
    // Determine status based on stock
    const status = updatedProduct.stock > 10 ? "Còn hàng" : updatedProduct.stock > 0 ? "Sắp hết" : "Hết hàng"

    // Update product in the list
    const updatedData = productsData.map((product) =>
      product.key === updatedProduct.key ? { ...updatedProduct, status } : product,
    )

    // Update state
    setProductsData(updatedData)

    // Close modal and show success message
    setEditModalVisible(false)
    message.success(`Sản phẩm "${updatedProduct.name}" đã được cập nhật thành công!`)
  }

  // Handle delete product
  const handleDeleteProduct = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Remove product from the list
      setProductsData(productsData.filter((item) => item.key !== selectedProduct.key))

      // Reset state and show success message
      setLoading(false)
      setDeleteModalVisible(false)
      setSelectedProduct(null)
      message.success(`Sản phẩm "${selectedProduct.name}" đã được xóa thành công!`)
    }, 1000)
  }

  // Edit product
  const editProduct = (product) => {
    setSelectedProduct(product)
    setEditModalVisible(true)
  }

  // Confirm delete product
  const confirmDelete = (product) => {
    setSelectedProduct(product)
    setDeleteModalVisible(true)
  }

  // Table columns
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Image
            src={record.image || "/placeholder.svg"}
            alt={text}
            width={50}
            height={50}
            className="object-cover rounded"
            preview={false}
          />
          <span className="ml-3">{text}</span>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Điện tử", value: "Điện tử" },
        { text: "Điện thoại", value: "Điện thoại" },
        { text: "Phụ kiện", value: "Phụ kiện" },
        { text: "Máy tính bảng", value: "Máy tính bảng" },
      ],
      onFilter: (value, record) => record.category === value,
      responsive: ["md"],
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => formatPrice(price),
      sorter: (a, b) => a.price - b.price,
      align: "right",
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      align: "center",
      responsive: ["md"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color
        switch (status) {
          case "Còn hàng":
            color = "success"
            break
          case "Sắp hết":
            color = "warning"
            break
          case "Hết hàng":
            color = "error"
            break
          default:
            color = "default"
        }
        return <Tag color={color}>{status}</Tag>
      },
      filters: [
        { text: "Còn hàng", value: "Còn hàng" },
        { text: "Sắp hết", value: "Sắp hết" },
        { text: "Hết hàng", value: "Hết hàng" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editProduct(record)}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => confirmDelete(record)}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title level={2} className="text-xl md:text-2xl font-bold m-0 text-gray-800">
          Quản lý sản phẩm
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          <Select defaultValue="all" style={{ minWidth: 180 }} onChange={(value) => setCategoryFilter(value)}>
            <Option value="all">Tất cả danh mục</Option>
            <Option value="Điện tử">Điện tử</Option>
            <Option value="Điện thoại">Điện thoại</Option>
            <Option value="Phụ kiện">Phụ kiện</Option>
            <Option value="Máy tính bảng">Máy tính bảng</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            className: "pt-4",
          }}
          bordered={false}
          size="middle"
          className="custom-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Create Product Modal */}
      <CreateProductModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditProduct}
        product={selectedProduct}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteProduct}
        title="Xác nhận xóa sản phẩm"
        content={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}" không? Hành động này không thể hoàn tác.`}
        loading={loading}
      />
    </div>
  )
}

export default ProductManagement
