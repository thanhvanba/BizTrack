import { Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import productReportService from "../../service/productReportService";

const columns = [
    {
        title: "Chứng từ",
        dataIndex: "chung_tu",
        key: "chung_tu",
    },
    {
        title: "Thời gian",
        dataIndex: "thoi_gian",
        key: "thoi_gian",
        render: (value) => dayjs(value).format("DD/MM/YYYY HH:mm"),
    },
    {
        title: "Loại giao dịch",
        dataIndex: "loai_giao_dich",
        key: "loai_giao_dich",
    },
    {
        title: "Đối tác",
        dataIndex: "doi_tac",
        key: "doi_tac",
    },
    {
        title: "Giá GD",
        dataIndex: "gia_gd",
        key: "gia_gd",
        render: (value) => Number(value).toLocaleString(),
    },
    {
        title: "Số lượng",
        dataIndex: "so_luong",
        key: "so_luong",
    },
    {
        title: "Khả dụng",
        dataIndex: "ton_cuoi",
        key: "ton_cuoi",
    },
];

const ProductWarehouseTab = ({ productId, warehouseId }) => {
    console.log("🚀 ~ ProductWarehouseTab ~ productId:", productId)
    console.log("🚀 ~ ProductWarehouseTab ~ warehouseId:", warehouseId)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await productReportService.getProductHistoryByProductAndWarehouse(
                productId,
                warehouseId
            );
            setData(res.data || []);
        } catch (err) {
            console.error("Error fetching product history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId && warehouseId) {
            fetchHistory();
        }
    }, [productId, warehouseId]);

    return (
        <div className="relative">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="chung_tu"
                size="small"
                loading={loading}
                pagination={false}
            />
        </div>
    );
};

export default ProductWarehouseTab;
