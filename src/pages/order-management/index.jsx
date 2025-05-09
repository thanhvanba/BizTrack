import { useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Select, Typography, DatePicker, message } from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons"
import CreateOrderModal from "../../components/modals/CreateOrderModal"
import EditOrderModal from "../../components/modals/EditOrderModal"
import OrderDetailDrawer from "../../components/drawers/OrderDetailDrawer"

const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const OrderManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  // Sample data
  const [ordersData, setOrdersData] = useState([
    {
      key: "1",
      id: "ORD-001",
      customer: "Nguyễn Văn A",
      date: "15/05/2023",
      total: 2500000,
      items: 3,
      status: "Đã giao",
    },
    {
      key: "2",
      id: "ORD-002",
      customer: "Trần Thị B",
      date: "14/05/2023",
      total: 1800000,
      items: 2,
      status: "Đang giao",
    },
    {
      key: "3",
      id: "ORD-003",
      customer: "Lê Văn C",
      date: "14/05/2023",
      total: 3200000,
      items: 4,
      status: "Đang xử lý",
    },
    {
      key: "4",
      id: "ORD-004",
      customer: "Phạm Thị D",
      date: "13/05/2023",
      total: 950000,
      items: 1,
      status: "Đã giao",
    },
    {
      key: "5",
      id: "ORD-005",
      customer: "Hoàng Văn E",
      date: "12/05/2023",
      total: 1500000,
      items: 2,
      status: "Đã hủy",
    },
    {
      key: "6",
      id: "ORD-006",
      customer: "Vũ Thị F",
      date: "11/05/2023",
      total: 4200000,
      items: 5,
      status: "Đã giao",
    },
  ])

  // Filter data based on search text and status
  const filteredData = ordersData.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchText.toLowerCase())),
  )

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
  }

  // Handle create order
  const handleCreateOrder = (orderData) => {
    // Generate a new order ID
    const newOrderId = `ORD-${String(ordersData.length + 1).padStart(3, "0")}`

    // Create new order object
    const newOrder = {
      key: String(ordersData.length + 1),
      id: newOrderId,
      customer:
        orderData.customerId === 1
          ? "Nguyễn Văn A"
          : orderData.customerId === 2
            ? "Trần Thị B"
            : orderData.customerId === 3
              ? "Lê Văn C"
              : orderData.customerId === 4
                ? "Phạm Thị D"
                : "Hoàng Văn E",
      date: orderData.orderDate,
      total: orderData.total,
      items: orderData.items.length,
      status: "Đang xử lý",
      note: orderData.note,
    }

    // Add new order to the list
    setOrdersData([newOrder, ...ordersData])

    // Close modal and show success message
    setCreateModalVisible(false)
    message.success(`Đơn hàng ${newOrderId} đã được tạo thành công!`)
  }

  // Handle edit order
  const handleEditOrder = (updatedOrder) => {
    // Update order in the list
    const updatedData = ordersData.map((order) => (order.key === updatedOrder.key ? { ...updatedOrder } : order))

    // Update state
    setOrdersData(updatedData)

    // Close modal and show success message
    setEditModalVisible(false)
    message.success(`Đơn hàng ${updatedOrder.id} đã được cập nhật thành công!`)
  }

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setDetailDrawerVisible(true)
  }

  // Edit order
  const editOrder = (order) => {
    setSelectedOrder(order)
    setEditModalVisible(true)
  }

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      sorter: (a, b) => a.customer.localeCompare(b.customer),
    },
    {
      title: "Ngày đặt",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) =>
        new Date(a.date.split("/").reverse().join("-")) - new Date(b.date.split("/").reverse().join("-")),
      responsive: ["md"],
    },
    {
      title: "Số lượng",
      dataIndex: "items",
      key: "items",
      align: "center",
      sorter: (a, b) => a.items - b.items,
      responsive: ["lg"],
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => formatPrice(total),
      sorter: (a, b) => a.total - b.total,
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        let color
        switch (status) {
          case "Đã giao":
            color = "success"
            break
          case "Đang giao":
            color = "processing"
            break
          case "Đang xử lý":
            color = "warning"
            break
          case "Đã hủy":
            color = "error"
            break
          default:
            color = "default"
        }
        return <Tag color={color}>{status}</Tag>
      },
      filters: [
        { text: "Đã giao", value: "Đã giao" },
        { text: "Đang giao", value: "Đang giao" },
        { text: "Đang xử lý", value: "Đang xử lý" },
        { text: "Đã hủy", value: "Đã hủy" },
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
              onClick={() => viewOrderDetails(record)}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editOrder(record)}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              size="small"
              className="text-purple-500 hover:text-purple-600 hover:bg-purple-50"
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
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
          Quản lý đơn hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Tạo đơn hàng
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select defaultValue="all" style={{ minWidth: 150 }} onChange={(value) => setStatusFilter(value)}>
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Đã giao">Đã giao</Option>
              <Option value="Đang giao">Đang giao</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
            <RangePicker placeholder={["Từ ngày", "Đến ngày"]} className="w-full sm:w-auto" />
          </div>
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

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateOrder}
      />

      {/* Edit Order Modal */}
      <EditOrderModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditOrder}
        order={selectedOrder}
      />

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        order={selectedOrder}
      />
    </div>
  )
}

export default OrderManagement
