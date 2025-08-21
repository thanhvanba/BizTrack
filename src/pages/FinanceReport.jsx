import React, { useEffect, useState } from "react";
import { Table, Button, Form, Card, Row, Col, Statistic, Grid } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

import openSansBase64 from "../utils/OpenSansBase64";

export default function FinanceReport({
  data = null,
  reportTitle = "Báo cáo kết quả hoạt động kinh doanh",
}) {
  const [dataSource, setDataSource] = useState([]);
  const screens = Grid.useBreakpoint();

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

    const sumMany = (arrays) => {
      if (!arrays || arrays.length === 0) return new Array(length).fill(0);
      return arrays.reduce((acc, cur) => sumTwo(acc, cur), new Array(length).fill(0));
    };

    // Normalize all arrays to ensure they are valid
    const totalRevenueArr = normalize(metrics.total_revenue);
    const totalDiscountArr = normalize(metrics.total_discount);
    const customerReturnArr = normalize(metrics.total_customer_return);
    const netRevenueArr = normalize(metrics.net_revenue);
    const grossProfitArr = normalize(metrics.gross_profit);
    console.log("🚀 ~ processData ~ grossProfitArr:", grossProfitArr)
    const shippingFeeArr = normalize(metrics.total_shipping_fee);
    const otherRevenueArr = normalize(metrics.total_other_revenue);
    const otherExpenseArr = normalize(metrics.total_other_expense);
    const netProfitArr = normalize(metrics.net_profit);

    // Thêm data cho các trường giá vốn
    const costOfGoodsOrderArr = normalize(metrics.total_cost_of_goods);
    const costOfGoodsReturnedArr = normalize(metrics.total_cost_of_goods_returned);
    const totalCostOfGoodsArr = costOfGoodsOrderArr.map((orderCost, index) => orderCost - costOfGoodsReturnedArr[index]);

    // Doanh thu gồm cả tiền ship khách trả
    const revenueWithShippingArr = sumTwo(totalRevenueArr, shippingFeeArr);
    const discountTotalArr = sumTwo(totalDiscountArr, customerReturnArr);
    const netRevenueComputedArr = revenueWithShippingArr.map((v, i) => v - (discountTotalArr[i] || 0));

    // Chi phí con
    const voucherExpensesArr = new Array(length).fill(0);
    const destroyedGoodsArr = new Array(length).fill(0);
    const pointsPaymentArr = new Array(length).fill(0);
    const paymentDiscountArr = new Array(length).fill(0);
    // Phí trả ĐVGH (khác với phí KH trả) - nếu không có dữ liệu API thì để 0
    const deliveryPartnerFeeArr = normalize(metrics.total_delivery_partner_fee || []);
    const expensesArr = sumMany([
      voucherExpensesArr,
      deliveryPartnerFeeArr,
      destroyedGoodsArr,
      pointsPaymentArr,
      paymentDiscountArr,
    ]);

    // Create table data
    const tableData = [
      {
        key: "revenue",
        metric: "Doanh thu bán hàng (1 = 1.1 + 1.2)",
        values: revenueWithShippingArr,
        children: [
          {
            key: "revenue_goods",
            metric: "Doanh thu hàng hóa (1.1)",
            values: totalRevenueArr,
          },
          {
            key: "revenue_shipping",
            metric: "Phí vận chuyển (1.2)",
            values: shippingFeeArr,
          },
        ],
      },
      {
        key: "discount",
        metric: "Giảm trừ Doanh thu (2 = 2.1+2.2)",
        values: discountTotalArr,
        children: [
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
        ],
      },
      {
        key: "net_revenue",
        metric: "Doanh thu thuần (3=1-2)",
        values: netRevenueComputedArr,
      },
      {
        key: "cost_of_goods",
        metric: "Tổng giá vốn (4 = 4.1-4.2)",
        values: totalCostOfGoodsArr,
        children: [
          {
            key: "total_cost_of_goods_order",
            metric: "Giá vốn hàng bán (4.1)",
            values: costOfGoodsOrderArr,
          },
          {
            key: "total_cost_of_goods_returned",
            metric: "Giá vốn đơn trả (4.2)",
            values: costOfGoodsReturnedArr,
          },
        ]
      },

      {
        key: "gross_profit",
        metric: "Lợi nhuận gộp về bán hàng (5=3-4)",
        values: grossProfitArr,
      },
      {
        key: "expenses",
        metric: "Chi phí (6)",
        values: expensesArr,
        children: [
          {
            key: "voucher_expenses",
            metric: "Chi phí voucher (6.1)",
            values: voucherExpensesArr,
          },
          {
            key: "destroyed_goods",
            metric: "Xuất hủy hàng hóa (6.3)",
            values: destroyedGoodsArr,
          },
          {
            key: "points_payment",
            metric: "Giá trị thanh toán bằng điểm (6.4)",
            values: pointsPaymentArr,
          },
          {
            key: "payment_discount",
            metric: "Chiết khấu thanh toán cho khách (6.5)",
            values: paymentDiscountArr,
          },
        ],
      },
      {
        key: "other_revenue",
        metric: "Thu nhập khác (7)",
        values: otherRevenueArr,
      },
      {
        key: "other_expense",
        metric: "Chi phí khác (8)",
        values: otherExpenseArr,
      },
      {
        key: "net_profit",
        metric: "Lợi nhuận ròng (9=5-6+7-8)",
        values: netProfitArr,
      },
    ];

    setDataSource(tableData);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0";
    return Number(value).toLocaleString("vi-VN");
  };

  const getColumns = () => {
    if (!data || !data.time_periods) return [];

    // Xác định các hàng con để hiển thị thụt lề giúp nhận diện cha - con rõ ràng
    const childOfDiscountKeys = new Set(["invoice_discount", "return_value"]);
    const childOfExpensesKeys = new Set([
      "voucher_expenses",
      "delivery_fees",
      "destroyed_goods",
      "points_payment",
      "payment_discount",
    ]);
    const childKeys = new Set([
      ...Array.from(childOfDiscountKeys),
      ...Array.from(childOfExpensesKeys),
    ]);

    const baseColumns = [
      {
        title: "Chỉ tiêu",
        dataIndex: "metric",
        key: "metric",
        width: screens.lg ? 300 : 200,
        fixed: screens.lg ? "left" : undefined,
        render: (text, record) => {
          const isGroup = record?.key === "discount" || record?.key === "expenses";
          return (
            <span style={{ fontWeight: isGroup ? 600 : 500, whiteSpace: "normal" }}>
              {text}
            </span>
          );
        },
      },
    ];

    // Add dynamic columns for each time period
    const timeColumns = data.time_periods.map((period, index) => ({
      title: period, // Sử dụng trực tiếp dữ liệu từ API
      dataIndex: "values",
      key: `period_${index}`,
      width: 120,
      align: "right",
      render: (values, record) => {
        const value = values?.[index] || 0;
        const isNegative = value < 0;
        const isSpecial = ["return_value", "gross_profit", "net_profit"].includes(record?.key);

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
      render: (values, record) => {
        const total = values?.reduce((sum, val) => sum + (val || 0), 0) || 0;
        const isNegative = total < 0;
        const isSpecial = ["return_value", "gross_profit", "net_profit"].includes(record?.key);

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
    const flattenRows = (rows, indent = 0, acc = []) => {
      if (!Array.isArray(rows)) return acc;
      rows.forEach((row) => {
        const indentPrefix = indent > 0 ? `${" ".repeat(indent)}↳ ` : "";
        const values = row.values?.map((val) => formatCurrency(val || 0)) || [];
        const total = formatCurrency(
          row.values?.reduce((sum, val) => sum + (val || 0), 0) || 0
        );
        acc.push([`${indentPrefix}${row.metric}`, ...values, total]);
        if (row.children && row.children.length) {
          flattenRows(row.children, indent + 2, acc);
        }
      });
      return acc;
    };
    const tableBody = flattenRows(dataSource);

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
          defaultExpandAllRows
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
