import {
  Drawer,
  Descriptions,
  Table,
  Tag,
  Button,
  Divider,
  Typography,
  Space,
} from "antd";
import { PrinterOutlined, DownloadOutlined } from "@ant-design/icons";
import orderDetailService from "../../service/orderDetailService";
import { useEffect, useState } from "react";
import useToastNotify from "../../utils/useToastNotify";
import formatPrice from '../../utils/formatPrice'

const { Title, Text } = Typography;

const OrderDetailDrawer = ({ open, onClose, order }) => {
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderDetailsData, setOrderDetailsData] = useState([]);

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order);
    }
  }, [order]);

  // const fetchOrderDetails = async (orderId) => {
  //   try {
  //     const response = await orderDetailService.getOrderDetailById(orderId);
  //     setOrderInfo(response);
  //     const productsWithTotal = response.products.map((product) => {
  //       // chuyển price sang số float rồi nhân với quantity
  //       const total = parseFloat(product.price) * product.quantity - product.discount;
  //       return {
  //         ...product,
  //         total,
  //       };
  //     });
  //     setOrderDetailsData(productsWithTotal);
  //   } catch (error) {
  //     console.error("Lỗi khi tải chi tiết đơn hàng:", error);
  //     useToastNotify("Không thể tải danh sách sản phẩm.", "error");
  //   }
  // };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await orderDetailService.getOrderDetailById(orderId);
      setOrderInfo(response);

      const productsWithPriceBreakdown = response.products.map((product) => {
        // const originalPrice = parseFloat(product.price) || 0;
        // const discountAmount = parseFloat(product.discount) || 0;
        // const discountedPrice = originalPrice - discountAmount;

        return {
          ...product,
          total: product.price * product.quantity - product.discount,
        };
      });

      setOrderDetailsData(productsWithPriceBreakdown);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      useToastNotify("Không thể tải danh sách sản phẩm.", "error");
    }
  };

  function calculateTotalDiscount(orderDetailsData) {
    if (!Array.isArray(orderDetailsData)) return 0;

    return orderDetailsData.reduce((total, item) => {
      const discount = parseFloat(item.discount) || 0;
      return total + discount;
    }, 0);
  }

  const totalProductDiscount = calculateTotalDiscount(orderDetailsData);

  if (!order) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao":
        return "success";
      case "Đang giao":
        return "processing";
      case "Đang xử lý":
        return "warning";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => formatPrice(price),
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
      title: "Thành tiền",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (total) => formatPrice(total),
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center">
          <span>Chi tiết đơn hàng {orderInfo?.order_code}</span>
          {orderInfo && (
            <Tag color={getStatusColor(orderInfo.order_status)}>
              {orderInfo.order_status}
            </Tag>
          )}
        </div>
      }
      width={1200}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button icon={<PrinterOutlined />}>In</Button>
          <Button icon={<DownloadOutlined />}>Xuất PDF</Button>
        </Space>
      }
    >
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <Descriptions
          title="Thông tin đơn hàng"
          column={{ xs: 1, sm: 2 }}
          bordered
        >
          <Descriptions.Item label="Mã đơn hàng">
            {orderInfo?.order_code}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">
            {new Date(orderInfo?.order_date).toLocaleDateString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {orderInfo?.customer?.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={getStatusColor(orderInfo?.order_status)}>
              {orderInfo?.order_status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Text strong>{formatPrice(orderInfo?.final_amount)}</Text>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Title level={5}>Chi tiết sản phẩm</Title>
      <Table
        columns={columns}
        dataSource={orderDetailsData}
        rowKey="key"
        pagination={false}
        summary={(pageData) => {

          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  <Text strong>Tổng tiền sản phẩm:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong>{formatPrice(orderInfo?.total_amount)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  <Text strong>Giảm giá trên đơn:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong>{formatPrice(orderInfo?.order_amount)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  <Text strong>Tổng giảm giá sản phẩm:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong>{formatPrice(totalProductDiscount)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>

              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  <Text strong>Phí vận chuyển:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong>{formatPrice(orderInfo?.shipping_fee)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={0}
                  colSpan={3}
                  className="text-right"
                >
                  <Text strong>Tổng thanh toán:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong className="text-lg text-blue-600">
                    {formatPrice(orderInfo?.final_amount)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />

      <Divider />

      <Descriptions title="Thông tin giao hàng" column={{ xs: 1, sm: 1 }}>
        <Descriptions.Item label="Người nhận">
          {orderInfo?.customer?.customer_name}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {orderInfo?.customer?.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          {orderInfo?.shipping_address}
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {orderInfo?.payment_method}
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          {orderInfo?.note || 'Không'}
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* <Descriptions title="Lịch sử đơn hàng" column={{ xs: 1, sm: 1 }}>
        <Descriptions.Item label="15/05/2023 - 10:30">
          Đơn hàng đã được tạo
        </Descriptions.Item>
        <Descriptions.Item label="15/05/2023 - 11:15">
          Đơn hàng đã được xác nhận
        </Descriptions.Item>
        <Descriptions.Item label="15/05/2023 - 14:20">
          Đơn hàng đang được giao
        </Descriptions.Item>
        <Descriptions.Item label="15/05/2023 - 17:45">
          Đơn hàng đã giao thành công
        </Descriptions.Item>
      </Descriptions> */}
    </Drawer>
  );
};

export default OrderDetailDrawer;
