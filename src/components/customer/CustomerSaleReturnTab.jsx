import { Table, Tag } from "antd";
import LoadingLogo from "../LoadingLogo";

const CustomerSaleReturnTab = ({ dataSource, loading, page, pageSize, total, onChangePage, onOrderClick }) => {
  const columns = [
    { 
      title: "Mã hóa đơn", 
      dataIndex: "code", 
      key: "code",
      render: (text, record) => (
        <span 
          className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onOrderClick && onOrderClick(record);
          }}
        >
          {text}
        </span>
      )
    },
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

  return (
    <Table
      loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
      columns={columns}
      dataSource={dataSource}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} hóa đơn`,
        pageSizeOptions: ['5', '10', '20', '50'],
      }}
      size="middle"
      scroll={{ x: 800 }} // Cho phép cuộn ngang nếu bảng quá rộng
      locale={{ emptyText: "Không có dữ liệu lịch sử bán/trả hàng." }} // Tin nhắn khi không có dữ liệu
      onChange={onChangePage}
    />
  );
};

export default CustomerSaleReturnTab;
