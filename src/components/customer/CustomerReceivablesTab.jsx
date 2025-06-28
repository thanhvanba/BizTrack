import { Button, Table } from "antd";
import DebtAdjustmentModal from "../supplier/DebtAdjustment";
import PaymentModal from "../modals/PaymentModal";
import { useEffect, useState } from "react";
import customerService from "../../service/customerService";
import formatPrice from "../../utils/formatPrice";

const columns = [
    { title: "Mã giao dịch", dataIndex: "ma_giao_dich", key: "ma_giao_dich" },
    {
        title: "Ngày giao dịch", dataIndex: "ngay_giao_dich", key: "ngay_giao_dich",
        render: (val) => {
            return new Date(val).toLocaleString("vi-VN")
        }
    },
    { title: "Loại", dataIndex: "loai", key: "loai" },
    {
        title: "Giá trị", dataIndex: "gia_tri", key: "gia_tri",
        render: (val) => `${formatPrice(val)}`
    },
    {
        title: "Dư nợ", dataIndex: "du_no", key: "du_no",
        render: (val) => `${formatPrice(val)}`
    },
];

const data = [
    { key: "1", transaction_code: "GT001", transaction_date: "04/06/2025", transaction_type: "Thanh toán", amount: 500000, balance: 0 },
    { key: "2", transaction_code: "GT002", transaction_date: "05/06/2025", transaction_type: "Hoàn tiền", amount: 750000, balance: 250000 },
];

const CustomerReceivablesTab = ({ customerData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [customerReceivables, setCustomerReceivables] = useState()
    const [customerTransactions, setCustomerTransactions] = useState()

    const handleRecordBulkPayment = async (invoiceData) => {
        await customerService.recordBulkPayment(invoiceData);
        fetchCustomerReceivables()
        fetchCustomerTransactions()
        setIsPaymentModalOpen(false);
    };
    const fetchCustomerReceivables = async () => {
        const res = await customerService.getCustomerReceivables(customerData?.customer_id)
        if (res && res.data) {
            setCustomerReceivables(res.data)
        }
    }
    const fetchCustomerTransactions = async () => {
        const res = await customerService.getCustomerTransactionLedger(customerData?.customer_id)
        if (res && res.data) {
            setCustomerTransactions(res.data)
        }
    }
    useEffect(() => {
        fetchCustomerReceivables()
        fetchCustomerTransactions()
    }, [])
    return (
        <div>
            <Table columns={columns} dataSource={customerTransactions} pagination={false} size="small" />
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
            {/* <DebtAdjustmentModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                initialDebt={20000000}
                onSubmit={(values) => {
                    console.log("Dữ liệu điều chỉnh:", values);
                    setIsModalOpen(false);
                }}
            /> */}
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
