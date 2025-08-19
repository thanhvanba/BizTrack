import React, { useEffect, useState } from "react";
import { Table, Button, Form, Card, Row, Col, Statistic } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

import openSansBase64 from "../utils/OpenSansBase64";

export default function FinanceReport({
  data = null,
  reportTitle = "Báo cáo kết quả hoạt động kinh doanh",
}) {
  const [dataSource, setDataSource] = useState([]);
  console.log("🚀 ~ FinanceReport ~ dataSource:", dataSource);
  const [summaryData, setSummaryData] = useState({});

  useEffect(() => {
    if (data && data.time_periods && data.metrics) {
      processData(data);
    }
  }, [data]);

  const processData = (rawData) => {
    const { time_periods, metrics } = rawData;

    const length = Array.isArray(time_periods) ? time_periods.length : 0;

    const normalize = (arr) => {
      const result = new Array(length).fill(0);
      if (Array.isArray(arr)) {
        for (let i = 0; i < length; i++) {
          result[i] = Number(arr[i] || 0);
        }
      }
      return result;
    };

    const sumTwo = (a, b) => {
      const aa = normalize(a);
      const bb = normalize(b);
      return aa.map((v, i) => v + bb[i]);
    };

    // Normalize all arrays to ensure they are valid
    const totalRevenueArr = normalize(metrics.total_revenue);
    const totalDiscountArr = normalize(metrics.total_discount);
    const customerReturnArr = normalize(metrics.total_customer_return);
    const netRevenueArr = normalize(metrics.net_revenue);
    const cogsArr = normalize(metrics.total_cost_of_goods);
    const grossProfitArr = normalize(metrics.gross_profit);
    const shippingFeeArr = normalize(metrics.total_shipping_fee);
    const otherRevenueArr = normalize(metrics.total_other_revenue);
    const otherExpenseArr = normalize(metrics.total_other_expense);
    const netProfitArr = normalize(metrics.net_profit);

    // Create table data
    const tableData = [
      {
        key: "revenue",
        metric: "Doanh thu bán hàng (1)",
        values: totalRevenueArr,
      },
      {
        key: "discount",
        metric: "Giảm trừ Doanh thu (2 = 2.1+2.2)",
        values: sumTwo(totalDiscountArr, customerReturnArr),
      },
      {
        key: "invoice_discount",
        metric: "Chiết khấu hóa đơn (2.1)",
        values: totalDiscountArr,
      },
      {
        key: "return_value",
        metric: "Giá trị hàng bán bị trả lại (2.2)",
        values: customerReturnArr,
      },
      {
        key: "net_revenue",
        metric: "Doanh thu thuần (3=1-2)",
        values: netRevenueArr,
      },
      {
        key: "cost_of_goods",
        metric: "Giá vốn hàng bán (4)",
        values: cogsArr,
      },
      {
        key: "gross_profit",
        metric: "Lợi nhuận gộp về bán hàng (5=3-4)",
        values: grossProfitArr,
      },
      {
        key: "expenses",
        metric: "Chi phí (6)",
        values: new Array(length).fill(0),
      },
      {
        key: "voucher_expenses",
        metric: "Chi phí voucher",
        values: new Array(length).fill(0),
      },
      {
        key: "delivery_fees",
        metric: "Phí trả ĐTGH",
        values: shippingFeeArr,
      },
      {
        key: "destroyed_goods",
        metric: "Xuất hủy hàng hóa",
        values: new Array(length).fill(0),
      },
      {
        key: "points_payment",
        metric: "Giá trị thanh toán bằng điểm",
        values: new Array(length).fill(0),
      },
      {
        key: "payment_discount",
        metric: "Chiết khấu thanh toán cho khách",
        values: new Array(length).fill(0),
      },
      {
        key: "other_revenue",
        metric: "Thu nhập khác",
        values: otherRevenueArr,
      },
      {
        key: "other_expense",
        metric: "Chi phí khác",
        values: otherExpenseArr,
      },
      {
        key: "net_profit",
        metric: "Lợi nhuận ròng",
        values: netProfitArr,
      },
    ];

    setDataSource(tableData);

    // Calculate summary data safely
    const sumAll = (arr) =>
      normalize(arr).reduce((sum, val) => sum + (val || 0), 0);
    const summary = {
      totalRevenue: sumAll(metrics.total_revenue),
      totalNetRevenue: sumAll(metrics.net_revenue),
      totalGrossProfit: sumAll(metrics.gross_profit),
      totalNetProfit: sumAll(metrics.net_profit),
    };
    setSummaryData(summary);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString("vi-VN");
  };

  const getColumns = () => {
    if (!data || !data.time_periods) return [];

    const baseColumns = [
      {
        title: "Chỉ tiêu",
        dataIndex: "metric",
        key: "metric",
        width: 200,
        fixed: "lg:left",
        render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
      },
    ];

    // Add dynamic columns for each time period
    const timeColumns = data.time_periods.map((period, index) => ({
      title: period, // Sử dụng trực tiếp dữ liệu từ API
      dataIndex: "values",
      key: `period_${index}`,
      width: 120,
      align: "right",
      render: (values) => {
        const value = values?.[index] || 0;
        const isNegative = value < 0;
        const isSpecial = [
          "return_value",
          "gross_profit",
          "net_profit",
        ].includes(dataSource.find((row) => row.values === values)?.key);

        return (
          <span
            style={{
              color: isSpecial ? "#1890ff" : isNegative ? "#ff4d4f" : "#000",
              fontWeight: isSpecial ? 600 : 400,
            }}
          >
            {formatCurrency(value)}
          </span>
        );
      },
    }));

    // Add total column
    const totalColumn = {
      title: "Tổng",
      dataIndex: "values",
      key: "total",
      width: 120,
      align: "right",
      render: (values) => {
        const total = values?.reduce((sum, val) => sum + (val || 0), 0) || 0;
        const isNegative = total < 0;
        const isSpecial = [
          "return_value",
          "gross_profit",
          "net_profit",
        ].includes(dataSource.find((row) => row.values === values)?.key);

        return (
          <span
            style={{
              color: isSpecial ? "#1890ff" : isNegative ? "#ff4d4f" : "#000",
              fontWeight: isSpecial ? 600 : 400,
            }}
          >
            {formatCurrency(total)}
          </span>
        );
      },
    };

    return [...baseColumns, ...timeColumns, totalColumn];
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");

    // Add custom font
    doc.addFileToVFS("OpenSans-Regular.ttf", openSansBase64);
    doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");
    doc.setFont("OpenSans");

    // Title
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 20);
    doc.setFontSize(12);
    doc.text("Chi nhánh trung tâm", 14, 30);

    // Date
    doc.setFontSize(10);
    doc.text(`Ngày lập: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 40);

    // Prepare table data
    const tableHeaders = ["Chỉ tiêu", ...(data?.time_periods || []), "Tổng"];
    const tableBody = dataSource.map((row) => {
      const values = row.values?.map((val) => formatCurrency(val || 0)) || [];
      const total = formatCurrency(
        row.values?.reduce((sum, val) => sum + (val || 0), 0) || 0
      );
      return [row.metric, ...values, total];
    });

    autoTable(doc, {
      startY: 50,
      head: [tableHeaders],
      body: tableBody,
      styles: {
        font: "OpenSans",
        fontStyle: "normal",
        fontSize: 8,
      },
      headStyles: {
        font: "OpenSans",
        fontStyle: "normal",
        fillColor: [173, 216, 230],
        textColor: [0, 0, 0],
        halign: "center",
        fontSize: 9,
      },
      bodyStyles: {
        font: "OpenSans",
        fontStyle: "normal",
        halign: "right",
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: "left", font: "OpenSans", fontSize: 8 },
      },
      margin: { top: 50, right: 14, bottom: 14, left: 14 },
    });

    doc.save("FinanceReport.pdf");
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#111827" }}>{reportTitle}</h2>
          <p style={{ margin: "4px 0 0 0", color: "#6b7280" }}>
            Chi nhánh trung tâm
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Form layout="inline" style={{ marginBottom: 0 }}>
            <Form.Item>
              <Button type="primary" onClick={exportPDF}>
                Xuất PDF
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Financial Table */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <Table
          dataSource={dataSource}
          columns={getColumns()}
          pagination={false}
          bordered
          size="middle"
          sticky
          scroll={{ x: 900, y: 600 }}
          rowClassName={(record, index) => {
            if (
              record.key === "net_revenue" ||
              record.key === "gross_profit" ||
              record.key === "net_profit"
            ) {
              return "highlight-row";
            }
            return index % 2 === 0 ? "even-row" : "odd-row";
          }}
        />
      </div>    
    </div>
  );
}
