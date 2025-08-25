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
import LoadingLogo from "../../components/LoadingLogo"

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
      setSuppliers(res.data)
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
      fetchSuppliers(); // gọi lại toàn bộ đơn Tìm
      return;
    }
    try {
      const response = await searchService.searchSupplier(value);
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
      render: (email) => email || '-'
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tổng công nợ",
      dataIndex: "payable",
      key: "payable",
      render: (value) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value),
      align: "right",
    },
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
            placeholder="Tìm kiếm theo số điện thoại / tên nhà cung cấp"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className="md:max-w-md"
          />
        </div>

        <Table
          loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
          columns={columns}
          dataSource={suppliers}
          rowKey='supplier_id'
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="border-x-2 border-b-2 -m-4 border-blue-300 rounded-b-md bg-white shadow-sm">
                <ExpandedSupplierTabs setEditModalVisible={setEditModalVisible} setDeleteModalVisible={setDeleteModalVisible} setSelectedSupplier={setSelectedSupplier} record={record} fetchSuppliers={fetchSuppliers} />
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
              ? "z-10 bg-blue-400 rounded-md shadow-sm"
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
