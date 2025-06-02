import { useState } from "react";
import { Table, Tag, Input, Button, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import AdjustmentDetail from "./AdjustmentDetail";
// import adjustmentService from "../../service/adjustmentService";

export default function AdjustmentList({ adjustments, onEdit, onApprove, onCreateNew }) {
  const mockWarehouses = useSelector(state => state.warehouse.warehouses.data);
  const warehouseMap = new Map(
    mockWarehouses?.map(wh => [wh.warehouse_id, wh.warehouse_name])
  );

  const [searchText, setSearchText] = useState("");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);

  const handleViewDetail = async (id) => {
    const res = await adjustmentService.getAdjustmentDetail(id);

    if (res && res.data) {
      const warehouse = mockWarehouses.find(w => w.warehouse_id === res.data.warehouse_id);
      const dataWithWarehouseName = {
        ...res.data,
        warehouse_name: warehouse ? warehouse.warehouse_name : 'Không rõ'
      };
      setSelectedAdjustment(dataWithWarehouseName);
      setDetailVisible(true);
    }
  };

  const handleApprove = (adjustment) => {
    if (confirm(`Bạn có chắc chắn muốn phê duyệt phiếu điều chỉnh ${adjustment.adjustment_id}?`)) {
      onApprove(adjustment.adjustment_id)
    }
  }

  const filteredAdjustments = adjustments.map(adj => ({
    ...adj,
    warehouse_name: warehouseMap.get(adj.warehouse_id) || 'Unknown',
  }));

  const columns = [
    {
      title: 'Mã điều chỉnh',
      dataIndex: 'adjustment_id',
      key: 'adjustment_id',
    },
    {
      title: 'Phương thức',
      dataIndex: 'adjustment_type',
      key: 'adjustment_type',
      render: (type) => (
        <Tag color={type === "increase" ? "green" : "red"}>
          {type === "increase" ? "Tăng kho" : "Giảm kho"}
        </Tag>
      ),
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
          {status === "draft" ? "Chờ duyệt" : "Đã phê duyệt"}
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
          <Button type="link" onClick={() => handleViewDetail(record.adjustment_id)}>
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
          placeholder="Tìm kiếm theo mã điều chỉnh"
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
          Tạo phiếu điều chỉnh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredAdjustments}
        rowKey="adjustment_id"
        locale={{
          emptyText: 'Không có phiếu điều chỉnh nào'
        }}
      />

      <Modal
        title={`Chi tiết phiếu điều chỉnh: ${selectedAdjustment?.adjustment_id}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width="80%"
      >
        {selectedAdjustment && <AdjustmentDetail adjustment={selectedAdjustment} />}
      </Modal>
    </div>
  );
}