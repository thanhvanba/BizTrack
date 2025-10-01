import React, { useState } from "react";
import {
  Table,
  Typography,
  Row,
  Col,
  Button,
  Tag,
  Input,
  Divider,
  Tooltip,
  Spin,
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
  CopyOutlined,
  SaveOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

import formatPrice from "../../utils/formatPrice";
import { useLocation, useNavigate } from "react-router-dom";
import PrintInvoice from "../PrintInvoice";
import {
  convertInvoiceToImageAndCopy,
  convertInvoiceToImageAndSave,
  convertInvoiceToImageAndShare
} from "../../utils/invoiceToImageUtils";
import { message } from "antd";
import { COMPANY } from "../../config/companyConfig";

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
    remaining_value,
    total_refund,
    amoutPayment,
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
    // Cột VAT chỉ hiển thị khi không phải return order
    ...(location.pathname.includes('return-order') ?
      [{
        title: "Giá trả",
        dataIndex: "item_return_price",
        key: "item_return_price",
        align: "right",
        render: (price) => formatPrice(price),
      }] : [{
        title: "Giá bán",
        dataIndex: "price",
        key: "price_sale",
        align: "right",
        render: (price) => formatPrice(price),
      },
      {
        title: "VAT",
        key: "vat",
        align: "center",
        render: (_, record) => {
          const subtotal = (record.quantity || 0) * (record.price || 0);
          const afterDiscount = subtotal - (record.discount || 0);
          const vatAmount = afterDiscount * (record.vat_rate || 0) / 100;
          return (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>{record.vat_rate || 0}%</div>
              <div style={{ fontSize: '13px', fontWeight: '500' }}>{formatPrice(vatAmount)}</div>
            </div>
          );
        },
      },
      {
        title: "Thành tiền",
        key: "total",
        align: "right",
        render: (_, record) => {
          const subtotal = (record.quantity || 0) * (record.price || 0);
          const discount = record.discount || 0;
          const afterDiscount = subtotal - discount;
          const vatAmount = afterDiscount * (record.vat_rate || 0) / 100;
          const total = afterDiscount + vatAmount;
          return formatPrice(total);
        },
      }]),

  ];

  const totalQuantity = location.pathname.includes('return-order') ? data?.details?.reduce((sum, item) => sum + item.quantity, 0) : products?.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductDiscount = products?.reduce(
    (sum, item) => sum + item.discount, 0
  );

  // Tính tổng VAT
  const totalVatAmount = products?.reduce((sum, item) => {
    const subtotal = (item.quantity || 0) * (item.price || 0);
    const discount = item.discount || 0;
    const afterDiscount = subtotal - discount;
    const vatAmount = afterDiscount * (item.vat_rate || 0) / 100;
    return sum + vatAmount;
  }, 0) || 0;

  // Debug log để kiểm tra VAT
  console.log("🚀 ~ OrderInfoTab ~ totalVatAmount:", totalVatAmount);
  console.log("🚀 ~ OrderInfoTab ~ products:", products);

  // Kiểm tra từng sản phẩm có VAT không
  products?.forEach((item, index) => {
    const subtotal = (item.quantity || 0) * (item.price || 0);
    const discount = item.discount || 0;
    const afterDiscount = subtotal - discount;
    const vatAmount = afterDiscount * (item.vat_rate || 0) / 100;
    console.log(`🚀 ~ Product ${index}:`, {
      name: item.product_name,
      vat_rate: item.vat_rate,
      vatAmount: vatAmount,
      subtotal,
      discount,
      afterDiscount
    });
  });

  // Xác định colSpan dựa trên việc có cột VAT hay không
  const hasVatColumn = !location.pathname.includes('return-order');
  const summaryColSpan = hasVatColumn ? 6 : 4;

  // Convert order data to invoice data for printing
  const convertOrderToInvoice = () => {
    const isReturnOrder = location.pathname.includes('return-order');
    const orderItems = isReturnOrder ? data?.details : products;

    return {
      invoiceNumber: order_code || data?.return_id,
      date: new Date(order_date || data?.created_at).toLocaleDateString("vi-VN"),
      customer: {
        name: customer?.customer_name || data?.customer_name,
        phone: customer?.phone || data?.phone || '--',
        address: shipping_address || '--'
      },
      company: {
        name: COMPANY.name,
        phone: COMPANY.phone,
        address: COMPANY.address
      },
      items: orderItems?.map(item => {
        const subtotal = (item.quantity || 0) * (isReturnOrder ? item.refund_amount : item.price);
        const discount = item.discount || 0;
        const afterDiscount = subtotal - discount;
        const vatAmount = afterDiscount * (item.vat_rate || 0) / 100;
        const total = afterDiscount + vatAmount;

        return {
          name: item.product_name,
          unitPrice: isReturnOrder ? item.refund_amount : item.price,
          quantity: item.quantity,
          vatRate: item.vat_rate || 0,
          vatAmount: vatAmount,
          amount: isReturnOrder ? item.refund_amount : total
        };
      }) || [],
      total: total_amount || record?.total_refund,
      subtotal: (total_amount || record?.total_refund) - totalVatAmount,
      discount: totalProductDiscount + order_amount || 0,
      totalVat: totalVatAmount,
      shippingFee: shipping_fee || 0,
      amountPaid: amount_paid || 0,
      note: note || data?.note || '',
      finalTotal: final_amount || record?.total_refund
    };
  };

  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  const handlePrint = () => {
    setIsPrintModalVisible(true);
  };

  const handleCopyImage = async () => {
    if (isCopyingImage) return; // Prevent multiple clicks

    setIsCopyingImage(true);

    try {
      const invoiceData = convertOrderToInvoice();
      const success = await convertInvoiceToImageAndCopy(
        invoiceData,
        location.pathname.includes('return-order') ? 'sale_return' : 'sale'
      );

      if (success) {
        message.success({
          content: '✅ Đã copy hình ảnh hóa đơn vào clipboard! Bạn có thể paste vào chat để gửi cho khách hàng.',
          duration: 4,
        });
      } else {
        message.error('❌ Không thể copy hình ảnh vào clipboard. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error copying invoice image:', error);
      message.error('❌ Lỗi khi chuyển đổi hóa đơn: ' + error.message);
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleSaveImage = async () => {
    if (isSavingImage) return; // Prevent multiple clicks

    setIsSavingImage(true);

    try {
      const invoiceData = convertOrderToInvoice();
      const success = await convertInvoiceToImageAndSave(
        invoiceData,
        location.pathname.includes('return-order') ? 'sale_return' : 'sale'
      );

      if (success) {
        message.success({
          content: '💾 Đã lưu hình ảnh hóa đơn vào thiết bị!',
          duration: 4,
        });
      } else {
        message.error('❌ Không thể lưu hình ảnh. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error saving invoice image:', error);
      message.error('❌ Lỗi khi lưu hóa đơn: ' + error.message);
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleShareImage = async () => {
    if (isSharingImage) return; // Prevent multiple clicks

    setIsSharingImage(true);

    try {
      const invoiceData = convertOrderToInvoice();
      const success = await convertInvoiceToImageAndShare(
        invoiceData,
        location.pathname.includes('return-order') ? 'sale_return' : 'sale'
      );

      if (success) {
        message.success({
          content: '📤 Đã share hóa đơn lên mạng xã hội!',
          duration: 4,
        });
      } else {
        message.error('❌ Không thể share hóa đơn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error sharing invoice image:', error);
      message.error('❌ Lỗi khi share hóa đơn: ' + error.message);
    } finally {
      setIsSharingImage(false);
    }
  };

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
                {order_status
                  ? (<Tag color="green">{order_status}</Tag>)
                  : (
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
              <Text strong>
                {`${order_date ? 'Ngày giao:' : 'Ngày trả:'}`}
                {new Date(order_date || data?.created_at).toLocaleDateString("vi-VN")}
              </Text>
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
                  <Table.Summary.Cell index={0} colSpan={summaryColSpan} align="">
                    <Text strong>{`Tổng tiền hàng (${totalQuantity})`}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <Text strong>{formatPrice(total_amount || record?.total_refund)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={summaryColSpan} align="">
                    Giảm giá hóa đơn + Tổng giảm giá sản phẩm
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} className="text-green-600" align="right">{`${formatPrice(order_amount)} + ${formatPrice(totalProductDiscount)}`}</Table.Summary.Cell>
                </Table.Summary.Row>
                {!location.pathname.includes('return-order') && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={summaryColSpan} align="">
                      VAT
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} className="text-blue-600" align="right">{formatPrice(totalVatAmount)}</Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={summaryColSpan} align="">
                    Phí vận chuyển
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} className="text-red-600" align="right">{formatPrice(shipping_fee)}</Table.Summary.Cell>
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
                  {formatPrice((amount_paid))}
                </Col>
              </Row>
              <Row className="text-red-500">
                <Col span={18}>{location.pathname.includes('return-order') ? 'Cần trả khách' : 'Khách cần trả'}</Col>
                <Col span={6} className="text-right">
                  {formatPrice((final_amount - amount_paid) || record?.total_refund)}
                </Col>
              </Row>
            </div>
          </div>

          {/* Action Buttons */}
          <Row justify="space-between" align="middle" className="mt-6">

            {!location.pathname.includes('return-order') &&
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
                {(order_status !== "Hoàn tất" && order_status !== "Huỷ đơn") &&
                  <Button
                    icon={<DeleteOutlined />}
                    color="danger"
                    variant="filled"
                    style={{ marginRight: 8 }}
                    onClick={() => onUpdateOrderStatus(order_id, "Huỷ đơn")}
                  >
                    Hủy
                  </Button>
                }
                {/* <Button>Xuất file</Button> */}
              </Col>

            }
            <Col>
              {order_status === "Mới" &&
                <Button
                  icon={<EditOutlined />}
                  type="primary"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/edit-order/${order_id}`)}
                >
                  Chỉnh sửa
                </Button>
              }
              {order_status === "Hoàn tất" && (
                <Tooltip
                  title={
                    (final_amount - total_refund) <= 0
                      ? "Không có mặt hàng để hoàn trả đối với hóa đơn này"
                      : ""
                  }
                >
                  <span>
                    <Button
                      icon={<RollbackOutlined />}
                      danger
                      type="default"
                      style={{ marginRight: 8 }}
                      disabled={(final_amount - total_refund) <= 0}
                      onClick={() => navigate(`/return-order/${order_id}`)}
                    >
                      Trả hàng
                    </Button>
                  </span>
                </Tooltip>
              )}

              <Button
                icon={isCopyingImage ? <Spin size="small" /> : <CopyOutlined />}
                onClick={handleCopyImage}
                loading={isCopyingImage}
                disabled={isCopyingImage || isSavingImage || isSharingImage}
                style={{ marginRight: 8 }}
                title={isCopyingImage ? "Đang chuyển đổi hóa đơn thành hình ảnh..." : "Copy hình ảnh hóa đơn để gửi cho khách hàng"}
              >
                {isCopyingImage ? 'Đang xử lý...' : 'Copy hình ảnh'}
              </Button>


              <Button
                icon={isSavingImage ? <Spin size="small" /> : <SaveOutlined />}
                onClick={handleSaveImage}
                loading={isSavingImage}
                disabled={isCopyingImage || isSavingImage || isSharingImage}
                style={{ marginRight: 8 }}
                title={isSavingImage ? "Đang lưu hình ảnh hóa đơn..." : "Lưu hình ảnh hóa đơn vào thiết bị"}
              >
                {isSavingImage ? 'Đang lưu...' : 'Lưu ảnh'}
              </Button>
              <span className="lg:hidden">
                <Button
                  icon={isSharingImage ? <Spin size="small" /> : <ShareAltOutlined />}
                  onClick={handleShareImage}
                  loading={isSharingImage}
                  disabled={isCopyingImage || isSavingImage || isSharingImage}
                  style={{ marginRight: 8 }}
                  title={isSharingImage ? "Đang share hóa đơn..." : "Share hóa đơn lên mạng xã hội"}
                >
                  {isSharingImage ? 'Đang share...' : 'Share'}
                </Button>
              </span>

              <Button
                color="primary"
                variant="outlined"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                disabled={isCopyingImage || isSavingImage || isSharingImage}
              >
                In
              </Button>
            </Col>
          </Row>
        </div> : <div></div>
      }

      {/* Print Invoice Component */}
      <PrintInvoice
        visible={isPrintModalVisible}
        onClose={() => setIsPrintModalVisible(false)}
        invoiceData={convertOrderToInvoice()}
        type={location.pathname.includes('return-order') ? 'sale_return' : 'sale'}
      />
    </>
  );
}
