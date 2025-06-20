import { Alert, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import CustomerReportService from "../../service/customerReportService";
const columns = [
  { title: "Mã hóa đơn", dataIndex: "code", key: "code" },
  { title: "Thời gian", dataIndex: "date", key: "date" },
  { title: "Người bán", dataIndex: "seller", key: "seller" },
  {
    title: "Tổng cộng",
    dataIndex: "total",
    key: "total",
    align: "right",
    render: (val) => `${val < 0 ? "-" : ""}${Math.abs(val).toLocaleString()}₫`,
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
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
    },
  },
];

const data = [
  {
    key: "1",
    code: "TH000003",
    date: "07/06/2025 15:43",
    seller: "AnNK",
    total: -900000,
    status: "Đã trả",
  },
  {
    key: "2",
    code: "HD000050.01",
    date: "07/06/2025 15:31",
    seller: "AnNK",
    total: 1900000,
    status: "Hoàn thành",
  },
  {
    key: "3",
    code: "HD000049",
    date: "05/06/2025 15:56",
    seller: "AnNK",
    total: 470000,
    status: "Hoàn thành",
  },
  {
    key: "4",
    code: "HD000047.01",
    date: "05/06/2025 15:21",
    seller: "AnNK",
    total: 99000,
    status: "Hoàn thành",
  },
  {
    key: "5",
    code: "HD000042",
    date: "01/06/2025 15:42",
    seller: "Hương - Kế Toán",
    total: 30095000,
    status: "Hoàn thành",
  },
];

// const CustomerSaleReturnTab = () => {
//   return <Table columns={columns} dataSource={data} pagination={false} size="middle" scroll={{ x: 800 }} />;
// };

const CustomerSaleReturnTab = ({ customerId }) => {
  console.log("🚀 ~ CustomerSaleReturnTab ~ customerData:", customerId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      // Đổi tên hàm thành fetchOrderHistory
      if (!customerId) {
        setLoading(false);
        setError("Không có ID khách hàng để tải báo cáo.");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const orderHistory =
          await CustomerReportService.getCustomerOrderHistory(customerId);
        const mappedData = orderHistory.data?.map((order, index) => {
          console.log("🚀 ~ CustomerSaleReturnTab ~ orderHistory:", order);

          return {
            key: order.order_id || index.toString(), 
            code: order.order_code, 
            date: new Date(order.created_at).toLocaleString(), 
            performer: order.customer_id, 
            total: parseFloat(order.final_amount), 
            status: order.order_status, 
          };
        });
        setDataSource(mappedData);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory(); // Gọi hàm fetchOrderHistory
  }, [customerId]); // Chạy lại useEffect khi customerId thay đổi

  if (loading) {
    return (
      <Spin
        tip="Đang tải lịch sử đơn hàng..."
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      />
    );
  }

  if (error) {
    return <Alert message="Lỗi" description={error} type="error" showIcon />;
  }

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false} // Tùy chọn: bạn có thể bật phân trang nếu muốn
      size="middle"
      scroll={{ x: 800 }} // Cho phép cuộn ngang nếu bảng quá rộng
      locale={{ emptyText: "Không có dữ liệu lịch sử bán/trả hàng." }} // Tin nhắn khi không có dữ liệu
    />
  );
};

export default CustomerSaleReturnTab;
