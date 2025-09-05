import React, { useEffect, useState } from "react";
import { Table, Button, DatePicker, Radio, Form } from "antd";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

import openSansBase64 from "../utils/OpenSansBase64"; // lưu base64 vào file riêng

export default function SalesReport({ rows = [], reportTitle = "BÁO CÁO", headers = { label: "Thời gian", revenue: "Doanh thu bán hàng", refund: "Chi phí nhập hàng", net: "Doanh thu thuần" } }) {
  const [dataSource, setDataSource] = useState(rows);
  console.log("🚀 ~ SalesReport ~ dataSource:", dataSource)

  useEffect(() => {
    setDataSource(rows);
  }, [rows]);

  const totalRevenue = dataSource.reduce((sum, row) => sum + row.revenue, 0);
  const totalRefund = dataSource.reduce((sum, row) => sum + row.refund, 0);
  const totalNet = dataSource.reduce((sum, row) => sum + row.netRevenue, 0);

  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

  const columns = [
    { title: headers.label || "Thời gian", dataIndex: "date", key: "date" },
    { title: headers.revenue || "Doanh thu bán hàng", dataIndex: "revenue", key: "revenue", align: "right", render: (v) => formatNumber(v) },
    { title: headers.refund || "Chi phí nhập hàng", dataIndex: "refund", key: "refund", align: "right", render: (v) => formatNumber(v) },
    { title: headers.net || "Doanh thu thuần", dataIndex: "netRevenue", key: "netRevenue", align: "right", render: (v) => formatNumber(v) },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();

    // Add custom font
    doc.addFileToVFS("OpenSans-Regular.ttf", openSansBase64);
    doc.addFont("OpenSans-Regular.ttf", "OpenSans", "normal");
    doc.setFont("OpenSans");

    doc.setFontSize(16);
    doc.text(reportTitle, 14, 20);

    doc.setFontSize(10);
    doc.text(`Ngày xuất: ${dayjs().format("DD/MM/YYYY")}`, 14, 28);
    autoTable(doc, {
      startY: 40,
      head: [[headers.label || "Thời gian", headers.revenue || "Doanh thu bán hàng", headers.refund || "Chi phí nhập hàng", headers.net || "Doanh thu thuần"]],
      body: [
        ...dataSource.map((row) => [
          row.date,
          Number(row.revenue || 0).toLocaleString(),
          Number(row.refund || 0).toLocaleString(),
          Number(row.netRevenue || 0).toLocaleString(),
        ]),
        [
          { content: "Tổng cộng", styles: { fillColor: [240, 240, 240], font: "OpenSans", fontStyle: "normal" } },
          { content: Number(totalRevenue).toLocaleString(), styles: { font: "OpenSans", fontStyle: "normal" } },
          { content: Number(totalRefund).toLocaleString(), styles: { font: "OpenSans", fontStyle: "normal" } },
          { content: Number(totalNet).toLocaleString(), styles: { font: "OpenSans", fontStyle: "normal" } },
        ],
      ],
      styles: { font: "OpenSans", fontStyle: "normal", fontSize: 10 },
      headStyles: { font: "OpenSans", fontStyle: "normal", fillColor: [173, 216, 230], textColor: [0, 0, 0], halign: "center" },
      bodyStyles: { font: "OpenSans", fontStyle: "normal", halign: "right" },
      columnStyles: {
        0: { halign: "left", font: "OpenSans" }, // cột đầu tiên căn trái và font đúng
        1: { font: "OpenSans" },
        2: { font: "OpenSans" },
        3: { font: "OpenSans" }
      },
    });


    doc.save("SalesReport.pdf");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>{reportTitle}</div>
        <Form layout="inline" style={{ marginBottom: 0, gap: 12, flexWrap: "wrap" }}>
          {/* <Form.Item label="Chọn ngày" style={{ marginBottom: 8 }}>
            <RangePicker />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Radio.Group defaultValue="day">
              <Radio.Button value="day">Ngày</Radio.Button>
              <Radio.Button value="month">Tháng</Radio.Button>
            </Radio.Group>
          </Form.Item> */}
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" onClick={exportPDF}>
              Xuất PDF
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        bordered
        size="middle"
        dataSource={dataSource}
        columns={columns}
        rowKey={(record, index) => record.date || index}
        pagination={false}
        onRow={(record, index) => ({ style: { background: index % 2 === 0 ? "#fafafa" : "#ffffff" } })}
        scroll={{ y: 480, x: "max-content" }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}><strong>Tổng cộng</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><strong>{formatNumber(totalRevenue)}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={2} align="right"><strong>{formatNumber(totalRefund)}</strong></Table.Summary.Cell>
              <Table.Summary.Cell index={3} align="right"><strong>{formatNumber(totalNet)}</strong></Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );
}
