import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, DatePicker } from "antd";
import dayjs from "dayjs";

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
          <Form.Item label="Ngày điều chỉnh" name="adjustmentDate" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
            <DatePicker
              disabledDate={(current) => {
                return current && current > dayjs().endOf("day")
              }}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Giá trị nợ điều chỉnh" name="adjustmentValue" rules={[{ required: true, message: "Nhập số tiền điều chỉnh!" }]}>
            <Input type="number" placeholder="Nhập số tiền" />
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
