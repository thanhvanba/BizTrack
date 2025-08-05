import { Card, List, Typography, Button } from "antd";
import { UndoOutlined, ShoppingCartOutlined, ExclamationCircleOutlined, HistoryOutlined, DollarOutlined, FileTextOutlined, UserOutlined, ShoppingOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import cashbookService from "../../service/cashbookService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import LoadingLogo from "../../components/LoadingLogo";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

const activityIcon = (transactionType) => {
    switch (transactionType) {
        case "customer_return":
            return <UndoOutlined className="text-blue-500 text-xl" />;
        case "supplier_return":
            return <UndoOutlined className="text-orange-500 text-xl" />;
        case "order_created":
        case "receipt":
            return <ShoppingCartOutlined className="text-green-500 text-xl" />;
        case "payment":
            return <DollarOutlined className="text-red-500 text-xl" />;
        case "invoice_issued":
            return <FileTextOutlined className="text-purple-500 text-xl" />;
        case "purchase_order_created":
            return <ShoppingOutlined className="text-cyan-500 text-xl" />;
        case "refund":
            return <UserOutlined className="text-indigo-500 text-xl" />;
        default:
            return <ExclamationCircleOutlined className="text-yellow-500 text-xl" />;
    }
};

// const getActivityDescription = (transaction) => {
//     const { transaction_type, customer_name, supplier_name, amount, notification } = transaction;

//     switch (transaction_type) {
//         case "customer_return":
//             return `${customer_name || "Khách hàng"} vừa nhận trả hàng với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "supplier_return":
//             return `Trả hàng cho ${supplier_name || "nhà cung cấp"} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "order_created":
//             return `${customer_name || "Khách hàng"} vừa tạo đơn hàng với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "receipt":
//             return `${customer_name || "Khách hàng"} vừa thanh toán với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "payment":
//             return `Thanh toán cho ${supplier_name || "nhà cung cấp"} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "invoice_issued":
//             if (customer_name) {
//                 return `Phát hành hóa đơn cho ${customer_name} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//             } else {
//                 return `Phát hành hóa đơn từ ${supplier_name || "nhà cung cấp"} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//             }
//         case "purchase_order_created":
//             return `Tạo đơn hàng mua từ ${supplier_name || "nhà cung cấp"} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         case "refund":
//             return `Hoàn tiền cho ${customer_name || "khách hàng"} với giá trị ${amount?.toLocaleString('vi-VN')}`;
//         default:
//             return notification || "Hoạt động mới";
//     }
// };

const getActivityType = (transactionType) => {
    switch (transactionType) {
        case "customer_return":
        case "supplier_return":
            return "return";
        case "order_created":
        case "receipt":
        case "invoice_issued":
        case "purchase_order_created":
            return "sale";
        case "payment":
        case "refund":
            return "payment";
        default:
            return "other";
    }
};

export default function RecentActivities({ warning }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchRecentActivities = async (page = 1, append = false) => {
        try {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await cashbookService.getSystemTransactionLedger({
                page,
                limit: 10
            });

            if (response?.data) {
                const formattedActivities = response.data.map(transaction => ({
                    id: transaction.transaction_code,
                    type: getActivityType(transaction.transaction_type),
                    user: transaction.customer_name || transaction.supplier_name || "Hệ thống",
                    value: transaction.amount,
                    time: dayjs(transaction.created_at).fromNow(),
                    desc: transaction.notification,
                    transaction_type: transaction.transaction_type,
                    status: transaction.status,
                    notification: transaction.notification
                }));

                if (append) {
                    setActivities(prev => [...prev, ...formattedActivities]);
                } else {
                    setActivities(formattedActivities);
                }

                // Kiểm tra xem còn trang tiếp theo không
                const pagination = response?.pagination || response?.data?.pagination;
                setHasMore(pagination?.has_next || pagination?.currentPage < pagination?.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy hoạt động gần đây:", error);
            if (!append) {
                setActivities([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchRecentActivities(currentPage + 1, true);
        }
    };

    useEffect(() => {
        fetchRecentActivities();
    }, []);

    return (
        <Card
            title={
                <span className="flex items-center gap-2 text-lg font-semibold">
                    Hoạt động gần đây
                    <HistoryOutlined className="text-gray-500" />
                </span>
            }
            className="shadow-md rounded-xl h-full"
            bodyStyle={{ padding: 0 }}
        >
            {/* {warning && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border-b border-yellow-200">
                    <ExclamationCircleOutlined className="text-yellow-500 text-lg" />
                    <span className="text-yellow-700 font-medium">{warning}</span>
                </div>
            )} */}
            <div className="max-h-[524px] overflow-y-auto px-2">
                <List
                    itemLayout="horizontal"
                    dataSource={activities}
                    loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
                    renderItem={item => (
                        <List.Item className="py-3 !px-2 border-b last:border-b-0">
                            <List.Item.Meta
                                avatar={
                                    <span className={`flex items-center justify-center w-9 h-9 rounded-full ${item.type === "sale" ? "bg-green-50" :
                                        item.type === "return" ? "bg-blue-50" :
                                            item.type === "payment" ? "bg-red-50" : "bg-gray-50"
                                        }`}>
                                        {activityIcon(item.transaction_type)}
                                    </span>
                                }
                                title={
                                    <span>
                                        <span className="font-semibold text-gray-800">{item.user}</span>{" "}
                                        <span className="text-blue-600">{item.desc}</span>
                                    </span>
                                }
                                description={
                                    <div className="flex justify-end gap-2">
                                        <span className="text-xs text-gray-400">{item.time}</span>
                                        {/* {item.status && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" || item.status === "paid" || item.status === "Hoàn tất"
                                                ? "bg-green-100 text-green-700"
                                                : item.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {item.status}
                                            </span>
                                        )} */}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />

                {/* Nút Xem thêm */}
                {hasMore && !loading && (
                    <div className="text-center cursor-pointer py-3">
                        <div
                            loading={loadingMore}
                            onClick={handleLoadMore}
                            className="hover:bg-slate-100 flex justify-center items-center gap-1 py-2"
                        >
                            <div className="bg-slate-200 rounded-full w-8 h-8 flex justify-center items-center">
                                <DownOutlined />
                            </div>{loadingMore ? "Đang tải..." : "Xem thêm "}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}