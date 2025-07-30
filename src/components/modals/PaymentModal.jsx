import { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Select, Table, InputNumber, message } from "antd";
import formatPrice from "../../utils/formatPrice";
import useToastNotify from "../../utils/useToastNotify";

const PaymentModal = ({ open, onCancel, onSubmit, unpaidInvoice, initialDebt, customerName }) => {
  console.log("🚀 ~ PaymentModal ~ unpaidInvoice:", unpaidInvoice)
  console.log("🚀 ~ PaymentModal ~ initialDebt:", initialDebt)
  console.log("🚀 ~ PaymentModal ~ customerName:", customerName)
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(unpaidInvoice || []);
  console.log("🚀 ~ PaymentModal ~ dataSource:", dataSource)

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        method: "cash",
        paymentAmount: 0,
        notes: ""
      });

      setDataSource((unpaidInvoice || []).map(item => ({ ...item })));
    }
  }, [open, unpaidInvoice]); // 👈 thêm unpaidInvoice vào dependency

  // Khi người dùng nhập tiền vào từng dòng
  const handleChangeReceipt = (value, index) => {
    const newData = [...dataSource];
    newData[index].current_receipt = value;
    setDataSource(newData);
  };

  const allocatePayment = (totalAmount) => {
    let remaining = totalAmount;

    const newData = dataSource.map(item => {
      const remainingReceivable = item.remaining_receivable;
      let toPay = 0;

      if (remaining > 0) {
        toPay = Math.min(remaining, remainingReceivable);
        remaining -= toPay;
      }

      return {
        ...item,
        current_receipt: toPay
      };
    });

    setDataSource(newData);
  };

  // Format dữ liệu gửi đi
  const formatPayload = (formValues, invoiceList) => {
    const payments = invoiceList
      .filter(i => i.current_receipt && i.current_receipt > 0)
      .map(i => ({
        invoice_id: i.invoice_id,
        amount: i.current_receipt
      }));

    return {
      method: formValues.method,
      payments
    };
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = formatPayload(values, dataSource);

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSubmit(payload);
        useToastNotify("Tạo phiếu thu thành công!", "success");

        form.resetFields();
        const resetData = dataSource.map(item => ({
          ...item,
          current_receipt: 0
        }));
        setDataSource(resetData);
        onCancel(); // đóng modal sau khi tạo
      }, 500);
    } catch (error) {
      console.error("Validation failed:", error);
      if (error.errorFields?.length) {
        form.scrollToField(error.errorFields[0].name);
      }
    }
  };

  const columns = [
    { title: "Mã hóa đơn", dataIndex: "invoice_code", key: "invoice_code" },
    {
      title: "Thời gian", dataIndex: "issued_date", key: "issued_date",
      render: val => `${new Date(val).toLocaleString("vi-VN")}`
    },
    {
      title: "Giá trị hóa đơn", dataIndex: "final_amount", key: "final_amount", align: "right",
      render: val => `${formatPrice(val)}`
    },
    {
      title: "Đã thu trước", dataIndex: "amount_paid", key: "amount_paid", align: "right",
      render: val => `${formatPrice(val)}`
    },
    {
      title: "Còn cần thu", dataIndex: "remaining_receivable", key: "remaining_receivable", align: "right",
      render: val => `${formatPrice(val)}`
    },
    {
      title: "Tiền thu", dataIndex: "current_receipt", width: 120, key: "current_receipt", align: "right",
      render: (val, record, index) => (
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          step={1000}
          max={record.remaining_receivable}
          value={val}
          formatter={value => `${formatPrice(value)}`}
          parser={value => value.replace(/[^0-9]/g, "")}
          onChange={(value) => handleChangeReceipt(value, index)}
        />
      )
    },
    {
      title: "Còn nợ", key: "new_debt", align: "right",
      render: (_, record) => {
        const debt = record.remaining_receivable - (record.current_receipt || 0);
        return formatPrice(debt);
      }
    }
  ];

  return (
    <Modal
      title="Thanh toán"
      open={open}
      onCancel={onCancel}
      style={{ top: 64 }}
      width={960}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>Bỏ qua</Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          Tạo phiếu
        </Button>,
      ]}
    >
      <h2 className="text-lg font-bold mb-4">{customerName}</h2>
      <h3 className="text-md font-semibold mb-2">Nợ hiện tại: {formatPrice(initialDebt)}</h3>
      <div className="">
        <Form
          form={form}
          layout="vertical"
          className="grid grid-cols-2 gap-x-4"
          onValuesChange={(changedValues, allValues) => {
            if (changedValues.paymentAmount !== undefined) {
              const totalAmount = Number(changedValues.paymentAmount || 0);
              if (!isNaN(totalAmount)) {
                allocatePayment(totalAmount);
              }
            }
          }}
          initialValues={{
            method: " ",
            paymentAmount: 0,
            notes: ""
          }}
        >
          <Form.Item
            label="Phương thức thanh toán"
            name="method"
            rules={[{ required: true, message: "Chọn phương thức thanh toán!" }]}
          >
            <Select className="w-full">
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Tổng tiền thanh toán" name="paymentAmount">
            <InputNumber
              style={{ width: "100%" }}  
              step={1000}
              min={0}
              max={initialDebt}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫"}
              parser={value => value.replace(/[^\d]/g, "")}
            />
          </Form.Item>


          <Form.Item label="Ghi chú" name="notes" className="col-span-2">
            <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          className="mt-4 h-[28vh] overflow-y-auto"
          rowKey="invoice_id"
          scroll={{ x: "max-content" }}
        />
      </div>
    </Modal>
  );
};

export default PaymentModal;
