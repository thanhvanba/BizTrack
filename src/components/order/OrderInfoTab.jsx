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

import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import formatPrice from "../../utils/formatPrice";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function OrderInfoTab({ orderData }) {
  console.log("🚀 ~ OrderInfoTab ~ orderData:", orderData)
  const navigate = useNavigate()
  const {
    order_id,
    order_code,
    order_date,
    order_status,
    order_amount,
    total_amount,
    final_amount,
    amount_paid,
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
      dataIndex: "sku",
      key: "sku",
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
      align: "center",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "right",
      render: (discount) => formatPrice(discount),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price_sale",
      align: "right",
      render: (price) => formatPrice(price),
    },
    // {
    //   title: "Thành tiền",
    //   key: "total",
    //   render: (_, record) => (record.price * record.quantity - record.discount).toLocaleString(),
    // },
  ];

  const totalQuantity = products?.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductDiscount = products?.reduce(
    (sum, item) => sum + item.discount, 0
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
          <Text strong>Ngày giao: {new Date(order_date).toLocaleDateString("vi-VN")}</Text>
        </Col>
      </Row>

      {/* Shipping Address */}
      <Row>
        <Col span={24}>
          <Text type="secondary">Địa chỉ: {shipping_address}</Text>
        </Col>
      </Row>
      <Divider />

      {/* Product Table */}
      <Table
        className="mt-3"
        columns={columns}
        dataSource={products}
        rowKey="product_id"
        pagination={false}
        size="small"
        summary={() => (
          <>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="">
                <Text strong>{`Tổng tiền hàng (${totalQuantity})`}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <Text strong>{formatPrice(total_amount)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="">
                Giảm giá hóa đơn + Tổng giảm giá sản phẩm
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{`${formatPrice(order_amount)} + ${formatPrice(totalProductDiscount)}`}</Table.Summary.Cell>
            </Table.Summary.Row>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="">
                Phí vận chuyển
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">{formatPrice(shipping_fee)}</Table.Summary.Cell>
            </Table.Summary.Row>
          </>
        )}

      />

      {/* Note & Summary */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <TextArea
          placeholder="Ghi chú..."
          rows={3}
          value={note || ""}
          className="w-full lg:w-1/2"
        />

        <div className="w-full lg:w-1/2 border border-blue-600 bg-blue-50 px-4 py-2 rounded">
          <Row className="mb-2">
            <Col span={18}>
              <Text strong>Thành tiền</Text>
            </Col>
            <Col span={6} className="text-right">
              <Text strong>{formatPrice(final_amount)}</Text>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col span={18}>Khách đã trả</Col>
            <Col span={6} className="text-right">
              {formatPrice(amount_paid)}
            </Col>
          </Row>
          <Row className="text-red-500">
            <Col span={18}>Khách cần trả</Col>
            <Col span={6} className="text-right">
              {formatPrice(final_amount - amount_paid)}
            </Col>
          </Row>
        </div>
      </div>

      {/* Action Buttons */}
      <Row justify="space-between" align="middle" className="mt-6">
        <Col>
          <Button
            icon={<DeleteOutlined />}
            color="danger"
            variant="filled"
          >
            Hủy
          </Button>
          <Button className="ml-2">Xuất file</Button>
        </Col>
        <Col>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => navigate(`/edit-order/${order_id}`)}
          >
            Chỉnh sửa
          </Button>
          <Button
            icon={<RollbackOutlined />}
            color="danger"
            variant="outlined"
            className="ml-2"
          >
            Trả hàng
          </Button>
          <Button icon={<PrinterOutlined />} className="ml-2">In</Button>
        </Col>
      </Row>
    </div>
  );
}
