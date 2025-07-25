import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import customerService from "../../service/customerService";

const DebtAdjustmentModal = ({ open, onCancel, onSubmit, initialDebt }) => {
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
  const categories = [
    { label: "Hoàn tiền khách trả hàng", value: "customer_refund" },
    { label: "Điều chỉnh khác", value: "other_adjustment" },
  ];

  return (
    <Modal
      title="Điều chỉnh"
      open={open}
      onCancel={onCancel}
      width={650}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Cập nhật
        </Button>,
      ]}
    >
      <div className="">
        <h2 className="text-lg mb-4">Nợ cần trả hiện tại: {initialDebt.toLocaleString()}₫</h2>
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          labelAlign="left"
        >
          <Form.Item label="Số tiền điều chỉnh" name="adjustmentValue" rules={[{ required: true, message: "Nhập số tiền điều chỉnh!" }]}>
            <Input type="number" placeholder="Nhập số tiền" />
          </Form.Item>
          <Form.Item label="Phương thức" name="paymentMethod" initialValue="cash" rules={[{ required: true, message: "Chọn phương thức!" }]}>
            <Select options={paymentMethods} />
          </Form.Item>
          <Form.Item label="Loại điều chỉnh" name="category" initialValue="customer_refund" rules={[{ required: true, message: "Chọn loại điều chỉnh!" }]}>
            <Select options={categories} />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default DebtAdjustmentModal;
