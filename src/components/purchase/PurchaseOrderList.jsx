import { useState } from "react";
import { Table, Tag, Input, Button, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import PurchaseOrderDetail from "./PurchaseOrderDetail";
import purchaseOrderService from "../../service/purchaseService";

export default function PurchaseOrderList({ purchaseOrders, onEdit, onApprove, onCreateNew }) {
  const mockWarehouses = useSelector(state => state.warehouse.warehouses.data);
  const warehouseMap = new Map(
    mockWarehouses?.map(wh => [wh.warehouse_id, wh.warehouse_name])
  );

  const [searchText, setSearchText] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleViewDetail = async (id) => {
    const res = await purchaseOrderService.getPurchaseOrderDetail(id);

    if (res && res.data) {
      const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id);
      const dataWithWarehouseName = {
        ...res.data,
        warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
      };
      setSelectedOrder(dataWithWarehouseName);
      setDetailVisible(true);
    }
  };

  const handleApprove = (order) => {
    if (confirm(`Bạn có chắc chắn muốn phê duyệt đơn nhập hàng ${order.po_id}?`)) {
      onApprove(order.po_id)
    }
  }

  const filteredOrders = purchaseOrders.map(po => ({
    ...po,
    warehouse_name: warehouseMap.get(po.warehouse_id) || 'Unknown',
  }));

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'po_id',
      key: 'po_id',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
    },
    {
      title: 'Kho',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === "draft" ? "orange" : "green"}>
          {status === "draft" ? "Chờ duyệt" : "Đã nhập"}
        </Tag>
      ),
    },
    {
      title: 'Ngày phê duyệt',
      dataIndex: 'posted_at',
      key: 'posted_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button type="link" onClick={() => handleViewDetail(record.po_id)}>
            Chi tiết
          </Button>
          {record.status === "draft" && (
            <>
              <Button type="link" onClick={() => onEdit(record)}>
                Sửa
              </Button>
              <Button
                type="link"
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record)}
              >
                Phê duyệt
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Tìm kiếm theo mã đơn hoặc nhà cung cấp"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateNew}
        >
          Tạo đơn nhập hàng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="po_id"
        locale={{
          emptyText: 'Không có đơn nhập hàng nào'
        }}
      />

      <Modal
        title={`Chi tiết đơn nhập hàng: ${selectedOrder?.po_id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width="80%"
      >
        {selectedOrder && <PurchaseOrderDetail order={selectedOrder} />}
      </Modal>
    </div>
  );
}