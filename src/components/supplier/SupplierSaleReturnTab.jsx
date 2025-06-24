import { Table, Tag } from "antd";
import supplierService from "../../service/supplierService";
import { useEffect, useState } from "react";

const columns = [
  { title: "Mã hóa đơn", dataIndex: "code", key: "code" },
  { title: "Thời gian", dataIndex: "date", key: "date" },
  { title: "Người bán", dataIndex: "seller", key: "seller" },
  {
    title: "Tổng cộng",
    dataIndex: "total",
    key: "total",
    align: "right",
    render: (val) => `${val < 0 ? '-' : ''}${Math.abs(val).toLocaleString()}₫`
  },
  {
    title: "Trạng thái", dataIndex: "status", key: "status",
    render: (_, record) => {
      const status = record.status;
      let text = status;
      let color = "default";

      if (status === "Đã trả") {
        color = "blue";
      } else if (status === "Hoàn thành") {
        color = "green";
      }

      return <Tag color={color}>{text}</Tag>;
    }
  },
];

const data = [
  { key: "1", code: "TH000003", date: "07/06/2025 15:43", seller: "AnNK", total: -900000, status: "Đã trả" },
  { key: "2", code: "HD000050.01", date: "07/06/2025 15:31", seller: "AnNK", total: 1900000, status: "Hoàn thành" },
  { key: "3", code: "HD000049", date: "05/06/2025 15:56", seller: "AnNK", total: 470000, status: "Hoàn thành" },
  { key: "4", code: "HD000047.01", date: "05/06/2025 15:21", seller: "AnNK", total: 99000, status: "Hoàn thành" },
  { key: "5", code: "HD000042", date: "01/06/2025 15:42", seller: "Hương - Kế Toán", total: 30095000, status: "Hoàn thành" },
];

const SupplierReceivablesTab = ({supplierId}) => {
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
        const supplierHistory = await supplierService.getSupplierHistory(supplierId)
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
  return <Table columns={columns} dataSource={data} pagination={false} size="middle" scroll={{ x: 800 }} />;
};

export default SupplierReceivablesTab;
