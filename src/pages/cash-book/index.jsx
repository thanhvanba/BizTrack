import { useEffect, useState } from 'react';
import { Table, Input, Button, Typography, Space } from 'antd';
import { PlusOutlined, FileExcelOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons';
import CashBookExpandedTabs from './CashBookExpandedTabs';
import cashbookService from '../../service/cashbookService';
import LoadingLogo from '../../components/LoadingLogo';

const { Search } = Input;

const dataSource = [
  {
    key: '1',
    code: 'PC000002',
    time: '23/07/2025 09:00',
    type: 'Chi Tiền trả NCC',
    partner: 'Công ty TNHH Thời Trang Mặt Trời Hồng',
    value: -1090000,
  },
  {
    key: '2',
    code: 'PCPN000048',
    time: '23/07/2025 08:58',
    type: 'Chi Tiền trả NCC',
    partner: 'Công ty cổ phần thời trang Thiên Quang',
    value: -11000000,
  },
  {
    key: '3',
    code: 'PC000001',
    time: '23/07/2025 08:54',
    type: 'Chi Tiền trả NCC',
    partner: 'Công ty TNHH Thời Trang Mặt Trời Hồng',
    value: -20000000,
  },
  {
    key: '4',
    code: 'TT000001',
    time: '23/07/2025 08:54',
    type: 'Thu Tiền khách trả',
    partner: 'Anh Hoàng - Sài Gòn',
    value: 5000000,
  },
  {
    key: '5',
    code: 'TTPN000046',
    time: '19/07/2025 09:55',
    type: 'Chi Tiền trả NCC',
    partner: 'Công ty Thời Trang Việt',
    value: -13346000,
  },
  {
    key: '6',
    code: 'TTHD000046',
    time: '19/07/2025 09:55',
    type: 'Thu Tiền khách trả',
    partner: 'Tuấn - Hà Nội',
    value: 13346000,
  },
];

const columns = [
  {
    title: 'Mã giao dịch',
    dataIndex: 'transaction_code',
    key: 'transaction_code',
    width: 160,
  },
  {
    title: 'Thời gian',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    render: (value) => value ? new Date(value).toLocaleString('vi-VN') : '',
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    render: (type) => {
      if (type === 'payment') return <span className="text-red-500 font-medium">Chi</span>;
      if (type === 'receipt') return <span className="text-green-600 font-medium">Thu</span>;
      return type;
    },
  },
  {
    title: 'Nội dung',
    dataIndex: 'description',
    key: 'description',
    width: 260,
    render: (text) => <span className="line-clamp-1" title={text}>{text}</span>,
  },
  {
    title: 'Phương thức',
    dataIndex: 'payment_method',
    key: 'payment_method',
    width: 120,
  },
  {
    title: 'Danh mục',
    dataIndex: 'category',
    key: 'category',
    width: 140,
  },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 120,
    render: (value, record) => {
      const num = Number(value);
      return (
        <span style={{ color: record.type === 'payment' ? 'red' : 'green', fontWeight: 500 }}>
          {num.toLocaleString('vi-VN')}
        </span>
      );
    },
  },
];

export default function CashBookPage() {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total_receipt: 0, total_payment: 0, balance: 0 });

  useEffect(() => {
    setLoading(true);
    cashbookService.getLedger()
      .then((res) => {
        // Có thể phải bóc tách nhiều lớp tuỳ response thực tế
        const resultRows = res?.data?.data?.resultRows || [];
        const summaryData = res?.data?.data?.summary || { total_receipt: 0, total_payment: 0, balance: 0 };
        setRows(resultRows);
        setSummary(summaryData);
      })
      .catch(() => {
        setRows([]);
        setSummary({ total_receipt: 0, total_payment: 0, balance: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Thanh công cụ */}
      <div className="flex justify-between items-center mb-4">
        <Search placeholder="Theo mã phiếu" style={{ width: 300 }} />
        <Space>
          <Button type="primary" icon={<PlusOutlined />}>Phiếu thu</Button>
          <Button type="primary" icon={<PlusOutlined />}>Phiếu chi</Button>
          <Button icon={<FileExcelOutlined />}>Xuất file</Button>
          <Button icon={<SettingOutlined />} />
        </Space>
      </div>
      {/* Thống kê */}
      <div className="flex justify-end gap-8 mb-2">
        <div>
          <div className="text-xs text-gray-500">Tổng thu</div>
          <div className="font-bold text-lg text-green-500">{summary.total_receipt?.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tổng chi</div>
          <div className="font-bold text-lg text-red-500">-{summary.total_payment?.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tồn quỹ</div>
          <div className="font-bold text-lg text-blue-600">{summary.balance?.toLocaleString()}</div>
        </div>
      </div>
      {/* Bảng dữ liệu */}
      <Table
        dataSource={rows}
        columns={columns}
        loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
        pagination={false}
        rowKey="transaction_code"
        size="middle"
        expandable={{
          expandedRowRender: (record) => <CashBookExpandedTabs record={record} />,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.transaction_code] : []);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            setExpandedRowKeys(expandedRowKeys.includes(record.transaction_code) ? [] : [record.transaction_code]);
          },
          className: "cursor-pointer",
        })}
      />
    </div>
  );
} 