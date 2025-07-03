import { Table, Tag } from "antd";

const columns = [
  { title: "Mã trả hàng", dataIndex: "return_id", key: "return_id", render: (val) => { return "TH-" + val.slice(0, 8); } },
  { title: "Thời gian", dataIndex: "created_at", key: "created_at", render: (date) => new Date(date).toLocaleString('vi-VI') },
  { title: "Người nhận trả", dataIndex: "customer_name", key: "customer_name" },
  {
    title: "Tổng cộng",
    dataIndex: "total_refund",
    key: "total_refund",
    align: "right",
    render: (val) => val?.toLocaleString("vi-VN"),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const color =
        status === 'completed'
          ? 'blue'
          : status === 'pending'
            ? 'orange'
            : 'red';
      const text =
        status === 'completed'
          ? 'Đã trả'
          : status === 'pending'
            ? 'Đang xử lý'
            : 'Không thành công';

      return <Tag color={color}>{text}</Tag>;
    },
  },
];

const OrderReturnHistoryTab = ({ returnOrderData }) => {
  return (
    <Table
      columns={columns}
      dataSource={returnOrderData}
      pagination={false}
      size="middle"
      scroll={{ x: 800 }}
    />
  );
};

export default OrderReturnHistoryTab;
