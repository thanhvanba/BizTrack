import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Select, InputNumber } from "antd";
import dayjs from "dayjs";
import customerService from "../../service/customerService";

const DebtAdjustmentModal = ({ open, onCancel, onSubmit, initialDebt, modalType = 'payment', context }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // Trả về đúng dữ liệu cần thiết cho parent
      setTimeout(() => {
        setLoading(false);
        onSubmit({
          adjustmentValue: values.adjustmentValue,
          description: values.description,
          paymentMethod: values.paymentMethod,
          type: values.type,
        });
        form.resetFields();
      }, 500);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const paymentMethods = [
    { label: "Tiền mặt", value: "cash" },
    { label: "Chuyển khoản", value: "bank_transfer" },
    { label: "Thẻ", value: "card" },
  ];

  // const getCategories = () => {
  //   if (modalType === 'receipt') {
  //     return [
  //       { label: "Thu tiền khách hàng", value: "customer_payment" },
  //       { label: "Thu tiền khác", value: "other_receipt" },
  //     ];
  //   } else {
  //     return [
  //       { label: "Chi trả nhà cung cấp", value: "supplier_payment" },
  //       { label: "Chi phí khác", value: "other_payment" },
  //     ];
  //   }
  // };

  const getCategories = () => {
    if (context === 'customer') {
      return [
        { label: "Tạo phiếu chi khách hàng", value: "adj_increase" },
        { label: "Tạo phiếu thu khách hàng", value: "adj_decrease" },
      ];
    }
  };

  const getTitle = () => {
    return modalType === 'receipt' ? 'Phiếu thu' : 'Phiếu chi';
  };

  return (
    <Modal
      title={<span className="text-xl font-bold">{getTitle()}</span>}
      open={open}
      onCancel={onCancel}
      width={650}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Tạo giao dịch
        </Button>,
      ]}
    >
      <div className="">
        {initialDebt !== undefined && (
          <h2 className="mb-4">Nợ cần trả hiện tại: {initialDebt?.toLocaleString()}₫</h2>
        )}
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign="left"
        >
          <Form.Item label="Số tiền" name="adjustmentValue" rules={[{ required: true, message: "Nhập số tiền!" }]}>
            <InputNumber
              min={0}
              step={1000}
              placeholder="Nhập số tiền"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item label="Phương thức" name="paymentMethod" initialValue="cash" rules={[{ required: true, message: "Chọn phương thức!" }]}>
            <Select options={paymentMethods} />
          </Form.Item>
          {context === 'customer' &&
            < Form.Item label="Loại giao dịch" name="type" rules={[{ required: true, message: "Chọn loại giao dịch!" }]}>
              <Select options={getCategories()} />
            </Form.Item>
          }
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>
        </Form>
      </div>
    </Modal >
  );
};

export default DebtAdjustmentModal;
