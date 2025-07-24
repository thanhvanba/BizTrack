import { Card, Row, Col, Typography, Table, Divider } from "antd";
import formatPrice from "../../utils/formatPrice";

const { Title, Text } = Typography;

export default function PurchaseOrderDetail({ order }) {
  console.log("🚀 ~ PurchaseOrderDetail ~ order:", order)
  const totalAmount = order?.details?.reduce((sum, detail) => sum + detail.quantity * (detail.price ?? detail.refund_amount), 0);

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      render: (name) => name || "Không xác định",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_, detail) => formatPrice(detail.price ?? detail.refund_amount),
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
      render: (_, detail) => formatPrice((detail.quantity || 0) * (detail.price ?? detail.refund_amount)),
    },
  ];

  return (
    <Card bordered className="mb-4">
      <Row gutter={[16, 8]}>
        <Col xs={24} md={8}>
          <Text type="secondary">Mã đơn hàng</Text>
          <div className="font-medium">{order?.po_id || order?.return_id}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Trạng thái</Text>
          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${order?.status === "draft" || order?.status === "pending"
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
                }`}
            >
              {order?.status === "draft" || order?.status === "pending" ? "Chờ duyệt" : "Đã nhập"}
            </span>
          </div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Nhà cung cấp</Text>
          <div className="font-medium">{order?.supplier_name}</div>
        </Col>
        <Col xs={24} md={8}>
          <Text type="secondary">Kho nhập hàng</Text>
          <div className="font-medium">{order?.warehouse_name}</div>
        </Col>
        {order?.posted_at && (
          <Col xs={24} md={8}>
            <Text type="secondary">Ngày phê duyệt</Text>
            <div className="font-medium">{new Date(order?.posted_at).toLocaleString()}</div>
          </Col>
        )}
        <Col xs={24}>
          <Text type="secondary">Ghi chú</Text>
          <div className="font-medium">{order?.note || "Không có ghi chú"}</div>
        </Col>
      </Row>

      <Divider />

      <Table
        columns={columns}
        dataSource={order?.details || []}
        rowKey="po_detail_id"
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell colSpan={4} align="right">
              <Text strong>Tổng giá trị:</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell align="right">
              <Text strong className="text-xl">{formatPrice(totalAmount)}</Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
}
