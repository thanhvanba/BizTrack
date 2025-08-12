import { Table, Tag } from "antd";
import supplierService from "../../service/supplierService";
import { useEffect, useState } from "react";
import LoadingLogo from "../LoadingLogo";

const columns = [
  { title: "Mã hóa đơn", dataIndex: "order_code", key: "order_code" },
  { title: "Thời gian", dataIndex: "order_date", key: "order_date" },
  { title: "Người bán", dataIndex: "seller", key: "seller" },
  {
    title: "Tổng cộng",
    dataIndex: "total_amount",
    key: "total_amount",
    align: "right",
    render: (val) => `${val < 0 ? '-' : ''}${Math.abs(val).toLocaleString()}₫`
  },
  {
    title: "Trạng thái", dataIndex: "order_status", key: "order_status",
    render: (_, record) => {
      const status = record.order_status;
      let text = status;
      let color = "default";

      if (status === "approved") {
        text = "Đã trả";
        color = "blue";
      } else if (status === "posted") {
        text = "Đã nhập";
        color = "green";
      } else if (status === "Đã trả") {
        color = "blue";
      } else if (status === "Hoàn thành") {
        color = "green";
      }

      return <Tag color={color}>{text}</Tag>;
    }
  },
];

const SupplierReceivablesTab = ({ supplierId }) => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  })
  const fetchSupplierHistory = async (page = pagination.current, limit = pagination.pageSize) => {
    // Đổi tên hàm thành fetchOrderHistory
    if (!supplierId) {
      setLoading(false);
      setError("Không có ID khách hàng để tải báo cáo.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const supplierHistory = await supplierService.getSupplierPOHistory(supplierId, { page, limit })
      if (supplierHistory.pagination) {
        setPagination({
          current: supplierHistory.pagination.currentPage,
          pageSize: supplierHistory.pagination.pageSize,
          total: supplierHistory.pagination.total,
        });
      }
      setDataSource(supplierHistory.data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
      setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    fetchSupplierHistory(current, pageSize);
  };

  useEffect(() => {

    fetchSupplierHistory();
  }, [supplierId]);
  return <Table
    columns={columns}
    loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
    dataSource={dataSource}
    pagination={{
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: true,
      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hóa đơn`,
      pageSizeOptions: ['5', '10', '20', '50'],
    }}
    size="middle"
    scroll={{ x: 800 }}
    onChange={handleTableChange}
  />;
};

export default SupplierReceivablesTab;
