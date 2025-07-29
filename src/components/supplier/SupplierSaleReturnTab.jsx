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
  console.log("🚀 ~ CustomerSaleReturnTab ~ customerData:", supplierId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  console.log("🚀 ~ SupplierReceivablesTab ~ dataSource:", dataSource)

  useEffect(() => {
    const fetchSupplierHistory = async () => {
      // Đổi tên hàm thành fetchOrderHistory
      if (!supplierId) {
        setLoading(false);
        setError("Không có ID khách hàng để tải báo cáo.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const supplierHistory = await supplierService.getSupplierPOHistory(supplierId)
        setDataSource(supplierHistory.data);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierHistory();
  }, [supplierId]);
  return <Table columns={columns} loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false} dataSource={dataSource} pagination={false} size="middle" scroll={{ x: 800 }} />;
};

export default SupplierReceivablesTab;
