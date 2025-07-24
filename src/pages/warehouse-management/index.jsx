import { useState, useEffect } from "react"
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tooltip,
  Typography,
} from "antd"
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import warehouseService from "../../service/warehouseService"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"
import useToastNotify from "../../utils/useToastNotify"
import WarehouseModal from "../../components/modals/WarehouseModal"
import LoadingLogo from "../../components/LoadingLogo"

const { Title } = Typography

const WarehouseManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const fetchWarehouses = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true)
    try {
      const response = await warehouseService.getAllWarehouses({ page, limit })
      setWarehouses(response.data)
      if (response.pagination) {
        setPagination({
          current: response.pagination.currentPage || response.pagination.page,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        })
      }
    } catch (err) {
      useToastNotify("Không thể tải danh sách kho.", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchWarehouses(current, pageSize);
  };

  const handleCreateWarehouse = async (data) => {
    try {
      await warehouseService.createWarehouse(data)
      setCreateModalVisible(false)
      fetchWarehouses()
      useToastNotify("Thêm kho thành công!", "success")
    } catch (err) {
      useToastNotify("Thêm kho thất bại.", "error")
    }
  }

  const handleEditWarehouse = async (data) => {
    try {
      await warehouseService.updateWarehouse(data.warehouse_id, data)
      setEditModalVisible(false)
      fetchWarehouses()
      useToastNotify("Cập nhật kho thành công!", "success")
    } catch (err) {
      useToastNotify("Cập nhật kho thất bại.", "error")
    }
  }

  const handleDeleteWarehouse = async () => {
    setLoading(true)
    try {
      await warehouseService.deleteWarehouse(selectedWarehouse.warehouse_id)
      setDeleteModalVisible(false)
      setSelectedWarehouse(null)
      fetchWarehouses()
      useToastNotify("Xóa kho thành công!", "success")
    } catch (err) {
      useToastNotify("Xóa kho thất bại.", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredData = warehouses.filter(w =>
    w.warehouse_name?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: "Tên kho",
      dataIndex: "warehouse_name",
      key: "warehouse_name",
      sorter: (a, b) => a.warehouse_name.localeCompare(b.warehouse_name),
    },
    {
      title: "Địa chỉ",
      dataIndex: "warehouse_location",
      key: "warehouse_location",
      render: (text) => text || "--",
    },
    {
      title: "Sức chứa",
      dataIndex: "warehouse_capacity",
      key: "warehouse_capacity",
      align: "right",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedWarehouse(record)
                setEditModalVisible(true)
              }}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => {
                setSelectedWarehouse(record)
                setDeleteModalVisible(true)
              }}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <Title level={2} className="text-xl md:text-2xl font-bold m-0">
          Quản lý kho
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 border-0 hover:bg-blue-600"
        >
          Thêm kho
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm kho theo tên..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-full md:max-w-sm"
          />
        </div>

        <Table
          loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          onChange={handleTableChange}
          size="middle"
          rowClassName="hover:bg-gray-50"
          locale={{ emptyText: "Không có kho nào" }}
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <WarehouseModal
        open={createModalVisible}
        mode="create"
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateWarehouse}
      />
      <WarehouseModal
        open={editModalVisible}
        mode="edit"
        warehouse={selectedWarehouse}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditWarehouse}
      />

      {/* Modal Xóa */}
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteWarehouse}
        title="Xác nhận xóa kho"
        content={`Bạn có chắc chắn muốn xóa kho "${selectedWarehouse?.warehouse_name}" không?`}
        loading={loading}
      />
    </div>
  )
}

export default WarehouseManagement
