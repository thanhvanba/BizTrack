import { useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Typography, Avatar, message } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import CustomerModal from "../../components/modals/CustomerModal"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"

const { Title } = Typography

const CustomerManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loading, setLoading] = useState(false)

  // Sample data
  const [customersData, setCustomersData] = useState([
    {
      key: "1",
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      orders: 12,
      totalSpent: 25000000,
      status: "Thân thiết",
      avatar: "NA",
    },
    {
      key: "2",
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0912345678",
      orders: 8,
      totalSpent: 18000000,
      status: "Thường xuyên",
      avatar: "TB",
    },
    {
      key: "3",
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0923456789",
      orders: 5,
      totalSpent: 12000000,
      status: "Thường xuyên",
      avatar: "LC",
    },
    {
      key: "4",
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      phone: "0934567890",
      orders: 3,
      totalSpent: 5000000,
      status: "Mới",
      avatar: "PD",
    },
    {
      key: "5",
      name: "Hoàng Văn E",
      email: "hoangvane@example.com",
      phone: "0945678901",
      orders: 15,
      totalSpent: 32000000,
      status: "VIP",
      avatar: "HE",
    },
  ])

  // Filter data based on search text
  const filteredData = customersData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText),
  )

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Get avatar color based on status
  const getAvatarColor = (status) => {
    switch (status) {
      case "VIP":
        return "#722ed1"
      case "Thân thiết":
        return "#52c41a"
      case "Thường xuyên":
        return "#1677ff"
      case "Mới":
        return "#faad14"
      default:
        return "#1677ff"
    }
  }

  // Handle create customer
  const handleCreateCustomer = (customerData) => {
    // Get initials from name
    const initials = customerData.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    // Map customer type to status
    const statusMap = {
      new: "Mới",
      regular: "Thường xuyên",
      loyal: "Thân thiết",
      vip: "VIP",
    }

    // Create new customer object
    const newCustomer = {
      key: String(customersData.length + 1),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      orders: 0,
      totalSpent: 0,
      status: statusMap[customerData.customerType],
      avatar: initials,
    }

    // Add new customer to the list
    setCustomersData([newCustomer, ...customersData])

    // Close modal and show success message
    setCreateModalVisible(false)
    message.success(`Khách hàng "${customerData.name}" đã được thêm thành công!`)
  }

  // Handle edit customer
  const handleEditCustomer = (updatedCustomer) => {
    // Get initials from name if name changed
    let initials = updatedCustomer.avatar
    if (updatedCustomer.name !== selectedCustomer.name) {
      initials = updatedCustomer.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }

    // Update customer in the list
    const updatedData = customersData.map((customer) =>
      customer.key === updatedCustomer.key ? { ...updatedCustomer, avatar: initials } : customer,
    )

    // Update state
    setCustomersData(updatedData)

    // Close modal and show success message
    setEditModalVisible(false)
    message.success(`Khách hàng "${updatedCustomer.name}" đã được cập nhật thành công!`)
  }

  // Handle delete customer
  const handleDeleteCustomer = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Remove customer from the list
      setCustomersData(customersData.filter((item) => item.key !== selectedCustomer.key))

      // Reset state and show success message
      setLoading(false)
      setDeleteModalVisible(false)
      setSelectedCustomer(null)
      message.success(`Khách hàng "${selectedCustomer.name}" đã được xóa thành công!`)
    }, 1000)
  }

  // Edit customer
  const editCustomer = (customer) => {
    setSelectedCustomer(customer)
    setEditModalVisible(true)
  }

  // Confirm delete customer
  const confirmDelete = (customer) => {
    setSelectedCustomer(customer)
    setDeleteModalVisible(true)
  }

  // Table columns
  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: getAvatarColor(record.status) }}>{record.avatar}</Avatar>
          <div className="ml-3">
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      responsive: ["md"],
    },
    {
      title: "Đơn hàng",
      dataIndex: "orders",
      key: "orders",
      sorter: (a, b) => a.orders - b.orders,
      align: "center",
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (totalSpent) => formatPrice(totalSpent),
      sorter: (a, b) => a.totalSpent - b.totalSpent,
      align: "right",
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
          case "VIP":
            color = "purple"
            break
          case "Thân thiết":
            color = "success"
            break
          case "Thường xuyên":
            color = "processing"
            break
          case "Mới":
            color = "warning"
            break
          default:
            color = "default"
        }
        return <Tag color={color}>{status}</Tag>
      },
      filters: [
        { text: "VIP", value: "VIP" },
        { text: "Thân thiết", value: "Thân thiết" },
        { text: "Thường xuyên", value: "Thường xuyên" },
        { text: "Mới", value: "Mới" },
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
              onClick={() => editCustomer(record)}
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
          Quản lý khách hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Thêm khách hàng
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
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

      {/* Create Customer Modal */}
      <CustomerModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateCustomer}
        mode="create"
      />

      {/* Edit Customer Modal */}
      <CustomerModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditCustomer}
        mode="edit"
        customer={selectedCustomer}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteCustomer}
        title="Xác nhận xóa khách hàng"
        content={`Bạn có chắc chắn muốn xóa khách hàng "${selectedCustomer?.name}" không? Hành động này không thể hoàn tác.`}
        loading={loading}
      />
    </div>
  )
}

export default CustomerManagement
