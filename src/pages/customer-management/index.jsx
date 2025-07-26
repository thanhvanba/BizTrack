import { useEffect, useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Typography } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import useToastNotify from "../../utils/useToastNotify"
import customerService from "../../service/customerService"
import CustomerModal from "../../components/modals/CustomerModal"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"
import { debounce } from "lodash"
import searchService from "../../service/searchService"
import ExpandedCustomerTabs from "../../components/customer/ExpandedCustomerTabs"
import LoadingLogo from "../../components/LoadingLogo"

const { Title } = Typography

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  })
  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchCustomers = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await customerService.getAllCustomers({ page, limit })
      setCustomers(res.data)
      if (res.pagination) {
        setPagination({
          current: res.pagination.currentPage,
          pageSize: res.pagination.pageSize,
          total: res.pagination.total,
        });
      }
    } catch (err) {
      useToastNotify("Không thể tải danh sách khách hàng.", "error")
    } finally {
      setLoading(false);
    }
  }
  const handleTableChange = (paginationInfo) => {
    if (isSearching) {
      handleSearch(searchText, paginationInfo.current, paginationInfo.pageSize);
    } else {
      const { current, pageSize } = paginationInfo
      fetchCustomers(current, pageSize)
    }
  }
  const handleSearch = debounce(async (value, page = 1, pageSize = 5) => {
    if (!value) {
      setIsSearching(false);
      setSearchText("");
      fetchCustomers(); // gọi lại toàn bộ khách hàng
      return;
    }
    setIsSearching(true);
    setSearchText(value);
    try {
      const response = await searchService.searchCustomer(value, page, pageSize);
      const data = response.data || [];
      setCustomers(data.map(customer => ({ ...customer, key: customer?.customer_id, })));
      if (response.pagination) {
        setSearchPagination({
          current: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Không thể tìm thấy khách hàng theo số điện thoại.", 'error');
    }
  }, 500);

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
    } catch (err) {
      console.log("🚀 ~ handleDeleteCustomer ~ err:", err)
      useToastNotify("Xóa khách hàng không thành công.", "error")
    } finally {
      setLoading(false)
    }
  }
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(customers.map((item) => item.key))
    } else {
      setSelectedRowKeys([])
    }
  }

  // Handle individual row checkbox
  const handleRowSelect = (key, checked) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, key])
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((k) => k !== key))
    }
  }
  // Check if all rows are selected
  const isAllSelected = selectedRowKeys.length === customers.length && customers.length > 0

  // Check if some rows are selected (for indeterminate state)
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < customers.length
  const toggleExpand = (key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys([])
    } else {
      setExpandedRowKeys([key])
    }
  }

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
    // {
    //   title: "Tổng đơn hàng",
    //   dataIndex: "total_orders",
    //   key: "total_orders",
    //   align: "center",
    //   responsive: ["lg"]
    // },
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
      title: "Tổng công nợ",
      dataIndex: "total_remaining_value",
      key: "total_remaining_value",
      render: (value) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value),
      align: "right",
      responsive: ["lg"]
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
            placeholder="Tìm kiếm theo số điện thoại / tên khách hàng"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className="md:max-w-md"
          />
        </div>

        <Table
          loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
          columns={columns}
          dataSource={customers}
          rowKey='customer_id'
          pagination={{
            current: isSearching ? searchPagination.current : pagination.current,
            pageSize: isSearching ? searchPagination.pageSize : pagination.pageSize,
            total: isSearching ? searchPagination.total : pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khách hàng`, 
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                <ExpandedCustomerTabs setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedCustomer={setSelectedCustomer} record={record} fetchCustomers={fetchCustomers} />
              </div>
            ),
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? [record.customer_id] : []);
            },
          }}
          onRow={(record) => ({
            onClick: () => toggleExpand(record.customer_id),
            className: "cursor-pointer",
          })}
          rowClassName={(record) =>
            expandedRowKeys.includes(record.customer_id)
              ? "border-x-2 border-t-2 border-blue-500 !border-collapse z-10 bg-blue-50 rounded-md shadow-sm"
              : "hover:bg-gray-50 transition-colors"
          }
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có khách hàng nào" }}
          onChange={handleTableChange}
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
