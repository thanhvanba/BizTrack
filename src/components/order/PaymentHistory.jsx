import { Table, Tag } from 'antd';
import dayjs from 'dayjs';
import formatPrice from '../../utils/formatPrice';

const statusMap = {
  pending: 'Tạo đơn hàng',
  partial_paid: 'Thanh toán một phần',
  payment: 'Thanh toán',
  completed: 'Hoàn tất',
  cancelled: 'Hủy bỏ',
  return: 'Trả hàng',
  receipt: 'Thanh toán đơn hàng'
};

const columns = [
  {
    title: 'Mã phiếu',
    dataIndex: 'transaction_code',
    key: 'transaction_code',
  },
  {
    title: 'Thời gian   ',
    dataIndex: 'transaction_date',
    key: 'transaction_date',
    render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm'),
  },
  {
    title: "Loại thanh toán",
    dataIndex: "type",
    key: "type",
    render: (value) => statusMap[value] || value,
  },
  {
    title: 'Giá trị phiếu',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (val) => formatPrice(val)
  },
  // {
  //   title: 'Phương thức',
  //   dataIndex: 'payment_method',
  //   key: 'payment_method',
  //   align: 'left'
  // },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'completed' ? 'green' : status === 'Pending' ? 'orange' : 'red';
      return <Tag color={color}>{status === 'completed' ? 'Đã thanh toán' : status === 'Pending' ? 'Đang xử lý' : 'Không thành công'}</Tag>;
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

export default function PaymentHistory({ orderTransaction }) {
  return (
    <Table columns={columns} dataSource={orderTransaction} pagination={{ pageSize: 5 }} />
  );
}
