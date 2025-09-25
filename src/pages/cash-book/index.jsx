import { useEffect, useState } from 'react';
import { Table, Input, Button, Typography, message } from 'antd';
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
    responsive: ['sm'],
    render: (value) => value ? new Date(value).toLocaleString('vi-VN') : '',
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    render: (type) => {
      if (type === 'payment' || type === 'adj_increase') return <span className="text-red-500 font-medium">Chi</span>;
      if (type === 'receipt' || type === 'adj_decrease') return <span className="text-green-600 font-medium">Thu</span>;
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
  // {
  //   title: 'Phương thức',
  //   dataIndex: 'payment_method',
  //   key: 'payment_method',
  //   width: 120,
  //   responsive: ['sm'],
  // },
  {
    title: 'Số tiền',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    width: 120,
    render: (value, record) => {
      const num = Number(value);
      return (
        <span style={{ color: record.type === 'payment' || record.type === 'adj_increase' ? 'red' : 'green', fontWeight: 500 }}>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('receipt'); // 'receipt' hoặc 'payment'
  const [editingTransaction, setEditingTransaction] = useState(null);
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
      category: values.category,
      payment_method: values.paymentMethod || 'cash',
      description: values.description || '',
    };

    await cashbookService.createTransaction(body);
    // Reload data
    fetchData(pagination.current, pagination.pageSize);
    setIsModalOpen(false);
  };

  const handleEditTransaction = async (transaction) => {
    try {
      const id = transaction?.transaction_id || transaction?.id;
      let detail = null;
      if (id) {
        const res = await cashbookService.getTransactionById(id);
        // API có thể trả về ở res.data hoặc res
        detail = res?.data || res;
      }

      const recordToEdit = detail || transaction;
      setEditingTransaction(recordToEdit);
      setModalType(recordToEdit.type);
      setIsModalOpen(true);
    } catch (error) {
      message.error('Không lấy được thông tin giao dịch.');
    }
  };

  const handleUpdateTransaction = async (values) => {
    if (!editingTransaction) return;

    const body = {
      amount: Number(values.adjustmentValue),
      type: modalType,
      category: values.category,
      payment_method: values.paymentMethod || 'cash',
      description: values.description || '',
    };

    try {
      await cashbookService.updateTransaction(editingTransaction.transaction_id, body);
      message.success('Cập nhật giao dịch thành công!');
      fetchData(pagination.current, pagination.pageSize);
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      message.error('Cập nhật giao dịch thất bại!');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await cashbookService.deleteTransaction(transactionId);
      message.success('Xóa giao dịch thành công!');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error('Xóa giao dịch thất bại!');
    }
  };

  const openReceiptModal = () => {
    setEditingTransaction(null);
    setModalType('receipt');
    setIsModalOpen(true);
  };

  const openPaymentModal = () => {
    setEditingTransaction(null);
    setModalType('payment');
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-2 sm:p-4 bg-white rounded-lg shadow">
      {/* Thanh công cụ */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
        <div className="w-full lg:w-auto">
          <Search 
            placeholder="Theo mã phiếu" 
            className="w-full lg:w-80" 
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={openReceiptModal}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Phiếu thu</span>
            <span className="sm:hidden">Thu</span>
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={openPaymentModal}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Phiếu chi</span>
            <span className="sm:hidden">Chi</span>
          </Button>
          <Button 
            icon={<FileExcelOutlined />}
            className="hidden sm:inline-flex"
          >
            Xuất file
          </Button>
        </div>
      </div>
      {/* Thống kê */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-4 sm:gap-8 mb-4">
        <div className="flex justify-between sm:block">
          <div className="text-xs text-gray-500">Tổng thu</div>
          <div className="font-bold text-base sm:text-lg text-green-500">{summary.total_receipt?.toLocaleString()}</div>
        </div>
        <div className="flex justify-between sm:block">
          <div className="text-xs text-gray-500">Tổng chi</div>
          {summary.total_payment !== 0 ? (
            <div className="font-bold text-base sm:text-lg text-red-500">-{summary.total_payment?.toLocaleString()}</div>
          ) : (
            <div className="font-bold text-base sm:text-lg text-red-500">{summary.total_payment?.toLocaleString()}</div>
          )}
        </div>
        <div className="flex justify-between sm:block">
          <div className="text-xs text-gray-500">Tồn quỹ</div>
          <div className="font-bold text-base sm:text-lg text-blue-600">{summary.balance?.toLocaleString()}</div>
        </div>
      </div>
      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
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
            responsive: true,
            showQuickJumper: false,
          }}
          onChange={handleTableChange}
          rowKey="transaction_code"
          size="middle"
          scroll={{ x: 800 }}
          expandable={{
            expandedRowRender: (record) => (
              <CashBookExpandedTabs 
                record={record} 
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onRefresh={() => fetchData(pagination.current, pagination.pageSize)}
              />
            ),
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
      </div>

      {/* Modal tạo/sửa giao dịch */}
      <DebtAdjustmentModal
        open={isModalOpen}
        onCancel={handleModalCancel}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        modalType={modalType}
        context="cash-book"
        initialValues={editingTransaction ? {
          adjustmentValue: editingTransaction.amount,
          category: editingTransaction.category,
          paymentMethod: editingTransaction.payment_method,
          description: editingTransaction.description,
        } : undefined}
        title={editingTransaction ? 'Chỉnh sửa giao dịch' : undefined}
      />
    </div>
  );
} 