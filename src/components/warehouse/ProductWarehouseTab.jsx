import { Table } from "antd"

const warehouseTransactions = [
    {
        id: "PN000049",
        time: "06/06/2025 14:59",
        type: "Nhập hàng",
        partner: "Công ty Hoàng Gia",
        transactionPrice: 300000,
        costPrice: 300000,
        quantity: 10,
        inventory: 10,
    },
    {
        id: "HD000049",
        time: "05/06/2025 15:56",
        type: "Bán hàng",
        partner: "Anh Hoàng - Sài Gòn",
        transactionPrice: 235000,
        costPrice: 200000,
        quantity: -2,
        inventory: null,
    },
    {
        id: "PN000048",
        time: "05/06/2025 15:41",
        type: "Nhập hàng",
        partner: "Công ty Hoàng Gia",
        transactionPrice: 300000,
        costPrice: 200000,
        quantity: 1,
        inventory: null,
    },
    {
        id: "TH000002",
        time: "05/06/2025 15:36",
        type: "Trả hàng",
        partner: "Khách lẻ",
        transactionPrice: 0,
        costPrice: 100000,
        quantity: 1,
        inventory: null,
    },
    {
        id: "HD000048",
        time: "05/06/2025 15:32",
        type: "Bán hàng",
        partner: "Khách lẻ",
        transactionPrice: 0,
        costPrice: 100000,
        quantity: -1,
        inventory: null,
    },
]

const columns = [
    {
        title: "Chứng từ",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Thời gian",
        dataIndex: "time",
        key: "time",
    },
    {
        title: "Loại giao dịch",
        dataIndex: "type",
        key: "type",
    },
    {
        title: "Đối tác",
        dataIndex: "partner",
        key: "partner",
    },
    {
        title: "Giá GD",
        dataIndex: "transactionPrice",
        key: "transactionPrice",
        render: (value) => value.toLocaleString(),
    },
    {
        title: "Giá vốn",
        dataIndex: "costPrice",
        key: "costPrice",
        render: (value) => value.toLocaleString(),
    },
    {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
    },
    {
        title: "Khả dụng",
        dataIndex: "inventory",
        key: "inventory",
    },
]

const ProductWarehouseTab = () => {
    return (
        <div className="relative">
            <Table
                columns={columns}
                dataSource={warehouseTransactions}
                rowKey="id"
                size="small"
                pagination={false}
            />
        </div>

    )
}

export default ProductWarehouseTab
