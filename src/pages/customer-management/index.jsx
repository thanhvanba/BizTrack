import { useEffect, useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Typography } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import useToastNotify from "../../utils/useToastNotify"
import customerService from "../../service/customerService"
import CustomerModal from "../../components/modals/CustomerModal"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"

const { Title } = Typography

const CustomerManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const fetchCustomers = async () => {
    try {
      const res = await customerService.getAllCustomers()
      setCustomers(res.data.map(c => ({ ...c, key: c.customer_id })))
    } catch (err) {
      useToastNotify("Không thể tải danh sách khách hàng.", "error")
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleCreateCustomer = async (data) => {
    try {
      await customerService.createCustomer(data)
      setCreateModalVisible(false)
      fetchCustomers()
      useToastNotify(`Đã thêm khách hàng "${data.customer_name}" thành công!`, "success")
    } catch {
      useToastNotify("Thêm khách hàng không thành công.", "error")
    }
  }

  const handleEditCustomer = async (data) => {
    try {
      await customerService.updateCustomer(data.customer_id, data)
      setEditModalVisible(false)
      fetchCustomers()
      useToastNotify(`Đã cập nhật khách hàng "${data.customer_name}" thành công!`, "success")
    } catch {
      useToastNotify("Cập nhật khách hàng không thành công.", "error")
    }
  }

  const handleDeleteCustomer = async () => {
    setLoading(true)
    try {
      await customerService.deleteCustomer(selectedCustomer.customer_id)
      setDeleteModalVisible(false)
      setSelectedCustomer(null)
      fetchCustomers()
      useToastNotify(`Đã xóa khách hàng "${selectedCustomer.customer_name}" thành công!`, "success")
    } catch(err) {
      console.log("🚀 ~ handleDeleteCustomer ~ err:", err)
      useToastNotify("Xóa khách hàng không thành công.", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredData = customers.filter((c) =>
    [c.customer_name, c.email, c.phone].some(field =>
      field?.toLowerCase().includes(searchText.toLowerCase())
    )
  )

  const columns = [
    {
      title: "Tên khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (name) => <span className="font-medium">{name}</span>,
      sorter: (a, b) => a.customer_name.localeCompare(b.customer_name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
      render: (email) => email || '-'
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      responsive: ["md"]
    },
    {
      title: "Tổng đơn hàng",
      dataIndex: "total_orders",
      key: "total_orders",
      align: "center",
      responsive: ["lg"]
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "total_expenditure",
      key: "total_expenditure",
      render: (value) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value),
      align: "right",
      responsive: ["lg"]
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      responsive: ["lg"],
      render: (status) => status || "-"
      // render: (status) =>
      //   <Tag color={status === "active" ? "success" : "default"}>
      //     {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
      //   </Tag>,
      // filters: [
      //   { text: "Đang hoạt động", value: "active" },
      //   { text: "Ngừng hoạt động", value: "inactive" }
      // ],
      // onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedCustomer(record)
                setEditModalVisible(true)
              }}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedCustomer(record)
                setDeleteModalVisible(true)
              }}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      )
    }
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
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all"
        >
          Thêm khách hàng
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm theo tên, email hoặc số điện thoại"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            className="md:max-w-md"
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 5, showSizeChanger: true }}
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có khách hàng nào" }}
        />
      </Card>

      {/* Modals */}
      <CustomerModal
        mode="create"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateCustomer}
      />
      <CustomerModal
        mode="edit"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditCustomer}
        customer={selectedCustomer}
      />
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteCustomer}
        title="Xác nhận xóa khách hàng"
        content={`Bạn có chắc chắn muốn xóa khách hàng "${selectedCustomer?.customer_name}" không?`}
        loading={loading}
      />
    </div>
  )
}

export default CustomerManagement
