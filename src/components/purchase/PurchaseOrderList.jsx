import { useState } from "react";
import { Table, Tag, Input, Button } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import ExpandedPurchaseOrderTabs from "./ExpandedPurchaseOrderTabs";
import purchaseOrderService from "../../service/purchaseService";
import { useLocation } from "react-router-dom";
import LoadingLogo from "../LoadingLogo";

export default function PurchaseOrderList({ loading, purchaseOrders, onEdit, onApprove, onCreateNew, onDelete, pagination, onChange }) {
  const location = useLocation();
  const isReturnPage = location.pathname.includes('purchase-return');
  const mockWarehouses = useSelector(state => state.warehouse.warehouses.data);
  const warehouseMap = new Map(
    mockWarehouses?.map(wh => [wh.warehouse_id, wh.warehouse_name])
  );

  const [searchText, setSearchText] = useState("");
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleApprove = (order) => {
    if (confirm(`Bạn có chắc chắn muốn phê duyệt đơn nhập hàng ${isReturnPage ? order.return_id : order.po_id}?`)) {
      onApprove(isReturnPage ? order.return_id : order.po_id)
    }
  }

  const filteredOrders = purchaseOrders
    .filter(po => (isReturnPage ? po.return_id : po.po_id))
    .map(po => ({
      ...po,
      warehouse_name: warehouseMap.get(po.warehouse_id || po.details?.[0]?.warehouse_id) || 'Unknown',
    }));
  console.log("🚀 ~ PurchaseOrderList ~ filteredOrders:", filteredOrders)

  const columns = [
    {
      title: isReturnPage ? 'Mã trả hàng' : 'Mã đơn',
      dataIndex: isReturnPage ? 'return_id' : 'po_id',
      key: isReturnPage ? 'return_id' : 'po_id',
      render: (id, record) => isReturnPage ? record.return_id : record.po_id,
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
      render: (status, record) =>
        isReturnPage ? (
          <Tag color={status === "pending" ? "orange" : "green"}>
            {status === "pending" ? "Chờ duyệt" : "Đã trả"}
          </Tag>
        ) : (
          <Tag color={status === "draft" ? "orange" : "green"}>
            {status === "draft" ? "Chờ duyệt" : "Đã nhập"}
          </Tag>
        ),
    },
    {
      title: isReturnPage ? 'Ngày tạo' : 'Ngày phê duyệt',
      dataIndex: isReturnPage ? 'created_at' : 'posted_at',
      key: isReturnPage ? 'created_at' : 'posted_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          {/* <Button type="link" onClick={() => handleViewDetail(record.po_id)}>
            Chi tiết
          </Button> */}
          {record.status === "draft" || record.status === "pending" && (
            <>
              <Button type="link" onClick={() => onEdit(record)}>
                Sửa
              </Button>
              <Button
                type="link"
                style={{ color: '#52c41a' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(record);
                }}
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
          {isReturnPage ? 'Tạo đơn trả hàng nhập' : 'Tạo đơn nhập hàng'}
        </Button>
      </div>

      <Table
        loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
        columns={columns}
        dataSource={filteredOrders}
        rowKey={isReturnPage ? 'return_id' : 'po_id'}
        locale={{
          emptyText: isReturnPage ? 'Không có đơn trả hàng nhập nào' : 'Không có đơn nhập hàng nào'
        }}
        expandable={{
          expandedRowRender: (record) => <ExpandedPurchaseOrderTabs record={record} />,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            const key = isReturnPage ? record.return_id : record.po_id;
            setExpandedRowKeys(expanded ? [key] : []);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            const key = isReturnPage ? record.return_id : record.po_id;
            setExpandedRowKeys(expandedRowKeys.includes(key) ? [] : [key]);
          },
          className: "cursor-pointer",
        })}
        pagination={pagination}
        onChange={onChange}
      />
    </div>
  );
}