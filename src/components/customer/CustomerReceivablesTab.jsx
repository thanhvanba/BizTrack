import { Button, Table } from "antd";
import PaymentModal from "../modals/PaymentModal";
import { useEffect, useState } from "react";
import customerService from "../../service/customerService";
import formatPrice from "../../utils/formatPrice";
import DebtAdjustmentModal from "../modals/DebtAdjustment";
import LoadingLogo from '../LoadingLogo';
import cashbookService from '../../service/cashbookService';

const statusMap = {
    pending: 'Tạo đơn hàng',
    partial_paid: 'Thanh toán một phần',
    payment: 'Điều chỉnh',
    completed: 'Hoàn tất',
    cancelled: 'Hủy bỏ',
    return: 'Trả hàng',
    receipt: 'Thanh toán đơn hàng'
};

const columns = [
    { title: "Mã giao dịch", dataIndex: "ma_giao_dich", key: "ma_giao_dich" },
    {
        title: "Ngày giao dịch", dataIndex: "ngay_giao_dich", key: "ngay_giao_dich",
        render: (val) => {
            return new Date(val).toLocaleString("vi-VN")
        }
    },
    {
        title: "Loại", dataIndex: "loai", key: "loai",
        render: (value) => statusMap[value] || value,
    },
    {
        title: "Giá trị", dataIndex: "gia_tri", key: "gia_tri", align: "right",
        render: (val, record) => {
            const isNegative = ["partial_paid", "return", "receipt"].includes(record.loai);
            return `${isNegative ? "-" : ""}${formatPrice(val)}`;
        },
    },
    {
        title: "Dư nợ", dataIndex: "du_no", key: "du_no", align: "right",
        render: (val) => `${formatPrice(val)}`
    },
];

const CustomerReceivablesTab = ({ customerData, fetchCustomers }) => {
    console.log("🚀 ~ CustomerReceivablesTab ~ customerData:", customerData)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [customerReceivables, setCustomerReceivables] = useState()
    const [customerTransactions, setCustomerTransactions] = useState()
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    })
    const handleRecordBulkPayment = async (invoiceData) => {
        await customerService.recordBulkPayment(invoiceData);
        fetchCustomerReceivables()
        fetchCustomerTransactions()
        fetchCustomers()
        setIsPaymentModalOpen(false);
    };

    const handleDebtAdjustment = async (values) => {
        // values: { adjustmentValue, type, description, paymentMethod, category }
        const body = {
            amount: Number(values.adjustmentValue),
            type: values.type || 'payment',
            // category: values.category || 'customer_refund',
            payment_method: values.paymentMethod || 'cash',
            customer_id: customerData?.customer_id,
            description: values.description || '',
        };
        console.log("🚀 ~ handleDebtAdjustment ~ body:", body)
        await cashbookService.createTransaction(body);
        fetchCustomerReceivables();
        fetchCustomerTransactions();
        fetchCustomers();
        setIsModalOpen(false);
    };

    // Danh sách các đơn hàng chưa thanh toán
    const fetchCustomerReceivables = async () => {
        const res = await customerService.getCustomerReceivables(customerData?.customer_id)
        if (res && res.data) {
            setCustomerReceivables(res.data)
        }
    }

    // Danh sách các giao dịch liên quan đến khách hàng
    const fetchCustomerTransactions = async (page = pagination.current, limit = pagination.pageSize) => {
        setLoading(true)
        const res = await customerService.getCustomerTransactionLedger(
            customerData?.customer_id,
            { page, limit }
        )
        if (res.pagination) {
            setPagination({
                current: res.pagination.currentPage,
                pageSize: res.pagination.pageSize,
                total: res.pagination.total,
            });
        }
        if (res && res.data) {
            setCustomerTransactions(res.data)
        }

        setLoading(false)
    }
    const handleTableChange = (paginationInfo) => {
        const { current, pageSize } = paginationInfo;
        fetchCustomerTransactions(current, pageSize);
    };
    useEffect(() => {
        fetchCustomerReceivables()
        fetchCustomerTransactions()
    }, [])
    return (
        <div>
            <Table
                loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
                columns={columns}
                dataSource={customerTransactions}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                size="small"
                onChange={handleTableChange}
            />
            <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                    <Button type="primary" icon={<span>📥</span>}>
                        Xuất file
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button type="primary" icon={<span>✏️</span>} onClick={() => setIsModalOpen(true)}>
                        Điều chỉnh
                    </Button>
                    <Button icon={<span>💳</span>} onClick={() => setIsPaymentModalOpen(true)}>
                        Thanh toán
                    </Button>
                </div>
            </div>
            <DebtAdjustmentModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                initialDebt={customerData?.total_remaining_value}
                onSubmit={handleDebtAdjustment}
                context="customer"
            />
            <PaymentModal
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                unpaidInvoice={customerReceivables?.unpaid_invoices}
                initialDebt={customerReceivables?.total_receivables}
                customerName={customerData?.customer_name}
                onSubmit={handleRecordBulkPayment}
            />
        </div>
    );
};

export default CustomerReceivablesTab;
