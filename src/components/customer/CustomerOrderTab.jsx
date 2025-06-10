import { Table } from "antd";

const columns = [
  { title: "Mã đặt hàng", dataIndex: "order_code", key: "order_code" },
  { title: "Thời gian", dataIndex: "order_date", key: "order_date" },
  { title: "Người bán", dataIndex: "seller", key: "seller" },
  { title: "Tổng cộng", dataIndex: "total", key: "total", render: (val) => `${val.toLocaleString()}₫` },
  { title: "Trạng thái", dataIndex: "status", key: "status" },
];

const data = [
  {
    key: "1",
    order_code: "DH000001",
    order_date: "05/06/2025 15:56",
    seller: "AnNK",
    total: 470000,
    status: "Hoàn thành",
  },
];

const CustomerOrderTab = () => {
  return <Table columns={columns} dataSource={data} pagination={false} size="small" />;
};

export default CustomerOrderTab;
