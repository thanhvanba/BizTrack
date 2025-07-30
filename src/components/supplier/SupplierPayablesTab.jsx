import { useState, useEffect } from "react";
import { Button, Table, Modal } from "antd";
import PaymentModal from "../modals/PaymentModal";
import DebtAdjustmentModal from "../modals/DebtAdjustment";
import customerService from "../../service/customerService";
import supplierService from "../../service/supplierService";
import formatPrice from "../../utils/formatPrice";
import LoadingLogo from '../LoadingLogo';
import useToastNotify from "../../utils/useToastNotify";

const statusMap = {
    pending: 'Tạo đơn hàng',
    partial_paid: 'Thanh toán một phần',
    payment: 'Thanh toán đơn nhập',
    completed: 'Hoàn tất',
    cancelled: 'Hủy bỏ',
    return: 'Trả hàng',
    receipt: 'Trả hàng'
};

const columns = [
    { title: "Mã giao dịch", dataIndex: "transaction_code", key: "transaction_code" },
    {
        title: "Ngày giao dịch", dataIndex: "transaction_date", key: "transaction_date",
        render: (val) => {
            return new Date(val).toLocaleString("vi-VN")
        }
    },
    {
        title: "Loại", dataIndex: "type", key: "type",
        render: (value) => statusMap[value] || value,
    },
    {
        title: "Giá trị", dataIndex: "amount", key: "amount", align: "right",
        render: (val, record) => {
            const isNegative = ["partial_paid", "payment", "receipt", "return"].includes(record.type);
            return `${isNegative ? "-" : ""}${formatPrice(val)}`;
        },
    },
    {
        title: "Dư nợ", dataIndex: "balance", key: "balance", align: "right",
        render: (val) => `${formatPrice(val)}`
    },
];

const SupplierPayablesTab = ({ supplierData, fetchSuppliers }) => {
    console.log("🚀 ~ SupplierPayablesTab ~ supplierData:", supplierData)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [supplierPayables, setSupplierPayables] = useState()
    console.log("🚀 ~ SupplierPayablesTab ~ supplierPayables:", supplierPayables)
    const [supplierTransactions, setSupplierTransactions] = useState()

    const handleRecordBulkPayment = async (invoiceData) => {
        try {
            await customerService.recordBulkPayment(invoiceData);
            useToastNotify("Thanh toán thành công", "success");
            fetchSupplierPayables()
            fetchSupplierTransactions()
            fetchSuppliers()
            setIsPaymentModalOpen(false);
        } catch (error) {
            useToastNotify("Thanh toán thất bại", "error");
        }
    };

    const handleDebtAdjustment = async (values) => {
        try {
            // values: { adjustmentValue, type, description, paymentMethod, category }
            const body = {
                amount: Number(values.adjustmentValue),
                type: values.type || 'payment',
                category: values.category || 'supplier_refund',
                payment_method: values.paymentMethod || 'cash',
                supplier_id: supplierData?.supplier_id,
                description: values.description || '',
            };
            await supplierService.createSupplierTransaction(supplierData?.supplier_id, body);
            useToastNotify("Điều chỉnh công nợ thành công", "success");
            fetchSupplierPayables();
            fetchSupplierTransactions();
            fetchSuppliers();
            setIsModalOpen(false);
        } catch (error) {
            useToastNotify("Điều chỉnh công nợ thất bại", "error");
        }
    };

    // Danh sách các đơn hàng chưa thanh toán
    const fetchSupplierPayables = async () => {
        try {
            const res = await supplierService.getSupplierPayable(supplierData?.supplier_id)
            console.log("🚀 ~ fetchSupplierPayables ~ res:", res)
            if (res && res.data) {
                // Map dữ liệu để phù hợp với PaymentModal
                const mappedData = {
                    ...res.data,
                    unpaid_invoices: res.data.unpaid_invoices?.map(invoice => ({
                        invoice_id: invoice.invoice_id || invoice.order_id,
                        invoice_code: invoice.invoice_code || invoice.order_code,
                        issued_date: invoice.issued_date || invoice.created_at,
                        final_amount: invoice.final_amount || invoice.total_amount,
                        amount_paid: invoice.amount_paid || 0,
                        remaining_receivable: invoice.remaining_receivable || (invoice.final_amount - (invoice.amount_paid || 0))
                    })) || []
                };
                setSupplierPayables(mappedData)
                console.log("🚀 ~ mapped supplierPayables:", mappedData)
                console.log("🚀 ~ mapped unpaid_invoices:", mappedData.unpaid_invoices)
            }
        } catch (error) {
            console.error("Lỗi fetchSupplierPayables:", error)
            useToastNotify("Không thể tải dữ liệu công nợ", "error");
        }
    }

    // Danh sách các giao dịch liên quan đến nhà cung cấp
    const fetchSupplierTransactions = async () => {
        setLoading(true)
        try {
            const res = await supplierService.getSupplierTransactionLedger(supplierData?.supplier_id)
            if (res && res.data) {
                setSupplierTransactions(res.data)
            }
        } catch (error) {
            useToastNotify("Không thể tải dữ liệu giao dịch", "error");
        }
        setLoading(false)
    }

    useEffect(() => {
        if (supplierData?.supplier_id) {
            fetchSupplierPayables()
            fetchSupplierTransactions()
        }
    }, [supplierData?.supplier_id])

    return (
        <div>
            <Table
                loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
                columns={columns}
                dataSource={supplierTransactions}
                pagination={false}
                size="small"
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
                initialDebt={supplierData?.total_remaining_value}
                onSubmit={handleDebtAdjustment}
            />
            <PaymentModal
                open={isPaymentModalOpen}
                onCancel={() => setIsPaymentModalOpen(false)}
                unpaidInvoice={supplierPayables?.unpaid_invoices}
                initialDebt={supplierPayables?.total_payable}
                customerName={supplierData?.supplier_name}
                onSubmit={handleRecordBulkPayment}
            />
        </div>
    );
};

export default SupplierPayablesTab;
