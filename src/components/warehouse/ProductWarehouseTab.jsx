import { Table } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import productReportService from "../../service/productService";
import LoadingLogo from "../LoadingLogo";

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
        render: (value) => value || "-",
    },
    {
        title: "Giá GD",
        dataIndex: "gia_gd",
        key: "gia_gd",
        align: "right",
        render: (value) => Number(value).toLocaleString(),
    },
    {
        title: "Số lượng",
        dataIndex: "so_luong",
        key: "so_luong",
        align: "right",
    },
    {
        title: "Khả dụng",
        dataIndex: "ton_cuoi",
        key: "ton_cuoi",
        align: "right",
    },
];

const ProductWarehouseTab = ({ productId, warehouseId, reloadKey }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchHistory = async (page = 1, limit = pagination.pageSize) => {
        setLoading(true);
        try {
            const response = await productReportService.getProductHistoryByProductAndWarehouse(
                productId,
                warehouseId,
                { page, limit }
            );
            setData(response?.data || []);
            if (response?.pagination) {
                setPagination({
                    current: response.pagination.currentPage,
                    pageSize: response.pagination.pageSize,
                    total: response.pagination.total,
                });
            }
        } catch (err) {
            console.error("Error fetching product history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        fetchHistory(newPagination.current, newPagination.pageSize);
    };

    useEffect(() => {
        if (productId && warehouseId) {
            fetchHistory();
        }
    }, [productId, warehouseId, reloadKey]);

    return (
        <div className="relative">
            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record, index) => `${record.chung_tu || 'ct'}-${record.thoi_gian || 'tg'}-${index}`}
                size="small"
                loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ["5", "10", "20", "50"],
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
                }}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default ProductWarehouseTab;
