import {
  Drawer,
  Descriptions,
  Table,
  Tag,
  Button,
  Divider,
  Typography,
  Space,
  Checkbox,
  List,
  Tabs,
} from "antd";
import { PrinterOutlined, DownloadOutlined, MoneyCollectOutlined } from "@ant-design/icons";
import orderDetailService from "../../service/orderDetailService";
import { useEffect, useState } from "react";
import useToastNotify from "../../utils/useToastNotify";
import formatPrice from '../../utils/formatPrice'

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OrderDetailDrawer = ({ open, onClose, order }) => {
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderDetailsData, setOrderDetailsData] = useState([]);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState({
    income: [
      {
        id: 1,
        amount: 350000,
        date: "10:23 15/05",
        payer: "Văn Bá Trung Thành",
        description: "Thanh toán cho đơn hàng #1",
      },
      {
        id: 2,
        amount: 350000,
        date: "14:42 06/03",
        payer: "Nguyen Kim An",
        description: "Thanh toán cho đơn hàng #1",
      }
    ],
    expense: [],
    debt: [
      {
        id: 1,
        amount: 500000,
        date: "08:15 20/05",
        customer: "Trần Văn A",
        description: "Công nợ đơn hàng #2",
        status: "Chưa thanh toán"
      }
    ]
  });

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order);
      // Fetch actual payment data here
    }
  }, [order]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await orderDetailService.getOrderDetailById(orderId);
      setOrderInfo(response);

      const productsWithPriceBreakdown = response.products.map((product) => {
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

  const PaymentHistoryDrawer = () => (
    <Drawer
      title="Quản lý thu chi & công nợ"
      width={600}
      placement="right"
      onClose={() => setPaymentDrawerVisible(false)}
      open={paymentDrawerVisible}
      footer={
        <div className="flex justify-between">
          <Button type="primary">Thêm mới</Button>
          <div>
            <span className="mr-4">Tổng thu: <Text strong>{formatPrice(paymentHistory.income.reduce((sum, item) => sum + item.amount, 0))}</Text></span>
            <span>Tổng chi: <Text strong>{formatPrice(paymentHistory.expense.reduce((sum, item) => sum + item.amount, 0))}</Text></span>
          </div>
        </div>
      }
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Thu - Chi" key="1">
          <div className="mb-6">
            <Title level={5} className="mb-2">Thu</Title>
            {paymentHistory.income.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={paymentHistory.income}
                renderItem={(item) => (
                  <List.Item
                    actions={[<a key="edit">Sửa</a>, <a key="delete">Xóa</a>]}
                  >
                    <List.Item.Meta
                      avatar={<Checkbox />}
                      title={<span className="font-medium">{formatPrice(item.amount)}</span>}
                      description={
                        <>
                          <div>{item.payer}</div>
                          <div className="text-gray-500">{item.description}</div>
                          <div className="text-gray-400 text-sm">{item.date}</div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-gray-400 text-center py-4">Không có dữ liệu thu</div>
            )}
          </div>

          <div>
            <Title level={5} className="mb-2">Chi</Title>
            {paymentHistory.expense.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={paymentHistory.expense}
                renderItem={(item) => (
                  <List.Item
                    actions={[<a key="edit">Sửa</a>, <a key="delete">Xóa</a>]}
                  >
                    <List.Item.Meta
                      avatar={<Checkbox />}
                      title={<span className="font-medium text-red-500">-{formatPrice(item.amount)}</span>}
                      description={
                        <>
                          <div>{item.recipient}</div>
                          <div className="text-gray-500">{item.description}</div>
                          <div className="text-gray-400 text-sm">{item.date}</div>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-gray-400 text-center py-4">Không có dữ liệu chi</div>
            )}
          </div>
        </TabPane>

        <TabPane tab="Công nợ" key="2">
          {paymentHistory.debt.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={paymentHistory.debt}
              renderItem={(item) => (
                <List.Item
                  actions={[<a key="edit">Sửa</a>, <a key="pay">Thanh toán</a>]}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex justify-between">
                        <span className="font-medium">{formatPrice(item.amount)}</span>
                        <Tag color={item.status === "Chưa thanh toán" ? "orange" : "green"}>
                          {item.status}
                        </Tag>
                      </div>
                    }
                    description={
                      <>
                        <div>{item.customer}</div>
                        <div className="text-gray-500">{item.description}</div>
                        <div className="text-gray-400 text-sm">{item.date}</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className="text-gray-400 text-center py-4">Không có công nợ</div>
          )}
        </TabPane>
      </Tabs>
    </Drawer>
  );

  return (
    <>
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
            <Button 
              icon={<MoneyCollectOutlined />} 
              onClick={() => setPaymentDrawerVisible(true)}
            >
              Thu chi & Công nợ
            </Button>
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
      </Drawer>

      <PaymentHistoryDrawer />
    </>
  );
};

export default OrderDetailDrawer;