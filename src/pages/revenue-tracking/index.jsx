import { Card, Row, Col, Tabs, Typography } from "antd"
import { ArrowUpOutlined } from "@ant-design/icons"
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import OptionsStatistics from "../../components/OptionsStatistics"
import { useEffect, useState } from "react"
import analysisService from "../../service/analysisService"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

const { Title: TitleTypography } = Typography
const { TabPane } = Tabs

const RevenueTracking = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedOptions, setSelectedOptions] = useState('day');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectOptions = (value) => {
    if (value !== selectedOptions) {
      setSelectedOptions(value);

      if (value === 'month') {
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
      } else if (value === 'year') {
        setSelectedYear(currentYear);
      } else if (value === 'quarter') {
        setSelectedQuarter(null);
        setSelectedYear(currentYear);
      } else if (value === 'range') {
        setSelectedDate(null); // chỉ reset nếu chuyển từ loại khác sang "range"
      }
    }
  }

  const handleDateChange = (date, dateString) => {
    setSelectedDate(date);
    if (selectedOptions === "range") {
      console.log("Từ:", dateString[0], "Đến:", dateString[1]);
    } else if (selectedOptions === 'day') {
      console.log("Ngày:", dateString);
    } else if (selectedOptions === 'month') {
      const [year, month] = dateString.split('-');
      setSelectedYear(Number(year));
      setSelectedMonth(Number(month));
      console.log("Tháng:", month, "Năm:", year);
    } else if (selectedOptions === 'quarter') {
      const [year, q] = dateString.split('-');
      const quarter = Number(q.replace('Q', ''));
      setSelectedYear(Number(year));
      setSelectedQuarter(quarter);
      setSelectedMonth(quarter * 3 - 2);
      console.log("Quý:", quarter, "Năm:", year);
    } else if (selectedOptions === 'year') {
      setSelectedYear(Number(dateString));
      console.log("Năm:", dateString);
    }
  };

  const handleStatistic = () => {
    console.log("Thống kê theo:", selectedOptions);
    if (selectedOptions === 'range') {
      const [start, end] = selectedDate || [];
      console.log("Từ ngày:", start?.format('YYYY-MM-DD'), "đến ngày:", end?.format('YYYY-MM-DD'));
    } else if (selectedOptions === 'day') {
      console.log("Ngày được chọn:", selectedDate?.format('YYYY-MM-DD'));
    } else if (selectedOptions === 'month') {
      console.log("Tháng:", selectedMonth, "Năm:", selectedYear);
    } else if (selectedOptions === 'quarter') {
      console.log("Quý:", selectedQuarter, "Năm:", selectedYear);
    } else if (selectedOptions === 'year') {
      console.log("Năm:", selectedYear);
    }

    // TODO: Call API thống kê ở đây nếu cần
  };

  // Line chart data
  const lineData = {
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

  // Pie chart data
  const pieData = {
    labels: ["Điện thoại", "Laptop", "Phụ kiện", "Máy tính bảng", "Khác"],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
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

  useEffect(() => {
    const handelGetDataRevenue = async () => {
      const res = await analysisService.getRevenueByTimePeriod()
      console.log("🚀 ~ handelGetDataRevenue ~ res:", res)
      const ress = await analysisService.getInvoicesWithFilters()
      console.log("🚀 ~ handelGetDataRevenue ~ ress:", ress)
      const ress1 = await analysisService.getPayablePurchaseOrders()
      console.log("🚀 ~ handelGetDataRevenue ~ ress1:", ress1)
      const ress2 = await analysisService.getReceivableOrders()
      console.log("🚀 ~ handelGetDataRevenue ~ ress2:", ress2)
      const ress3 = await analysisService.getOutstandingDebt()
      console.log("🚀 ~ handelGetDataRevenue ~ ress3:", ress3)
    }
    handelGetDataRevenue()
  }, [])
  return (
    <div>
      <TitleTypography level={2} className="text-xl md:text-2xl font-bold m-0 text-gray-800">
        Doanh thu
      </TitleTypography>

      <OptionsStatistics
        selectedOptions={selectedOptions}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedDate={selectedDate}
        selectedQuarter={selectedQuarter}
        onSelectOptions={handleSelectOptions}
        onDateChange={handleDateChange}
        onStatistic={handleStatistic}
      />

      <Row gutter={[12, 12]} className="my-4 md:my-6">
        <Col xs={24} sm={8}>
          <Card
            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: "16px" }}
          >
            <div className="flex flex-col">
              <p className="text-xs md:text-sm text-gray-500 mb-0 md:mb-1">Tổng doanh thu</p>
              <p className="text-base md:text-2xl font-bold text-gray-800 leading-tight">152.000.000 ₫</p>
              <div className="flex items-center text-xs text-green-600 mt-1 md:mt-2">
                <ArrowUpOutlined />
                <span className="ml-1 text-[10px] md:text-xs">20.1% so với tháng trước</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: "16px" }}
          >
            <div className="flex flex-col">
              <p className="text-xs md:text-sm text-gray-500 mb-0 md:mb-1">Lợi nhuận</p>
              <p className="text-base md:text-2xl font-bold text-gray-800 leading-tight">57.000.000 ₫</p>
              <div className="flex items-center text-xs text-green-600 mt-1 md:mt-2">
                <ArrowUpOutlined />
                <span className="ml-1 text-[10px] md:text-xs">15.3% so với tháng trước</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: "16px" }}
          >
            <div className="flex flex-col">
              <p className="text-xs md:text-sm text-gray-500 mb-0 md:mb-1">Đơn hàng</p>
              <p className="text-base md:text-2xl font-bold text-gray-800 leading-tight">573</p>
              <div className="flex items-center text-xs text-blue-600 mt-1 md:mt-2">
                <span className="text-[10px] md:text-xs">+54 so với tháng trước</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-gray-800 font-bold text-base md:text-lg">Doanh thu theo tháng</span>}
            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
            headStyle={{
              borderBottom: "1px solid #f0f0f0",
              padding: "12px 16px",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ height: "250px", minHeight: "250px" }}>
              <Line data={lineData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<span className="text-gray-800 font-bold text-base md:text-lg">Doanh thu theo danh mục</span>}
            className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 mt-4 lg:mt-0"
            headStyle={{
              borderBottom: "1px solid #f0f0f0",
              padding: "12px 16px",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ height: "250px", minHeight: "250px" }}>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default RevenueTracking