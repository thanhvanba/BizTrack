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
const { Title, Text } = Typography;

const OrderDetailDrawer = ({ open, onClose, order }) => {
  //   const [orderDetailsData, setOrderDetailsData] = useState();

  const [orderInfo, setOrderInfo] = useState(null); // Lưu thông tin đơn hàng
  const [orderDetailsData, setOrderDetailsData] = useState([]); // Lưu danh sách sản phẩm

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order);
    }
  }, [order]);

  const fetchOrderDetails = async (order) => {
    try {
      const response = await orderDetailService.getOrderDetailById(order);

      console.log("API Response:", response); // <-- vẫn đầy đủ thông tin ở đây

      // Lưu thông tin đơn hàng tổng quan
      setOrderInfo({
        order_id: response.order_id,
        order_code: response.order_code,
        order_date: response.order_date,
        order_status: response.order_status,
        total_amount: response.total_amount,
        final_amount: response.final_amount,
        customer: response.customer,
      });

      // Lưu danh sách sản phẩm
      setOrderDetailsData(
        Array.isArray(response.products)
          ? response.products.map((product) => ({
              ...product,
              key:
                product.product_id || Math.random().toString(36).substr(2, 9),
            }))
          : []
      );
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      useToastNotify("Không thể tải danh sách sản phẩm.", "error");
    }
  };

  console.log(orderInfo);

  if (!order) return null;
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Get status color
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

  // Mock order items
  const orderItems = [
    {
      id: 1,
      name: "iPhone 14 Pro",
      price: 28000000,
      quantity: 1,
      total: 28000000,
    },
    {
      id: 2,
      name: "Ốp lưng iPhone 14 Pro",
      price: 500000,
      quantity: 1,
      total: 500000,
    },
  ];

  // Table columns
  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
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
      width={700}
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
            {orderInfo?.order_date}
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
            <Text strong>{formatPrice(orderInfo?.total_amount)}</Text>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <Title level={5}>Chi tiết sản phẩm</Title>
      <Table
        columns={columns}
        dataSource={orderDetailsData}
        rowKey="id"
        pagination={false}
        summary={(pageData) => {
          let totalPrice = 0;
          pageData.forEach(({ total }) => {
            totalPrice += total;
          });

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
                  <Text strong>Phí vận chuyển:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} className="text-right">
                  <Text strong>{formatPrice(30000)}</Text>
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
                    {formatPrice(
                      parseFloat(orderInfo?.total_amount || 0) + 30000
                    )}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />

      <Divider />

      <Descriptions title="Thông tin giao hàng" column={{ xs: 1, sm: 1 }}>
        <Descriptions.Item label="Người nhận">Nguyễn Văn A</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">0901234567</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ">
          123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          Thanh toán khi nhận hàng (COD)
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú">
          Gọi điện trước khi giao hàng
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Descriptions title="Lịch sử đơn hàng" column={{ xs: 1, sm: 1 }}>
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
      </Descriptions>
    </Drawer>
  );
};

export default OrderDetailDrawer;
