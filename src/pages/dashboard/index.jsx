import { Row, Col, Card, Table, Badge, Avatar } from "antd"
import {
    DollarOutlined,
    UserOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
    ArrowUpOutlined,
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Dashboard = () => {
    // Chart data
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

    // Recent orders data
    const recentOrdersColumns = [
        {
            title: "Mã đơn hàng",
            dataIndex: "id",
            key: "id",
            className: "text-gray-700",
        },
        {
            title: "Khách hàng",
            dataIndex: "customer",
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
                        {record.initials}
                    </Avatar>
                    <span className="ml-3 font-medium text-gray-800">{text}</span>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color, bgColor, textColor
                switch (status) {
                    case "Đã giao":
                        color = "green"
                        bgColor = "bg-green-100"
                        textColor = "text-green-800"
                        break
                    case "Đang giao":
                        color = "blue"
                        bgColor = "bg-blue-100"
                        textColor = "text-blue-800"
                        break
                    case "Đang xử lý":
                        color = "yellow"
                        bgColor = "bg-yellow-100"
                        textColor = "text-yellow-800"
                        break
                    case "Đã hủy":
                        color = "red"
                        bgColor = "bg-red-100"
                        textColor = "text-red-800"
                        break
                    default:
                        color = "gray"
                        bgColor = "bg-gray-100"
                        textColor = "text-gray-800"
                }
                return (
                    <div className={`flex items-center ${textColor}`}>
                        <Badge color={color} />
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>{status}</span>
                    </div>
                )
            },
        },
        {
            title: "Tổng tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right",
            className: "font-medium text-gray-800",
        },
    ]

    const recentOrdersData = [
        {
            key: "1",
            id: "ORD-001",
            customer: "Nguyễn Văn A",
            initials: "NA",
            status: "Đã giao",
            amount: "2.500.000 ₫",
        },
        {
            key: "2",
            id: "ORD-002",
            customer: "Trần Thị B",
            initials: "TB",
            status: "Đang giao",
            amount: "1.800.000 ₫",
        },
        {
            key: "3",
            id: "ORD-003",
            customer: "Lê Văn C",
            initials: "LC",
            status: "Đang xử lý",
            amount: "3.200.000 ₫",
        },
        {
            key: "4",
            id: "ORD-004",
            customer: "Phạm Thị D",
            initials: "PD",
            status: "Đã giao",
            amount: "950.000 ₫",
        },
        {
            key: "5",
            id: "ORD-005",
            customer: "Hoàng Văn E",
            initials: "HE",
            status: "Đã hủy",
            amount: "1.500.000 ₫",
        },
    ]

    return (
        <div>
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
                                <p className="text-2xl font-bold text-gray-800">152.000.000 ₫</p>
                                <div className="flex items-center text-xs text-green-600 mt-2">
                                    <ArrowUpOutlined />
                                    <span className="ml-1">20.1% so với tháng trước</span>
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
                                <p className="text-2xl font-bold text-gray-800">1,245</p>
                                <div className="flex items-center text-xs text-blue-600 mt-2">
                                    <span>+180 khách hàng mới</span>
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
                                <p className="text-2xl font-bold text-gray-800">342</p>
                                <div className="flex items-center text-xs text-purple-600 mt-2">
                                    <span>+24 sản phẩm mới</span>
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
                                <p className="text-2xl font-bold text-gray-800">573</p>
                                <div className="flex items-center text-xs text-orange-600 mt-2">
                                    <span>+201 đơn hàng mới</span>
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
                        <div style={{ height: "280px" }}>
                            <Line data={revenueData} options={chartOptions} />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="text-gray-800 font-bold">Đơn hàng gần đây</span>}
                        extra={
                            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
                                Xem tất cả
                            </a>
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
                            dataSource={recentOrdersData}
                            pagination={false}
                            size="middle"
                            className="custom-table"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
