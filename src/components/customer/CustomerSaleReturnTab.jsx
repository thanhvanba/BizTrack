import { Table, Tag } from "antd";
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
        case "Đang xử lý":
          color = "orange";
          break;
        case "Xác nhận":
          color = "cyan";
          break;
        case "Mới":
          color = "gray";
          break;
        case "Huỷ đơn":
        case "Không thành công":
        case "Huỷ điều chỉnh":
          color = "red";
          break;
        default:
          color = "blue";
      }
      let text = status;

      return <Tag color={color}>{text}</Tag>;
    },
  },
];

// const CustomerSaleReturnTab = () => {
//   return <Table columns={columns} dataSource={data} pagination={false} size="middle" scroll={{ x: 800 }} />;
// };

const CustomerSaleReturnTab = ({ dataSource }) => {
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
