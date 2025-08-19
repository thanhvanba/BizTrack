import React, { useEffect, useState } from "react";
import { Card, Radio, Checkbox, Select, DatePicker, Input, Row, Col } from "antd";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import analysisService from "../../service/analysisService";
import OptionsStatistics from "../../components/OptionsStatistics";
import dayjs from "dayjs";
import SalesReport from "../SalesReport";
import FinanceReport from "../FinanceReport";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;

const configMap = {
    product: {
        title: "Top sản phẩm doanh thu cao nhất (đã trừ trả hàng)",
        api: analysisService.getTopSelling,
        labelField: "product_name",
        valueField: "net_revenue",
        valueRevenueField: "total_revenue",
        valueRefundField: "total_refund",
        chartLabel: "Doanh thu (tr)",
        color: { bg: "rgba(249, 115, 22, 0.8)", border: "rgba(249, 115, 22, 1)" }
    },
    customer: {
        title: "Top khách hàng mua hàng nhiều nhất (đã trừ trả hàng)",
        api: analysisService.getTopCustomers,
        labelField: row => row.customer_name || row.name || row.customer || row.full_name || row.customer_full_name || "Khách hàng",
        valueField: "net_spent",
        valueRevenueField: "total_revenue",
        valueRefundField: "total_refund",
        chartLabel: "Tổng mua hàng (tr)",
        color: { bg: "rgba(59, 130, 246, 0.8)", border: "rgba(59, 130, 246, 1)" }
    },
    supplier: {
        title: "Top nhà cung cấp nhập hàng nhiều nhất (đã trừ trả hàng)",
        api: analysisService.getTopPurchasing,
        labelField: "supplier_name",
        valueField: "net_purchase_amount",
        valueRevenueField: "total_purchase_amount",
        valueRefundField: "total_refund_amount",
        chartLabel: "Tổng giá trị nhập (tr)",
        color: { bg: "rgba(34, 197, 94, 0.8)", border: "rgba(34, 197, 94, 1)" }
    },
    revenue: {
        title: "Doanh thu thuần",
        api: analysisService.getFinancialStatistics, // API để lấy dữ liệu doanh thu theo ngày
        labelField: "day", // hoặc trường tương ứng trong API trả về
        valueField: "net_revenue",
        chartLabel: "Doanh thu (tr)",
        color: { bg: "rgba(0, 123, 255, 0.8)", border: "rgba(0, 123, 255, 1)" },
        vertical: true // mình thêm cờ này để phân biệt loại biểu đồ
    },
    finance: {
        title: "Báo cáo kết quả hoạt động kinh doanh",
        api: analysisService.getFinancialDetailedStatistics, // API để lấy dữ liệu tài chính chi tiết
        labelField: "day",
        valueField: "net_revenue",
        chartLabel: "Doanh thu (tr)",
        color: { bg: "rgba(0, 123, 255, 0.8)", border: "rgba(0, 123, 255, 1)" },
        vertical: true
    }
};

const TopEntityReport = ({ type }) => {
    const [dataList, setDataList] = useState([]);
    console.log("🚀 ~ TopEntityReport ~ dataList:", dataList, "Type:", typeof dataList, "IsArray:", Array.isArray(dataList))
    const [rawRevenueData, setRawRevenueData] = useState(null); // giữ nguyên dữ liệu gốc từ API khi type === 'revenue'
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [viewType, setViewType] = useState("chart");
    const [filters, setFilters] = useState({ dateFrom: null, dateTo: null });
    const config = configMap[type];

    // select date
    const currentDate = dayjs();
    const [selectedOptions, setSelectedOptions] = useState("init");
    const [selectedDate, setSelectedDate] = useState();


    const [limit, setLimit] = useState(5);

    const handleSelectOptions = (value) => {
        if (value !== selectedOptions) {
            setSelectedOptions(value);
            setSelectedDate(value === "range" ? null : currentDate);
        }
    };

    // Reset view to chart whenever switching report type
    useEffect(() => {
        setViewType("chart");
    }, [type]);

    const handleDateChange = (date, dateString) => {
        setSelectedDate(date);

        if (selectedOptions === "range") {
            console.log("Từ:", dateString[0], "Đến:", dateString[1]);
        } else if (selectedOptions === "quarter") {
            const [year, q] = dateString.split("-");
            const quarter = Number(q.replace("Q", ""));
            console.log("Quý:", quarter, "Năm:", year);
        } else if (selectedOptions === "month") {
            const [year, month] = dateString.split("-");
            console.log("Tháng:", month, "Năm:", year);
        } else {
            console.log(
                selectedOptions === "day"
                    ? "Ngày:"
                    : selectedOptions === "year"
                        ? "Năm:"
                        : "",
                dateString
            );
        }
    };

    const handleStatistic = () => {
        console.log("Thống kê theo:", selectedOptions);

        let params = {};

        if (selectedOptions === "range") {
            const [start, end] = selectedDate || [];
            if (start && end) {
                params.startDate = start.format("YYYY-MM-DD");
                params.endDate = end.format("YYYY-MM-DD");
                console.log("Từ ngày:", params.startDate, "đến ngày:", params.endDate);
            }
        } else if (selectedDate) {
            const date = selectedDate;

            const day = date.date();
            const month = date.month() + 1;
            const year = date.year();

            if (selectedOptions === "day") {
                params.day = day;
                params.month = month;
                params.year = year;
                console.log("Ngày:", day, "Tháng:", month, "Năm:", year);
            } else if (selectedOptions === "month") {
                params.month = month;
                params.year = year;
                console.log("Tháng:", month, "Năm:", year);
            } else if (selectedOptions === "quarter") {
                const quarter = Math.ceil((month) / 3);
                params.quarter = quarter;
                params.year = year;
                console.log("Quý:", quarter, "Năm:", year);
            } else if (selectedOptions === "year") {
                params.year = year;
                console.log("Năm:", year);
            }
        }

        params.limit = limit
        // TODO: Gọi API ở đây nếu cần
        setFilters(params);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await config.api({ ...filters });

                // --- CHỈ SỬA Ở ĐÂY CHO CASE revenue và finance ---
                if (res?.data) {
                    if (type === "revenue" && res.data && res.data.title && Array.isArray(res.data.title)) {
                        // giữ dữ liệu gốc để dùng cho chartDataRevenue
                        setRawRevenueData(res.data);

                        // chuyển đổi sang mảng giống các type khác để chartData cũ vẫn hoạt động
                        // Lưu ý: dataList của chart cũ sẽ chứa giá trị ở đơn vị VND (nên nhân *1_000_000)
                        const converted = (res.data.title || []).map((label, idx) => {
                            return {
                                [config.labelField]: label,
                                [config.valueField]: (res.data.revenue && res.data.revenue[idx] != null) ? res.data.revenue[idx] * 1000000 : 0
                            };
                        });
                        setDataList(converted);
                    } else if (type === "finance" && res.data && res.data.time_periods && Array.isArray(res.data.time_periods)) {
                        // Xử lý riêng cho finance type với cấu trúc dữ liệu khác
                        setRawRevenueData(res.data);

                        // Tạo dữ liệu cho chart từ finance data
                        const converted = (res.data.time_periods || []).map((period, idx) => {
                            return {
                                [config.labelField]: period, // Sử dụng trực tiếp dữ liệu từ API
                                [config.valueField]: (res.data.metrics && res.data.metrics.net_revenue && res.data.metrics.net_revenue[idx] != null)
                                    ? res.data.metrics.net_revenue[idx] : 0
                            };
                        });
                        setDataList(converted);
                    } else {
                        // giữ nguyên behavior cũ cho các type khác
                        setDataList(Array.isArray(res.data) ? res.data : []);
                    }
                } else {
                    // Nếu không có data, set về array rỗng
                    setDataList([]);
                }
                // --- KẾT THÚC SỬA ---

                if (type === "product") {
                    const ress = await analysisService.getRevenueByCategory({ ...filters });
                    if (ress?.data) {
                        setRevenueByCategory(ress.data);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [type, filters]);


    // Hàm tạo màu random dạng rgba
    function getRandomColor(opacity = 1) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Tạo mảng màu random theo số lượng danh mục
    const backgroundColors = (revenueByCategory || []).map(() => getRandomColor(0.8));

    if (!config) return <div>Loại báo cáo không hợp lệ</div>;

    // Safety check for dataList
    if (!Array.isArray(dataList)) {
        console.error("dataList is not an array:", dataList);
        return <div>Đang tải dữ liệu...</div>;
    }

    // chartData (giữ nguyên như cũ)
    const chartData = {
        labels: (Array.isArray(dataList) ? dataList : []).map(item =>
            typeof config.labelField === "function"
                ? config.labelField(item)
                : item[config.labelField] || "Không rõ"
        ),
        datasets: [
            {
                label: config.chartLabel,
                data: (Array.isArray(dataList) ? dataList : []).map(item => (item[config.valueField] / 1000000) || 0),
                backgroundColor: config.color.bg,
                borderColor: config.color.border,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    // chartDataRevenue (mới) — dùng rawRevenueData (không thay đổi raw data gốc)
    const chartDataRevenue = rawRevenueData
        ? {
            labels: type === "finance"
                ? (rawRevenueData.time_periods || []) // Sử dụng trực tiếp dữ liệu từ API
                : (rawRevenueData.title || []),
            datasets: [
                {
                    label: "Doanh thu (tr)",
                    // rawRevenueData.revenue ở ví dụ là giá trị theo 'tr', nên giữ nguyên (không nhân/chia)
                    data: type === "finance"
                        ? (rawRevenueData.metrics?.net_revenue || [])
                        : (rawRevenueData.revenue || []),
                    backgroundColor: config.color.bg,
                    borderColor: config.color.border,
                    borderWidth: 1,
                    borderRadius: 4,
                },
                ...(type === "finance" ? [] : [{
                    label: "Chi phí (tr)",
                    data: rawRevenueData.expense || [],
                    backgroundColor: "rgba(220, 53, 69, 0.8)",
                    borderColor: "rgba(220, 53, 69, 1)",
                    borderWidth: 1,
                    borderRadius: 4,
                }])
            ],
        }
        : {
            labels: [],
            datasets: [],
        };

    const options = {
        indexAxis: config.vertical ? "x" : "y",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: config.title },
        },
        scales: {
            x: config.vertical
                ? { // Trục ngày/tháng khi cột đứng
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                        drawBorder: false,
                    },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 11 },
                        color: "#6b7280",
                    },
                }
                : { // Trục giá trị khi cột ngang
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                        drawBorder: false,
                    },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 11 },
                        color: "#6b7280",
                        callback: (value) => value + ' tr',
                    },
                },
            y: config.vertical
                ? { // Trục giá trị khi cột đứng
                    beginAtZero: true,
                    grid: { display: false },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 11 },
                        color: "#6b7280",
                        callback: (value) => value + ' tr',
                    },
                }
                : { // Trục tên khi cột ngang
                    grid: { display: false },
                    ticks: {
                        font: { family: "'Inter', sans-serif", size: 11 },
                        color: "#6b7280",
                    },
                },
        },
    };

    // Pie chart data
    const pieData = {
        labels: (revenueByCategory || []).map(category => category.category_name || "Danh mục"),
        datasets: [
            {
                data: (revenueByCategory || []).map(category => category.net_revenue),
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace(/0\.8\)$/, '1)')),
                borderWidth: 2,
            },
        ],
    }

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: window.innerWidth < 768 ? "bottom" : "right",
                labels: {
                    boxWidth: 12,
                    padding: window.innerWidth < 768 ? 10 : 20,
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
            },
        },
    }

    return (
        <div style={{ padding: "16px" }}>
            <Row gutter={[16, 16]}>
                {/* Sidebar - Responsive */}
                <Col xs={24} lg={6}>
                    <Card>
                        {type !== "finance" && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>Kiểu hiển thị</strong>
                                <Radio.Group
                                    value={viewType}
                                    onChange={(e) => setViewType(e.target.value)}
                                    style={{ display: "flex", marginTop: 8, flexWrap: "wrap" }}
                                >
                                    <Radio.Button value="chart">Biểu đồ</Radio.Button>
                                    <Radio.Button value="report">Báo cáo</Radio.Button>
                                </Radio.Group>
                            </div>
                        )}

                        {/* Select giới hạn */}
                        {type !== 'revenue' && type !== 'finance' &&
                            <div style={{ marginBottom: 16 }}>
                                <strong>Giới hạn hiển thị</strong>
                                <Select
                                    value={limit}
                                    onChange={(value) => setLimit(value)}
                                    style={{ width: "100%", marginTop: 8 }}
                                >
                                    <Select.Option value={5}>Top 5</Select.Option>
                                    <Select.Option value={10}>Top 10</Select.Option>
                                    <Select.Option value={20}>Top 20</Select.Option>
                                </Select>
                            </div>
                        }

                        <div style={{ marginBottom: 16 }}>
                            <strong>Thời gian</strong>
                            <div className="mt-3">
                                <OptionsStatistics
                                    selectedOptions={selectedOptions}
                                    selectedDate={selectedDate}
                                    onSelectOptions={handleSelectOptions}
                                    onDateChange={handleDateChange}
                                    onStatistic={handleStatistic}
                                    isStatistic={true}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Main content - Responsive */}
                <Col xs={24} lg={18}>
                    <Card>
                        {type === "finance" ? (
                            // Finance Report - luôn hiển thị báo cáo chi tiết
                            <FinanceReport
                                data={rawRevenueData}
                                reportTitle="Báo cáo kết quả hoạt động kinh doanh"
                            />
                        ) : viewType === "chart" ? (
                            // Chart view cho các type khác (không phải finance)
                            <Row gutter={[16, 16]}>
                                <Col xs={24} lg={type === "product" ? 12 : 24}>
                                    <Card
                                        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
                                        headStyle={{
                                            borderBottom: "1px solid #f0f0f0",
                                            padding: "16px 24px",
                                        }}
                                        bodyStyle={{ padding: "24px" }}
                                    >
                                        <div style={{ 
                                            height: "456px", 
                                            minHeight: "300px",
                                            maxHeight: "lg:456px 300px"
                                        }}>
                                            {/* nếu là revenue -> dùng chartDataRevenue (giữ raw data), else dùng chartData cũ */}
                                            <Bar data={type === "revenue" ? chartDataRevenue : chartData} options={options} />
                                        </div>
                                    </Card>
                                </Col>

                                {type === "product" && (
                                    <Col xs={24} lg={12}>
                                        <Card
                                            title={
                                                <span className="text-[#656565] font-medium text-sm">
                                                    Doanh thu theo danh mục
                                                </span>
                                            }
                                            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 mt-4 lg:mt-0"
                                            headStyle={{
                                                borderBottom: "1px solid #f0f0f0",
                                                padding: "12px 16px",
                                            }}
                                            bodyStyle={{ padding: "16px" }}
                                        >
                                            <div style={{ 
                                                height: "418px", 
                                                minHeight: "300px",
                                                maxHeight: "418px"
                                            }}>
                                                <Pie data={pieData} options={pieOptions} />
                                            </div>
                                        </Card>
                                    </Col>
                                )}
                            </Row>
                        ) : (
                            // Report view cho các type khác (không phải finance)
                            (() => {
                                const commonHeaders = {
                                    revenue: "Doanh thu",
                                    refund: "Giá trị trả",
                                    net: "Doanh thu thuần",
                                };

                                if (type === "revenue") {
                                    const rows = rawRevenueData && Array.isArray(rawRevenueData.title)
                                        ? rawRevenueData.title.map((label, idx) => {
                                            const revenueTr = (rawRevenueData.revenue && rawRevenueData.revenue[idx]) || 0;
                                            const expenseTr = (rawRevenueData.expense && rawRevenueData.expense[idx]) || 0;
                                            const revenue = revenueTr * 1000000;
                                            const refund = expenseTr * 1000000;
                                            const netRevenue = revenue - refund;
                                            return { date: label, revenue, refund, netRevenue };
                                        })
                                        : [];

                                    return (
                                        <SalesReport
                                            rows={rows}
                                            reportTitle={"BÁO CÁO DOANH THU THUẦN"}
                                            headers={{ label: "Thời gian", ...commonHeaders }}
                                        />
                                    );
                                }

                                // product, customer, supplier
                                const labelHeaderMap = {
                                    product: "Sản phẩm",
                                    customer: "Khách hàng",
                                    supplier: "Nhà cung cấp",
                                };

                                const rows = (Array.isArray(dataList) ? dataList : []).map((item) => {
                                    const label = typeof config.labelField === "function" ? config.labelField(item) : (item[config.labelField] || "");
                                    const netKey = (config.valueField || "").trim();
                                    const revenueKey = (config.valueRevenueField || "").trim();
                                    const refundKey = (config.valueRefundField || "").trim();
                                    const value = Number(item[netKey] ?? 0);
                                    const valueRevenue = Number(item[revenueKey] ?? 0);
                                    const valueRefund = Number(item[refundKey] ?? 0);
                                    return { date: label, revenue: valueRevenue, refund: valueRefund, netRevenue: value };
                                });

                                const titleMap = {
                                    product: "BÁO CÁO TOP SẢN PHẨM",
                                    customer: "BÁO CÁO TOP KHÁCH HÀNG",
                                    supplier: "BÁO CÁO TOP NHÀ CUNG CẤP",
                                };

                                const headersByType = {
                                    product: { label: labelHeaderMap.product, revenue: "Doanh thu", refund: "Giá trị trả", net: "Doanh thu thuần" },
                                    customer: { label: labelHeaderMap.customer, revenue: "Doanh thu", refund: "Giá trị trả", net: "Doanh thu thuần" },
                                    supplier: { label: labelHeaderMap.supplier, revenue: "Giá trị nhập", refund: "Giá trị trả", net: "Giá trị thuần" },
                                };

                                return (
                                    <SalesReport
                                        rows={rows}
                                        reportTitle={titleMap[type] || "BÁO CÁO"}
                                        headers={headersByType[type] || { label: labelHeaderMap[type] || "Tên", ...commonHeaders }}
                                    />
                                );
                            })()
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TopEntityReport;
