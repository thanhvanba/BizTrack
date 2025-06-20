import React from "react";
import {
  Table,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Input,
  Divider,
} from "antd";

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function OrderInfoTab({ orderData }) {
  const {
    order_code,
    order_date,
    order_status,
    total_amount,
    final_amount,
    shipping_fee,
    payment_method,
    note,
    shipping_address,
    customer,
    products,
  } = orderData;

  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "product_id",
      key: "product_id",
      render: (id) => <a>{id.slice(0, 8).toUpperCase()}</a>,
    },
    {
      title: "Tên hàng",
      dataIndex: "product_name",
      key: "product_name",
      render: (name) => <Text className="whitespace-pre-line">{name}</Text>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      render: (price) => price.toLocaleString(),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      render: () => "0",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price_sale",
      render: (price) => price.toLocaleString(),
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) => (record.price * record.quantity).toLocaleString(),
    },
  ];

  const totalQuantity = products?.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductAmount = products?.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Header */}
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={5} className="mb-1">{customer?.customer_name}</Title>
          <Text className="mr-2">{order_code}</Text>
          <Tag color="green">{order_status}</Tag>
        </Col>
        <Col>
          <Text strong>{new Date(order_date).toLocaleString("vi-VN")}</Text>
        </Col>
      </Row>

      {/* Shipping Address */}
      <Row className="mt-2">
        <Col span={24}>
          <Text type="secondary">Địa chỉ: {shipping_address}</Text>
        </Col>
      </Row>
      
      <Divider className="my-3" />

      {/* Product Table */}
      <Table
        className="mt-3"
        columns={columns}
        dataSource={products}
        rowKey="product_id"
        pagination={false}
      />

      {/* Note & Summary */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <TextArea
          placeholder="Ghi chú..."
          rows={3}
          defaultValue={note || ""}
          className="w-full lg:w-1/2"
        />

        <div className="w-full lg:w-1/2 bg-gray-50 p-4 rounded">
          <Row className="mb-2">
            <Col span={18}>
              <Text strong>{`Tổng tiền hàng (${totalQuantity})`}</Text>
            </Col>
            <Col span={6} className="text-right">
              <Text strong>{totalProductAmount?.toLocaleString()}</Text>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col span={18}>Giảm giá hóa đơn</Col>
            <Col span={6} className="text-right">0</Col>
          </Row>
          <Row className="mb-2">
            <Col span={18}>Khách cần trả</Col>
            <Col span={6} className="text-right">
              {parseInt(final_amount).toLocaleString()}
            </Col>
          </Row>
          <Row>
            <Col span={18}>Khách đã trả</Col>
            <Col span={6} className="text-right">
              {parseInt(final_amount).toLocaleString()}
            </Col>
          </Row>
        </div>
      </div>

      {/* Action Buttons */}
      <Row justify="space-between" align="middle" className="mt-6">
        <Col>
          <Button danger>Hủy</Button>
          <Button className="ml-2">Sao chép</Button>
          <Button className="ml-2">Xuất file</Button>
        </Col>
        <Col>
          <Button type="primary">Chỉnh sửa</Button>
          <Button className="ml-2">Lưu</Button>
          <Button className="ml-2">Trả hàng</Button>
          <Button className="ml-2">In</Button>
        </Col>
      </Row>
    </div>
  );
}
