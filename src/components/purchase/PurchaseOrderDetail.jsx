import { Card, Row, Col, Typography, Table, Divider, Button, Spin, message } from "antd";
import { CopyOutlined, PrinterOutlined, SaveOutlined, ShareAltOutlined } from "@ant-design/icons";
import formatPrice from "../../utils/formatPrice";
import PrintInvoice from "../PrintInvoice";
import {
  convertInvoiceToImageAndCopy,
  convertInvoiceToImageAndSave,
  convertInvoiceToImageAndShare
} from "../../utils/invoiceToImageUtils";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { COMPANY } from "../../config/companyConfig";

const { Title, Text } = Typography;

export default function PurchaseOrderDetail({ order }) {
  const location = useLocation();
  console.log("🚀 ~ PurchaseOrderDetail ~ order:", order)
  const [printInvoiceVisible, setPrintInvoiceVisible] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState(false);

  const totalAmount = order?.details?.reduce((sum, detail) => {
    const subtotal = detail.quantity * (detail.price ?? detail.item_return_price);
    const vatAmount = subtotal * (detail.vat_rate || 0) / 100;
    return sum + subtotal + vatAmount;
  }, 0);

  const subtotalAmount = order?.details?.reduce((sum, detail) => sum + detail.quantity * (detail.price ?? detail.item_return_price), 0);
  const totalVatAmount = order?.details?.reduce((sum, detail) => {
    const subtotal = detail.quantity * (detail.price ?? detail.item_return_price);
    return sum + (subtotal * (detail.vat_rate || 0) / 100);
  }, 0);

  // Chuẩn hóa dữ liệu hóa đơn nhập hàng cho PrintInvoice
  const purchaseInvoiceData = order ? {
    invoiceNumber: order.po_id || order.return_id,
    date: order.posted_at ? new Date(order.posted_at).toLocaleString() : new Date(order.created_at).toLocaleString(),
    customer: {
      name: order.supplier_name,
      phone: order.supplier_phone || '',
      address: order.supplier_address || '',
    },
    company: {
      name: COMPANY.name,
      phone: COMPANY.phone,
      address: order.warehouse_name ? `${order.warehouse_name}` : COMPANY.address,
    },
    items: (order.details || []).map(detail => {
      const subtotal = (detail.quantity || 0) * (detail.price ?? detail.refund_amount);
      const vatAmount = subtotal * (detail.vat_rate || 0) / 100;
      return {
        name: detail.product_name,
        unitPrice: detail.price ?? detail.refund_amount,
        quantity: detail.quantity,
        vatRate: detail.vat_rate || 0,
        vatAmount: vatAmount,
        amount: subtotal + vatAmount,
      };
    }),
    subtotal: subtotalAmount,
    totalVat: totalVatAmount,
    total: totalAmount,
    discount: order.discount || 0,
    shippingFee: order.shipping_fee || 0,
    amountPaid: order.amount_paid || 0,
    note: order.note,
    finalTotal: (totalAmount - (order.discount || 0) + (order.shipping_fee || 0)),
  } : null;

  const handleCopyImage = async () => {
    if (isCopyingImage) return; // Prevent multiple clicks

    setIsCopyingImage(true);

    try {
      const success = await convertInvoiceToImageAndCopy(
        purchaseInvoiceData,
        location.pathname.includes('purchase-return') ? 'purchase_return' : 'purchase'
      );

      if (success) {
        message.success({
          content: '✅ Đã copy hình ảnh hóa đơn nhập hàng vào clipboard! Bạn có thể paste vào chat để gửi cho nhà cung cấp.',
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
      const success = await convertInvoiceToImageAndSave(
        purchaseInvoiceData,
        location.pathname.includes('purchase-return') ? 'purchase_return' : 'purchase'
      );

      if (success) {
        message.success({
          content: '💾 Đã lưu hình ảnh hóa đơn nhập hàng vào thiết bị!',
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
      const success = await convertInvoiceToImageAndShare(
        purchaseInvoiceData,
        location.pathname.includes('purchase-return') ? 'purchase_return' : 'purchase'
      );

      if (success) {
        message.success({
          content: '📤 Đã share hóa đơn nhập hàng lên mạng xã hội!',
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
      render: (_, detail) => formatPrice(detail.price ?? detail.item_return_price),
    },
    {
      title: "VAT",
      key: "vat",
      align: "center",
      render: (_, detail) => {
        const subtotal = (detail.quantity || 0) * (detail.price ?? detail.item_return_price);
        const vatAmount = subtotal * (detail.vat_rate || 0) / 100;
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666' }}>{detail.vat_rate || 0}%</div>
            <div style={{ fontSize: '13px', fontWeight: '500' }}>{formatPrice(vatAmount)}</div>
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
      render: (_, detail) => {
        const subtotal = (detail.quantity || 0) * (detail.price ?? detail.item_return_price);
        const vatAmount = subtotal * (detail.vat_rate || 0) / 100;
        return formatPrice(subtotal + vatAmount);
      },
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
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${order?.status === "draft" || order?.status === "pending"
                ? "bg-orange-100 text-orange-800"
                : "bg-green-100 text-green-800"
                }`}
            >
              {order?.status === "draft" || order?.status === "pending" ? "Chờ duyệt" :
                order?.status === "approved" ? "Đã trả" :
                  order?.status === "posted" ? "Đã nhập" : "Đã nhập"}
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
          <>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={5} align="right" style={{ paddingTop: '12px' }}>
                <Text strong>Tạm tính:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell align="right" style={{ paddingTop: '12px' }}>
                <Text strong>{formatPrice(subtotalAmount)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={5} align="right">
                <Text strong>VAT:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell align="right">
                <Text strong>{formatPrice(totalVatAmount)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={5} align="right" style={{ paddingBottom: '12px' }}>
                <Text strong>Tổng giá trị:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell align="right" style={{ paddingBottom: '12px' }}>
                <Text strong className="text-xl">{formatPrice(totalAmount)}</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </>
        )}
      />

      <div className="mt-4 flex gap-3">
        <Button
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => setPrintInvoiceVisible(true)}
          disabled={isCopyingImage || isSavingImage || isSharingImage}
        >
          In hóa đơn
        </Button>
        <Button
          icon={isCopyingImage ? <Spin size="small" /> : <CopyOutlined />}
          onClick={handleCopyImage}
          loading={isCopyingImage}
          disabled={isCopyingImage || isSavingImage || isSharingImage}
          title={isCopyingImage ? "Đang chuyển đổi hóa đơn thành hình ảnh..." : "Copy hình ảnh hóa đơn để gửi cho nhà cung cấp"}
        >
          {isCopyingImage ? 'Đang xử lý...' : 'Copy hình ảnh'}
        </Button>

        <Button
          icon={isSavingImage ? <Spin size="small" /> : <SaveOutlined />}
          onClick={handleSaveImage}
          loading={isSavingImage}
          disabled={isCopyingImage || isSavingImage || isSharingImage}
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
            title={isSharingImage ? "Đang share hóa đơn..." : "Share hóa đơn lên mạng xã hội"}
          >
            {isSharingImage ? 'Đang share...' : 'Share'}
          </Button>
        </span>
      </div>

      <PrintInvoice
        visible={printInvoiceVisible}
        onClose={() => setPrintInvoiceVisible(false)}
        invoiceData={purchaseInvoiceData}
        type={location.pathname.includes('purchase-return') ? 'purchase_return' : 'purchase'}
      />
    </Card>
  );
}
