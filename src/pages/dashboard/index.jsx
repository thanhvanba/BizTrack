import { Row, Col, Card, Table, Badge, Avatar } from "antd"
import {
    DollarOutlined,
    UserOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import analysisService from "../../service/analysisService"
import { useEffect, useState } from "react"
import customerService from "../../service/customerService"
import productService from "../../service/productService"
import orderService from "../../service/orderService"
import formatPrice from '../../utils/formatPrice'
import { useNavigate } from "react-router-dom"
import dayjs from "dayjs"
import RecentActivities from "./RecentActivities"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Dashboard = () => {
    const [analysisData, setAnalysisData] = useState({
        revenue: null,
        totalCustomer: 0,
        totalProduct: 0,
        orderData: [],
        revenueMoM: 0,
        totalCustomersThisMonth: 0,
        totalProductsThisMonth: 0,
        totalOrdersThisMonth: 0,
    });
    console.log("🚀 ~ Dashboard ~ analysisData:", analysisData)
    const navigate = useNavigate()
    const handleGetAnalysisData = async () => {
        try {
            const currentMonth = dayjs().month() + 1;
            const currentYear = dayjs().year();
            const currentMonthFormatted = dayjs().format('YYYY-MM');

            const previousMonth = dayjs().subtract(1, 'month').month() + 1;
            const previousMonthFormatted = dayjs().subtract(1, 'month').format('YYYY-MM');

            const [resCurrentRevenue, resPreviousRevenue, resRevenue, resCustomer, resCustomersByMonth, resProduct, resProductsByMonth, resOrdersByMonth, resOrder] = await Promise.all([
                analysisService.getRevenueByTimePeriod({ startDate: currentMonthFormatted, period: 'month' }),
                analysisService.getRevenueByTimePeriod({ startDate: previousMonthFormatted, period: 'month' }),
                analysisService.getRevenueByTimePeriod(),
                customerService.getAllCustomers(),
                customerService.getAllCustomers({ year: currentYear, month: currentMonth }),
                productService.getAllProducts(),
                productService.getAllProducts({ year: currentYear, month: currentMonth }),
                orderService.getAllOrder({ year: currentYear, month: currentMonth }),
                orderService.getAllOrder({ page: 1, limit: 6 }),
            ]);

            const formatCustomerInitials = (data) => {
                return data.map((order) => {
                    const name = order.customer?.customer_name || "";
                    const nameParts = name.trim().split(" ");
                    const initials = nameParts.length >= 2
                        ? nameParts[0][0].toUpperCase() + nameParts[nameParts.length - 1][0].toUpperCase()
                        : nameParts[0]?.[0]?.toUpperCase() || "";
                    return {
                        ...order,
                        customer: {
                            ...order.customer,
                            initials,
                        },
                    };
                });
            };

            setAnalysisData({
                revenue: resRevenue?.data[0],
                totalCustomer: resCustomer?.pagination?.total || 0,
                totalProduct: resProduct?.pagination?.total || 0,
                orderData: {
                    ...resOrder,
                    data: formatCustomerInitials(resOrder.data),
                },
                revenueMoM: ((resCurrentRevenue[0]?.total_revenue - resPreviousRevenue[0]?.total_revenue) / resPreviousRevenue[0]?.total_revenue) * 100,
                totalCustomersThisMonth: resCustomersByMonth?.pagination?.total || 0,
                totalProductsThisMonth: resProductsByMonth?.pagination?.total || 0,
                totalOrdersThisMonth: resOrdersByMonth?.pagination?.total || 0,
            });

        } catch (error) {
            console.error("❌ Lỗi khi lấy dữ liệu phân tích:", error);
        }
    };


    useEffect(() => {
        handleGetAnalysisData()
    }, [])

    const revenueData = {
        labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
        datasets: [
            {
                label: "Doanh thu (triệu đồng)",
                data: [65, 78, 90, 81, 106, 152],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                tension: 0.4,
                borderWidth: 3,
                fill: true,
            },
            {
                label: "Chi phí (triệu đồng)",
                data: [45, 50, 55, 48, 62, 95],
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                tension: 0.4,
                borderWidth: 3,
                fill: true,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    pointStyle: "circle",
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: "white",
                titleColor: "#1f2937",
                bodyColor: "#374151",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 14,
                    weight: "bold",
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                },
                callbacks: {
                    labelPointStyle: () => ({
                        pointStyle: "circle",
                        rotation: 0,
                    }),
                },
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                    },
                    color: "#6b7280",
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                    },
                    color: "#6b7280",
                },
            },
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2,
                backgroundColor: "white",
            },
            line: {
                borderWidth: 3,
            },
        },
    }

    const recentOrdersColumns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "order_code",
            key: "order_code",
            className: "text-gray-700",
        },
        {
            title: "Khách hàng",
            dataIndex: ["customer", "customer_name"],
            key: "customer",
            render: (text, record) => (
                <div className="flex items-center">
                    <Avatar
                        className="flex items-center justify-center shadow-sm"
                        style={{
                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            fontWeight: "600",
                        }}
                    >
                        {record.customer?.initials || ""}
                    </Avatar>
                    <span className="ml-3 font-medium text-gray-800">{text}</span>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "order_status",
            key: "order_status",
            render: (status) => {
                let color, bgColor, textColor;
                switch (status) {
                    case "Mới":
                        color = "blue";
                        bgColor = "bg-blue-100";
                        textColor = "text-blue-800";
                        break;
                    case "Xác nhận":
                        color = "cyan";
                        bgColor = "bg-cyan-100";
                        textColor = "text-cyan-800";
                        break;
                    case "Đang đóng hàng":
                        color = "orange";
                        bgColor = "bg-orange-100";
                        textColor = "text-orange-800";
                        break;
                    case "Đang giao":
                        color = "purple";
                        bgColor = "bg-purple-100";
                        textColor = "text-purple-800";
                        break;
                    case "Hoàn tất":
                        color = "green";
                        bgColor = "bg-green-100";
                        textColor = "text-green-800";
                        break;
                    case "Huỷ đơn":
                    case "Huỷ điều chỉnh":
                        color = "red";
                        bgColor = "bg-red-100";
                        textColor = "text-red-800";
                        break;
                    default:
                        color = "gray";
                        bgColor = "bg-gray-100";
                        textColor = "text-gray-800";
                }
                return (
                    <div className={`flex items-center ${textColor}`}>
                        <Badge color={color} />
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                            {status}
                        </span>
                    </div>
                );
            }
        },
        {
            title: "Tổng tiền",
            dataIndex: "final_amount",
            key: "final_amount",
            align: "right",
            className: "font-medium text-gray-800",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(parseFloat(value))
        },
    ];

    const {
        revenue,
        totalCustomer,
        totalProduct,
        orderData,
        totalCustomersThisMonth,
        totalProductsThisMonth,
        totalOrdersThisMonth,
        revenueMoM,
    } = analysisData;
    return (
        <div className="grid grid-cols-5 gap-4">
            <div className="col-span-12 lg:col-span-4">
                {/* <h1 className="text-2xl font-bold mb-6 text-gray-800 absolute z-20 top-6 left-4">Tổng quan</h1> */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            bodyStyle={{ padding: "24px" }}
                        >
                            <div className="flex items-start">
                                <div className="mr-4 p-3 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md">
                                    <DollarOutlined className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Doanh thu</p>
                                    <p className="text-2xl font-bold text-gray-800">{formatPrice(revenue?.actual_revenue) || 0}</p>
                                    <div className={`flex items-center text-xs ${revenueMoM > 0 ? 'text-green-600' : 'text-red-600'} mt-2`}>
                                        {revenueMoM > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                        <span className="ml-1">{Math.round(revenueMoM * 10) / 10}% so với tháng trước</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            bodyStyle={{ padding: "24px" }}
                        >
                            <div className="flex items-start">
                                <div className="mr-4 p-3 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                                    <UserOutlined className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalCustomer}</p>
                                    <div className="flex items-center text-xs text-blue-600 mt-2">
                                        <span>+{totalCustomersThisMonth} khách hàng mới</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            bodyStyle={{ padding: "24px" }}
                        >
                            <div className="flex items-start">
                                <div className="mr-4 p-3 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md">
                                    <ShoppingOutlined className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Sản phẩm</p>
                                    <p className="text-2xl font-bold text-gray-800">{totalProduct}</p>
                                    <div className="flex items-center text-xs text-purple-600 mt-2">
                                        <span>+{totalProductsThisMonth} sản phẩm mới</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            bodyStyle={{ padding: "24px" }}
                        >
                            <div className="flex items-start">
                                <div className="mr-4 p-3 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md">
                                    <ShoppingCartOutlined className="text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Đơn hàng</p>
                                    <p className="text-2xl font-bold text-gray-800">{orderData?.pagination?.total || 0}</p>
                                    <div className="flex items-center text-xs text-orange-600 mt-2">
                                        <span>+{totalOrdersThisMonth} đơn hàng mới</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className="mt-6">
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-gray-800 font-bold">Doanh thu theo tháng</span>}
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            headStyle={{
                                borderBottom: "1px solid #f0f0f0",
                                padding: "16px 24px",
                            }}
                            bodyStyle={{ padding: "24px" }}
                        >
                            <div style={{ height: "340px" }}>
                                <Line data={revenueData} options={chartOptions} />
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-gray-800 font-bold">Đơn hàng gần đây</span>}
                            extra={
                                <div
                                    onClick={() => navigate('/orders')}
                                    className="text-blue-500 hover:text-blue-600 font-medium cursor-pointer"
                                >
                                    Xem tất cả
                                </div>
                            }
                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                            headStyle={{
                                borderBottom: "1px solid #f0f0f0",
                                padding: "16px 24px",
                            }}
                            bodyStyle={{ padding: "0" }}
                        >
                            <Table
                                columns={recentOrdersColumns}
                                dataSource={orderData?.data}
                                pagination={false}
                                size="middle"
                                className="custom-table"
                                scroll={{ x: "max-content" }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="col-span-12 lg:col-span-1 hidden lg:block h-full">
                <RecentActivities warning="Có 1 hoạt động đăng nhập khác thường cần kiểm tra." />
            </div>
        </div>
    )
}

export default Dashboard
