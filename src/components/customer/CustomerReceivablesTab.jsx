import { Button, Table } from "antd";

const columns = [
    { title: "Mã giao dịch", dataIndex: "transaction_code", key: "transaction_code" },
    { title: "Ngày giao dịch", dataIndex: "transaction_date", key: "transaction_date" },
    { title: "Loại", dataIndex: "transaction_type", key: "transaction_type" },
    { title: "Giá trị", dataIndex: "amount", key: "amount", render: (val) => `${val.toLocaleString()}₫` },
    { title: "Dư nợ", dataIndex: "balance", key: "balance", render: (val) => `${val.toLocaleString()}₫` },
];

const data = [
    { key: "1", transaction_code: "GT001", transaction_date: "04/06/2025", transaction_type: "Thanh toán", amount: 500000, balance: 0 },
    { key: "2", transaction_code: "GT002", transaction_date: "05/06/2025", transaction_type: "Hoàn tiền", amount: 750000, balance: 250000 },
];

const CustomerReceivablesTab = () => {
    return (
        <div>
            <Table columns={columns} dataSource={data} pagination={false} size="small" />
            <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                    <Button type="primary" icon={<span>📥</span>}>
                        Xuất file
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button type="primary" icon={<span>✏️</span>}>
                        Điều chỉnh
                    </Button>
                    <Button icon={<span>💳</span>}>
                        Thanh toán
                    </Button>
                    <Button icon={<span>🖨️</span>}>
                        Tạo QR
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CustomerReceivablesTab;
