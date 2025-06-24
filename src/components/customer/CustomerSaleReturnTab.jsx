import { Alert, Spin, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import customerReportService from "../../service/customerService";
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
      console.log("🚀 ~ status:", status)
      let color;
      switch (status) {
        case "Hoàn tất":
          color = "green";
          break;
        case "Đang giao":
          color = "blue";
          break;
        case "Đang đóng hàng":
          color = "orange";
          break;
        case "Xác nhận":
          color = "cyan";
          break;
        case "Mới":
          color = "gray";
          break;
        case "Huỷ đơn":
        case "Huỷ điều chỉnh":
          color = "red";
          break;
        default:
          color = "gray";
      }
      let text = status;

      return <Tag color={color}>{text}</Tag>;
    },
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
          await customerReportService.getCustomerOrderHistory(customerId);
        const mappedData = orderHistory.data?.map((order, index) => {
          console.log("🚀 ~ CustomerSaleReturnTab ~ orderHistory:", order);

          return {
            key: order.order_id || index.toString(),
            code: order.order_code,
            date: new Date(order.created_at).toLocaleString("vi-VN"),
            performer: order.customer_id,
            total: parseFloat(order.final_amount),
            status: order.order_status,
          };
        });
        
          console.log("🚀 ~ fetchOrderHistory ~ mappedData:", mappedData)
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
