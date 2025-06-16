import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Select, Checkbox, Table } from "antd";

const PaymentModal = ({ open, onCancel, onSubmit, initialDebt }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const invoiceData = [
    { key: "1", invoice_code: "PN000047", date: "16/06/2025 14:42", invoice_value: 50000000, paid: 29000000, remaining: 21000000 },
    { key: "2", invoice_code: "PN000048", date: "16/06/2025 14:47", invoice_value: 20000000, paid: 0, remaining: 20000000 },
    { key: "3", invoice_code: "PN000049", date: "16/06/2025 15:36", invoice_value: 60000000, paid: 20000000, remaining: 40000000 },
  ];

  const columns = [
    { title: "Mã hóa đơn", dataIndex: "invoice_code", key: "invoice_code" },
    { title: "Thời gian", dataIndex: "date", key: "date" },
    { title: "Giá trị phiếu nhập", dataIndex: "invoice_value", key: "invoice_value", align: "right", render: val => `${val.toLocaleString()}₫` },
    { title: "Đã trả trước", dataIndex: "paid", key: "paid", align: "right", render: val => `${val.toLocaleString()}₫` },
    { title: "Còn cần trả", dataIndex: "remaining", key: "remaining", align: "right", render: val => `${val.toLocaleString()}₫` },
  ];

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSubmit(values);
        form.resetFields();
      }, 500);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title="Thanh toán"
      open={open}
      onCancel={onCancel}
      style={{ top: 20 }}
      width={960}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>Bỏ qua</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Tạo phiếu chi
        </Button>,
      ]}
    >
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Cửa hàng Đại Việt</h2>
        <h3 className="text-md font-semibold mb-2">Nợ hiện tại: {initialDebt.toLocaleString()}₫</h3>
        <div className="h-[64vh] overflow-y-auto">

          <Form form={form} layout="vertical" className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Thời gian" name="paymentDate" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
              <DatePicker className="w-full" showTime />
            </Form.Item>

            <Form.Item label="Người chi" name="payer" rules={[{ required: true, message: "Nhập tên người chi!" }]}>
              <Input placeholder="Nhập tên người chi" />
            </Form.Item>

            <Form.Item label="Phương thức thanh toán" name="paymentMethod" rules={[{ required: true, message: "Chọn phương thức thanh toán!" }]}>
              <Select className="w-full">
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Số tiền thanh toán" name="paymentAmount" rules={[{ required: true, message: "Nhập số tiền thanh toán!" }]}>
              <Input type="number" placeholder="Nhập số tiền" />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes" className="col-span-2">
              <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
            </Form.Item>

            <Form.Item name="allocateInvoice" valuePropName="checked">
              <Checkbox>Phân bổ vào phiếu nhập hàng</Checkbox>
            </Form.Item>
          </Form>

          <Table columns={columns} dataSource={invoiceData} pagination={false} size="small" className="mt-4" />
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
