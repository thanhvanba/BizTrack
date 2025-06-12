import { useEffect, useState } from "react"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Typography } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import useToastNotify from "../../utils/useToastNotify"
import supplierService from "../../service/supplierService"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"
import { debounce } from "lodash"
import searchService from "../../service/searchService"
import SupplierModal from "../../components/modals/SupplierModal"
import ExpandedSupplierTabs from "../../components/supplier/ExpandedSupplierTabs"

const { Title } = Typography

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  })

  const fetchSuppliers = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true);
    try {
      const res = await supplierService.getAllSuppliers({ page, limit })
      setSuppliers(res.data.map(c => ({ ...c, key: c.supplier_id })))
      if (res.pagination) {
        setPagination({
          current: res.pagination.currentPage,
          pageSize: res.pagination.pageSize,
          total: res.pagination.total,
        });
      }
    } catch (err) {
      useToastNotify("Không thể tải danh sách nhà cung cấp.", "error")
    } finally {
      setLoading(false);
    }
  }
  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo
    fetchSuppliers(current, pageSize)
  }
  const handleSearch = debounce(async (value) => {
    if (!value) {
      fetchSuppliers(); // gọi lại toàn bộ đơn hàng
      return;
    }
    try {
      const response = await searchService.searchCustomerByPhone(value);
      const data = response.data || [];
      setSuppliers(data.map(supplier => ({ ...supplier, key: supplier?.supplier_id, })));
    } catch (error) {
      useToastNotify("Không thể tìm thấy nhà cung cấp theo số điện thoại.", 'error');
    }
  }, 500);

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleCreateSupplier = async (data) => {
    try {
      await supplierService.createSupplier(data)
      setCreateModalVisible(false)
      fetchSuppliers()
      useToastNotify(`Đã thêm nhà cung cấp "${data.supplier_name}" thành công!`, "success")
    } catch {
      useToastNotify("Thêm nhà cung cấp không thành công.", "error")
    }
  }

  const handleEditSupplier = async (data) => {
    try {
      await supplierService.updateSupplier(data.supplier_id, data)
      setEditModalVisible(false)
      fetchSuppliers()
      useToastNotify(`Đã cập nhật nhà cung cấp "${data.supplier_name}" thành công!`, "success")
    } catch {
      useToastNotify("Cập nhật nhà cung cấp không thành công.", "error")
    }
  }

  const handleDeleteSupplier = async () => {
    setLoading(true)
    try {
      await supplierService.deleteSupplier(selectedSupplier.supplier_id)
      setDeleteModalVisible(false)
      setSelectedSupplier(null)
      fetchSuppliers()
      useToastNotify(`Đã xóa nhà cung cấp "${selectedSupplier.supplier_name}" thành công!`, "success")
    } catch (err) {
      console.log("🚀 ~ handleDeleteSupplier ~ err:", err)
      useToastNotify("Xóa nhà cung cấp không thành công.", "error")
    } finally {
      setLoading(false)
    }
  }
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(suppliers.map((item) => item.key))
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
  const isAllSelected = selectedRowKeys.length === suppliers.length && suppliers.length > 0

  // Check if some rows are selected (for indeterminate state)
  const isIndeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < suppliers.length
  const toggleExpand = (key) => {
    if (expandedRowKeys.includes(key)) {
      setExpandedRowKeys([])
    } else {
      setExpandedRowKeys([key])
    }
  }

  const columns = [
    {
      title: "Tên nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
      render: (name) => <span className="font-medium">{name}</span>,
      sorter: (a, b) => a.supplier_name.localeCompare(b.supplier_name),
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
    //   title: "Trạng thái",
    //   dataIndex: "status",
    //   key: "status",
    //   align: "center",
    //   responsive: ["lg"],
    //   render: (status) => status || "-"
    //   // render: (status) =>
    //   //   <Tag color={status === "active" ? "success" : "default"}>
    //   //     {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
    //   //   </Tag>,
    //   // filters: [
    //   //   { text: "Đang hoạt động", value: "active" },
    //   //   { text: "Ngừng hoạt động", value: "inactive" }
    //   // ],
    //   // onFilter: (value, record) => record.status === value,
    // },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {/* <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip> */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedSupplier(record)
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
                setSelectedSupplier(record)
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
          Quản lý nhà cung cấp
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all"
        >
          Thêm nhà cung cấp
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo số điện thoại"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className="md:max-w-md"
          />
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={suppliers}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="border-x-2 border-b-2 -m-4 border-blue-500 rounded-b-md bg-white shadow-sm">
                <ExpandedSupplierTabs record={record} />
              </div>
            ),
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? [record.supplier_id] : []);
            },
          }}
          onRow={(record) => ({
            onClick: () => toggleExpand(record.supplier_id),
            className: "cursor-pointer",
          })}
          rowClassName={(record) =>
            expandedRowKeys.includes(record.supplier_id)
              ? "border-x-2 border-t-2 border-blue-500 !border-collapse z-10 bg-blue-50 rounded-md shadow-sm"
              : "hover:bg-gray-50 transition-colors"
          }
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có nhà cung cấp nào" }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modals */}
      <SupplierModal
        mode="create"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateSupplier}
      />
      <SupplierModal
        mode="edit"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditSupplier}
        supplier={selectedSupplier}
      />
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteSupplier}
        title="Xác nhận xóa nhà cung cấp"
        content={`Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedSupplier?.supplier_name}" không?`}
        loading={loading}
      />
    </div>
  )
}

export default SupplierManagement
