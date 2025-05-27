import { useState } from "react"
import { Table, Button, Input, Tag, Space, Modal } from "antd"
import { useSelector } from "react-redux"
import purchaseOrderService from "../../service/purchaseService"
import PurchaseOrderDetail from "./PurchaseOrderDetail"

const { Search } = Input

export default function PurchaseOrderList({ purchaseOrders, onEdit, onApprove, onCreateNew }) {
  const warehouses = useSelector(state => state.warehouse.warehouses.data)
  const [searchText, setSearchText] = useState("")
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const warehouseMap = new Map(warehouses.map(w => [w.warehouse_id, w.warehouse_name]))

  const handleViewDetail = async (id) => {
    const res = await purchaseOrderService.getPurchaseOrderDetail(id)
    if (res?.data) {
      const warehouse = warehouses.find(w => w.warehouse_id === res.data.warehouse_id)
      setSelectedOrder({
        ...res.data,
        warehouse_name: warehouse ? warehouse.warehouse_name : "Không rõ",
      })
      setDetailVisible(true)
    }
  }

  const handleApprove = (order) => {
    Modal.confirm({
      title: `Phê duyệt đơn hàng ${order.po_id}`,
      content: "Bạn có chắc chắn muốn phê duyệt đơn hàng này?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: () => onApprove(order.po_id),
    })
  }

  const filteredOrders = purchaseOrders
    .map(po => ({
      ...po,
      warehouse_name: warehouseMap.get(po.warehouse_id) || "Không rõ",
    }))
    .filter(order =>
      order.po_id.toLowerCase().includes(searchText.toLowerCase()) ||
      order.supplier_name.toLowerCase().includes(searchText.toLowerCase())
    )

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "po_id",
      key: "po_id",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "Kho",
      dataIndex: "warehouse_name",
      key: "warehouse_name",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Ngày phê duyệt",
      dataIndex: "posted_at",
      key: "posted_at",
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "draft" ? (
          <Tag color="orange">Nháp</Tag>
        ) : (
          <Tag color="green">Đã phê duyệt</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record.po_id)}>
            Chi tiết
          </Button>
          {record.status === "draft" && (
            <>
              <Button type="link" onClick={() => onEdit(record)}>
                Sửa
              </Button>
              <Button type="link" onClick={() => handleApprove(record)}>
                Phê duyệt
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <Search
          placeholder="Tìm kiếm theo mã đơn hoặc nhà cung cấp"
          allowClear
          onSearch={value => setSearchText(value)}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={onCreateNew}>
          Tạo đơn nhập hàng
        </Button>
      </div>

      <Table
        rowKey="po_id"
        columns={columns}
        dataSource={filteredOrders}
        pagination={{ pageSize: 10 }}
      />

      {detailVisible && selectedOrder && (
        <Modal
          open={detailVisible}
          title={`Chi tiết đơn hàng: ${selectedOrder.po_id}`}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width="80%"
        >
          <PurchaseOrderDetail order={selectedOrder} />
        </Modal>
      )}
    </div>
  )
}
