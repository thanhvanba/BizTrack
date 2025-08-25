import { useEffect } from "react"
import { Modal, Form, Input, InputNumber } from "antd"

const WarehouseModal = ({ open, mode, warehouse, onCancel, onSubmit }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (mode === "edit" && warehouse) {
      form.setFieldsValue(warehouse)
    } else {
      form.resetFields()
    }
  }, [form, mode, warehouse])

  const handleFinish = (values) => {
    if (mode === "edit") {
      onSubmit({ ...warehouse, ...values })
    } else {
      onSubmit(values)
    }
  }

  return (
    <Modal
      open={open}
      title={mode === "edit" ? "Chỉnh sửa kho" : "Thêm kho mới"}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => form.submit()}
      okText={mode === "edit" ? "Cập nhật" : "Thêm"}
      cancelText="Hủy"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ warehouse_capacity: 0 }}
      >
        <Form.Item
          label="Tên kho"
          name="warehouse_name"
          rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
        >
          <Input placeholder="Nhập tên kho" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ kho"
          name="warehouse_location"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input placeholder="Nhập địa chỉ kho (nếu có)" />
        </Form.Item>

        <Form.Item
          label="Sức chứa"
          name="warehouse_capacity"
          rules={[
            { required: true, message: "Vui lòng nhập sức chứa" },
            {
              type: "number",
              min: 0,
              message: "Sức chứa phải là số không âm",
            },
          ]}
        >
          <InputNumber
            className="w-full"
            placeholder="Nhập sức chứa"
            min={0}
            step={1}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default WarehouseModal
