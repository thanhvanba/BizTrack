import { Table, Tag } from 'antd';
import dayjs from 'dayjs';

const columns = [
  {
    title: 'TMã phiếu', 
    dataIndex: 'transactionId',
    key: 'transactionId',
  },
  {
    title: 'Thời gian   ',
    dataIndex: 'paymentDate',
    key: 'paymentDate',
    render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
  },
  {
    title: 'Giá trị phiếu',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (value) => `${value.toLocaleString()} ₫`,
  },
  {
    title: 'Phương thức',
    dataIndex: 'method',
    key: 'method',
    align: 'left'
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Success' ? 'green' : status === 'Pending' ? 'orange' : 'red';
      return <Tag color={color}>{status === 'Success' ? 'Đã thanh toán' : status === 'Pending' ? 'Đang xử lý' : 'Không thành công'}</Tag>;
    },
  },
  {
    title: 'Người tạo',
    dataIndex: 'creator',
    key: 'creator',
  },
];

const data = [
  {
    key: '1',
    transactionId: 'TT000004',
    paymentDate: '2025-06-23T14:21:00',
    amount: 5000000,
    method: 'Tiền mặt',
    status: 'Success',
    creator: '0987689777',
  },
  {
    key: '2',
    transactionId: 'TTHD000052',
    paymentDate: '2025-06-23T14:20:00',
    amount: 290000,
    method: 'Chuyển khoản',
    status: 'Success',
    creator: '0987689777',
  },
];

export default function PaymentHistory() {
  return (
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
  );
}
