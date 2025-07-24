import { Table, Input, Button, Typography, Space } from 'antd';
import { PlusOutlined, FileExcelOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons';
import CashBookExpandedTabs from './CashBookExpandedTabs';
import { useState } from 'react';

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
    title: 'Mã phiếu',
    dataIndex: 'code',
  },
  {
    title: 'Thời gian',
    dataIndex: 'time',
  },
  {
    title: 'Loại thu chi',
    dataIndex: 'type',
  },
  {
    title: 'Người nộp/nhận',
    dataIndex: 'partner',
  },
  {
    title: 'Giá trị',
    dataIndex: 'value',
    align: 'right',
    render: (value) => (
      <span style={{ color: value < 0 ? 'red' : 'green', fontWeight: 500 }}>
        {value.toLocaleString()}
      </span>
    ),
  },
];

export default function CashBookPage() {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
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
          <div className="text-xs text-gray-500">Quỹ đầu kỳ</div>
          <div className="font-bold text-lg text-gray-700">0</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tổng thu</div>
          <div className="font-bold text-lg text-green-500">264,461,000</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tổng chi</div>
          <div className="font-bold text-lg text-red-500">-291,551,000</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Tồn quỹ</div>
          <div className="font-bold text-lg text-blue-600">-27,090,000</div>
        </div>
      </div>
      {/* Bảng dữ liệu */}
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="code"
        size="middle"
        expandable={{
          expandedRowRender: (record) => <CashBookExpandedTabs record={record} />,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.code] : []);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            setExpandedRowKeys(expandedRowKeys.includes(record.code) ? [] : [record.code]);
          },
          className: "cursor-pointer",
        })}
      />
    </div>
  );
} 