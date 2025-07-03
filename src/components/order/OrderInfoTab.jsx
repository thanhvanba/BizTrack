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
import { useLocation, useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function OrderInfoTab({ orderData, onUpdateOrderStatus, record }) {
  const location = useLocation();
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
    data,
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
    location.pathname.includes('return-order') ?
      {
        title: "Giá trả",
        dataIndex: "refund_amount",
        key: "refund_amount",
        align: "right",
        render: (price) => formatPrice(price),
      }
      : {
        title: "Giá bán",
        dataIndex: "price",
        key: "price_sale",
        align: "right",
        render: (price) => formatPrice(price),
      }, ,
    // {
    //   title: "Thành tiền",
    //   key: "total",
    //   render: (_, record) => (record.price * record.quantity - record.discount).toLocaleString(),
    // },
  ];

  const totalQuantity = location.pathname.includes('return-order') ? data?.details?.reduce((sum, item) => sum + item.quantity, 0) : products?.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductDiscount = products?.reduce(
    (sum, item) => sum + item.discount, 0
  );

  return (
    <>
      {orderData ?
        <div className="p-4 bg-white rounded shadow">
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} className="mb-1">
                {customer?.customer_name || data?.customer_name}
                <Text className="mx-2 font-normal">{order_code || data?.return_id}
                  {location.pathname.includes('return-order') && data?.order_code && (
                    <> (Mã HĐ: {data.order_code})</>
                  )}</Text>
                {order_status ? (
                  <Tag color="green">{order_status}</Tag>
                ) : (
                  <Tag color={
                    data?.status === 'completed'
                      ? 'green'
                      : data?.status === 'pending'
                        ? 'orange'
                        : 'red'
                  }>
                    {data?.status === 'completed'
                      ? 'Đã trả'
                      : data?.status === 'pending'
                        ? 'Đang xử lý'
                        : 'Không thành công'}
                  </Tag>
                )}

              </Title>
            </Col>
            <Col>
              <Text strong>{`${order_date ? 'Ngày giao:' : 'Ngày trả:'}`} {new Date(order_date || data?.created_at).toLocaleDateString("vi-VN")}</Text>
            </Col>
          </Row>

          {/* Shipping Address */}
          <Row>
            <Col span={24}>
              <Text type="secondary">Địa chỉ: {shipping_address}</Text><br />
              <Text type="secondary">Số điện thoại: {customer?.phone || data?.phone}</Text><br />
              <Text type="secondary">Email: {customer?.email || data?.email}</Text>
            </Col>
          </Row>
          <Divider />

          {/* Product Table */}
          <Table
            className="mt-3"
            columns={columns}
            dataSource={products || data?.details}
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
                    <Text strong>{formatPrice(total_amount || record?.total_refund)}</Text>
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
              value={note || data?.note}
              className="w-full lg:w-1/2"
            />

            <div className="w-full lg:w-1/2 border border-blue-600 bg-blue-50 px-4 py-2 rounded">
              <Row className="mb-2">
                <Col span={18}>
                  <Text strong>Thành tiền</Text>
                </Col>
                <Col span={6} className="text-right">
                  <Text strong>{formatPrice(final_amount || record?.total_refund)}</Text>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col span={18}>{location.pathname.includes('return-order') ? 'Đã trả khách' : 'Khách đã trả'}</Col>
                <Col span={6} className="text-right">
                  {formatPrice(amount_paid || record?.total_refund)}
                </Col>
              </Row>
              <Row className="text-red-500">
                <Col span={18}>{location.pathname.includes('return-order') ? 'Cần trả khách' : 'Khách cần trả'}</Col>
                <Col span={6} className="text-right">
                  {formatPrice(final_amount - amount_paid)}
                </Col>
              </Row>
            </div>
          </div>

          {/* Action Buttons */}
          {!location.pathname.includes('return-order') && <Row justify="space-between" align="middle" className="mt-6">
            <Col>
              {order_status === "Mới" &&
                <Button
                  color="primary"
                  variant="filled"
                  style={{ marginRight: 8 }}
                  onClick={() => onUpdateOrderStatus(order_id, "Xác nhận")}
                >
                  Xác nhận
                </Button>
              }
              <Button
                icon={<DeleteOutlined />}
                color="danger"
                variant="filled"
                style={{ marginRight: 8 }}
                onClick={() => onUpdateOrderStatus(order_id, "Huỷ đơn")}
              >
                Hủy
              </Button>
              <Button>Xuất file</Button>
            </Col>
            <Col>
              <Button
                icon={<EditOutlined />}
                type="primary"
                style={{ marginRight: 8 }}
                onClick={() => navigate(`/edit-order/${order_id}`)}
              >
                Chỉnh sửa
              </Button>
              <Button
                icon={<RollbackOutlined />}
                color="danger"
                variant="outlined"
                style={{ marginRight: 8 }}
                onClick={() => navigate(`/return-order/${order_id}`)}
              >
                Trả hàng
              </Button>
              <Button icon={<PrinterOutlined />}>In</Button>
            </Col>
          </Row>
          }
        </div> : <div></div>
      }
    </>
  );
}
