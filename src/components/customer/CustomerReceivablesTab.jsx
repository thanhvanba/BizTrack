import { Button, Table } from "antd";
import DebtAdjustmentModal from "../supplier/DebtAdjustment";
import PaymentModal from "../supplier/PaymentModal";
import { useEffect, useState } from "react";
import customerService from "../../service/customerService";
import formatPrice from "../../utils/formatPrice";

const columns = [
    { title: "Mã giao dịch", dataIndex: "invoice_code", key: "invoice_code" },
    {
        title: "Ngày giao dịch", dataIndex: "issued_date", key: "issued_date",
        render: (val) => {
            return new Date(val).toLocaleString("vi-VN")
        }
    },
    { title: "Loại", dataIndex: "status", key: "status" },
    {
        title: "Giá trị", dataIndex: "final_amount", key: "final_amount",
        render: (val) => `${formatPrice(val)}`
    },
    {
        title: "Dư nợ", dataIndex: "remaining_receivable", key: "remaining_receivable",
        render: (val) => `${formatPrice(val)}`
    },
];

const data = [
    { key: "1", transaction_code: "GT001", transaction_date: "04/06/2025", transaction_type: "Thanh toán", amount: 500000, balance: 0 },
    { key: "2", transaction_code: "GT002", transaction_date: "05/06/2025", transaction_type: "Hoàn tiền", amount: 750000, balance: 250000 },
];

const CustomerReceivablesTab = ({ customerId }) => {
    console.log("🚀 ~ CustomerReceivablesTab ~ customerId:", customerId)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [customerReceivables, setCustomerReceivables] = useState()
    console.log("🚀 ~ CustomerReceivablesTab ~ customerReceivables:", customerReceivables)

    useEffect(() => {
        const fetchCustomerReceivables = async () => {
            const res = await customerService.getCustomerReceivables(customerId)
            if (res && res.data) {
                setCustomerReceivables(res.data)
            }
        }

        fetchCustomerReceivables()
    }, [])
    return (
        <div>
            <Table columns={columns} dataSource={customerReceivables?.unpaid_invoices} pagination={false} size="small" />
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
                initialDebt={20000000}
                onSubmit={(values) => {
                    console.log("Dữ liệu điều chỉnh:", values);
                    setIsModalOpen(false);
                }}
            />
            <PaymentModal
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                initialDebt={10000000}
                onSubmit={(values) => {
                    console.log("Dữ liệu thanh toán:", values);
                    setIsPaymentModalOpen(false);
                }}
            />
        </div>
    );
};

export default CustomerReceivablesTab;
