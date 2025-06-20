import { Table, Tag } from "antd";

const columns = [
  { title: "Mã trả hàng", dataIndex: "code", key: "code", render: (text) => <a>{text}</a> },
  { title: "Thời gian", dataIndex: "date", key: "date" },
  { title: "Người nhận trả", dataIndex: "receiver", key: "receiver" },
  {
    title: "Tổng cộng",
    dataIndex: "total",
    key: "total",
    align: "right",
    render: (val) => val?.toLocaleString("vi-VN"),
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = status === "Đã trả" ? "green" : "default";
      return <Tag color={color}>{status}</Tag>;
    },
  },
];

const data = [
  {
    key: "1",
    code: "TH000005",
    date: "18/06/2025 13:54",
    receiver: "An Thành",
    total: 698000,
    status: "Đã trả",
  },
  {
    key: "2",
    code: "TH000004",
    date: "18/06/2025 13:52",
    receiver: "An Thành",
    total: 1047000,
    status: "Đã trả",
  },
  {
    key: "3",
    code: "TH000003",
    date: "18/06/2025 13:51",
    receiver: "An Thành",
    total: 2443000,
    status: "Đã trả",
  },
  {
    key: "4",
    code: "TH000002",
    date: "17/06/2025 12:21",
    receiver: "An Thành",
    total: 0,
    status: "Đã trả",
  },
  {
    key: "5",
    code: "TH000001",
    date: "17/06/2025 12:01",
    receiver: "An Thành",
    total: 0,
    status: "Đã trả",
  },
];

const OrderReturnHistoryTab = () => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      size="middle"
      scroll={{ x: 800 }}
    />
  );
};

export default OrderReturnHistoryTab;
