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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;

const configMap = {
    product: {
        title: "Top 10 sản phẩm doanh thu cao nhất (đã trừ trả hàng)",
        api: analysisService.getTopSelling,
        labelField: "product_name",
        valueField: "net_revenue",
        chartLabel: "Doanh thu (tr)",
        color: { bg: "rgba(249, 115, 22, 0.8)", border: "rgba(249, 115, 22, 1)" }
    },
    customer: {
        title: "Top 10 khách hàng mua hàng nhiều nhất (đã trừ trả hàng)",
        api: analysisService.getTopCustomers,
        labelField: row => row.customer_name || row.name || "Khách hàng",
        valueField: "net_spent",
        chartLabel: "Tổng mua hàng (tr)",
        color: { bg: "rgba(59, 130, 246, 0.8)", border: "rgba(59, 130, 246, 1)" }
    },
    supplier: {
        title: "Top 10 nhà cung cấp nhập hàng nhiều nhất (đã trừ trả hàng)",
        api: analysisService.getTopPurchasing,
        labelField: "supplier_name",
        valueField: "net_purchase_amount",
        chartLabel: "Tổng giá trị nhập (tr)",
        color: { bg: "rgba(34, 197, 94, 0.8)", border: "rgba(34, 197, 94, 1)" }
    }
};

const TopEntityReport = ({ type }) => {
    const [dataList, setDataList] = useState([]);
    console.log("🚀 ~ TopEntityReport ~ dataList:", dataList)
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [viewType, setViewType] = useState("chart");
    const [filters, setFilters] = useState({ dateFrom: null, dateTo: null });
    const config = configMap[type];


    // select date
    const currentDate = dayjs();
    const [selectedOptions, setSelectedOptions] = useState("day");
    const [selectedDate, setSelectedDate] = useState(
        selectedOptions === "range" ? null : currentDate
    );


    const [limit, setLimit] = useState(5);

    const handleSelectOptions = (value) => {
        if (value !== selectedOptions) {
            setSelectedOptions(value);
            setSelectedDate(value === "range" ? null : currentDate);
        }
    };

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
                if (res?.data) setDataList(res.data);

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
    const backgroundColors = revenueByCategory.map(() => getRandomColor(0.8));

    if (!config) return <div>Loại báo cáo không hợp lệ</div>;

    const chartData = {
        labels: dataList.map(item =>
            typeof config.labelField === "function"
                ? config.labelField(item)
                : item[config.labelField] || "Không rõ"
        ),
        datasets: [
            {
                label: config.chartLabel,
                data: dataList.map(item => (item[config.valueField] / 1000000) || 0),
                backgroundColor: config.color.bg,
                borderColor: config.color.border,
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        indexAxis: "y",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: config.title },
        },
        scales: {
            x: {
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
                    callback: function (value) {
                        return value + ' tr';
                    }
                },
            },
            y: {
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
    };

    // Pie chart data
    const pieData = {
        labels: revenueByCategory.map(category => category.category_name || "Danh mục"),
        datasets: [
            {
                data: revenueByCategory.map(category => category.net_revenue),
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
        <div style={{ display: "flex", gap: "16px", padding: "16px" }}>
            {/* Sidebar */}
            <Card style={{ flexBasis: "250px    ", flexShrink: 0 }}>
                <div style={{ marginBottom: 16 }}>
                    <strong>Kiểu hiển thị</strong>
                    <Radio.Group
                        value={viewType}
                        onChange={(e) => setViewType(e.target.value)}
                        style={{ display: "flex", marginTop: 8 }}
                    >
                        <Radio.Button value="chart">Biểu đồ</Radio.Button>
                        <Radio.Button value="report">Báo cáo</Radio.Button>
                    </Radio.Group>
                </div>

                {/* Select giới hạn */}
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

                {/* <div style={{ marginBottom: 16 }}>
                    <strong>Tìm kiếm</strong>
                    <Input placeholder="Theo mã, tên" style={{ marginTop: 8 }} />
                </div>

                <div>
                    <strong>Loại hàng</strong>
                    <Select placeholder="Chọn loại hàng" style={{ width: "100%", marginTop: 8 }}>
                        <Select.Option value="loai1">Loại 1</Select.Option>
                        <Select.Option value="loai2">Loại 2</Select.Option>
                    </Select>
                </div> */}
            </Card>

            {/* Main content */}
            <Card style={{ flex: 1 }}>
                {viewType === "chart" ? (
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
                                <div style={{ height: "456px" }}>
                                    <Bar data={chartData} options={options} />
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
                                    <div style={{ height: "418px", minHeight: "418px" }}>
                                        <Pie data={pieData} options={pieOptions} />
                                    </div>
                                </Card>
                            </Col>
                        )}


                    </Row>
                ) : (
                    <div>Báo cáo</div>
                )}
            </Card>

        </div>
    );
};

export default TopEntityReport;
