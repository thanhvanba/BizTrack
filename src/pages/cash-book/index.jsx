import { useEffect, useState } from 'react';
import { Table, Input, Button, Typography, Space } from 'antd';
import { PlusOutlined, FileExcelOutlined, SettingOutlined, StarOutlined } from '@ant-design/icons';
import CashBookExpandedTabs from './CashBookExpandedTabs';
import cashbookService from '../../service/cashbookService';
import LoadingLogo from '../../components/LoadingLogo';
import DebtAdjustmentModal from '../../components/modals/DebtAdjustment';

const { Search } = Input;

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
  console.log("🚀 ~ CashBookPage ~ rows:", rows)
  const [summary, setSummary] = useState({ total_receipt: 0, total_payment: 0, balance: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('receipt'); // 'receipt' hoặc 'payment'
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const fetchData = (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    cashbookService.getLedger({ page, limit: pageSize })
      .then((res) => {
        // Có thể phải bóc tách nhiều lớp tuỳ response thực tế
        const resultRows = res?.data?.resultRows || [];
        const summaryData = res?.data?.summary || { total_receipt: 0, total_payment: 0, balance: 0 };

        setRows(resultRows);
        setSummary(summaryData);
        setPagination({
          current: res?.pagination.currentPage,
          pageSize: res?.pagination.pageSize,
          total: res?.pagination.total,
        });
      })
      .catch(() => {
        setRows([]);
        setSummary({ total_receipt: 0, total_payment: 0, balance: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    fetchData(current, pageSize);
  };

  const handleCreateTransaction = async (values) => {
    const body = {
      amount: Number(values.adjustmentValue),
      type: modalType, // 'receipt' hoặc 'payment'
      category: values.category || (modalType === 'receipt' ? 'customer_payment' : 'supplier_payment'),
      payment_method: values.paymentMethod || 'cash',
      description: values.description || '',
    };

    await cashbookService.createTransaction(body);
    // Reload data
    fetchData(pagination.current, pagination.pageSize);
    setIsModalOpen(false);
  };

  const openReceiptModal = () => {
    setModalType('receipt');
    setIsModalOpen(true);
  };

  const openPaymentModal = () => {
    setModalType('payment');
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Thanh công cụ */}
      <div className="flex justify-between items-center mb-4">
        <Search placeholder="Theo mã phiếu" style={{ width: 300 }} />
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openReceiptModal}>Phiếu thu</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openPaymentModal}>Phiếu chi</Button>
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
          {summary.total_payment !== 0 ? (
            <div className="font-bold text-lg text-red-500">-{summary.total_payment?.toLocaleString()}</div>
          ) : (
            <div className="font-bold text-lg text-red-500">{summary.total_payment?.toLocaleString()}</div>
          )}
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
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
          pageSizeOptions: ['5', '10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        rowKey="transaction_code"
        size="middle"
        expandable={{
          expandedRowRender: (record) => <CashBookExpandedTabs record={record} />,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.transaction_code] : []);
          },
        }}
        rowClassName={(record) =>
          expandedRowKeys.includes(record.transaction_code)
            ? "!border-collapse z-10 bg-blue-50 rounded-md shadow-sm"
            : "hover:bg-gray-50 transition-colors"
        }
        onRow={(record) => ({
          onClick: () => {
            setExpandedRowKeys(expandedRowKeys.includes(record.transaction_code) ? [] : [record.transaction_code]);
          },
          className: "cursor-pointer",
        })}
      />

      {/* Modal tạo giao dịch */}
      <DebtAdjustmentModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
        modalType={modalType}
      />
    </div>
  );
} 