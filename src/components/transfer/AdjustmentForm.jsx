import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Input, Select, Button, Typography, Divider, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import productService from "../../service/productService";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function AdjustmentForm({ onSubmit, initialValues, onCancel }) {
  const [products, setProducts] = useState([]);
  const warehouses = useSelector((state) => state.warehouse.warehouses.data);
  const [formData, setFormData] = useState({
    adjustment_type: "increase",
    warehouse_id: "",
    note: "",
  });
  const [details, setDetails] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await productService.getAllProducts();
      if (res && res.data) {
        setProducts(res.data);
      }
    };
    fetchProduct();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        adjustment_type: initialValues.adjustment_type || "increase",
        warehouse_id: initialValues.warehouse_id || "",
        note: initialValues.note || "",
      });
      setDetails(initialValues.details || []);
    } else {
      setFormData({
        adjustment_type: "increase",
        warehouse_id: "",
        note: "",
      });
      setDetails([]);
    }
  }, [initialValues]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleAddDetail = () => {
    setDetails([...details, { product_id: "", quantity: 1, price: 0 }])
  }

  const handleRemoveDetail = (indexToRemove) => {
    setDetails(details.filter((_, index) => index !== indexToRemove));
  };

  const handleProductChange = (productId, index) => {
    const product = products.find((p) => p.product_id === productId);
    if (product) {
      const newDetails = [...details];
      newDetails[index] = {
        ...newDetails[index],
        product_id: productId,
        product_name: product.product_name,
        price: 0,
      };
      setDetails(newDetails);
    }
  };

  const handleDetailChange = (value, field, index) => {
    const newDetails = [...details];
    newDetails[index] = {
      ...newDetails[index],
      [field]: value || 0,
    };
    setDetails(newDetails);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.warehouse_id) {
      newErrors.warehouse_id = "Vui lòng chọn kho";
    }

    if (!formData.note || formData.note.trim() === "") {
      newErrors.note = "Vui lòng nhập ghi chú";
    }

    if (details.length === 0) {
      newErrors.details = "Vui lòng thêm ít nhất một sản phẩm";
    } else {
      details.forEach((detail, index) => {
        if (!detail.product_id) {
          newErrors[`product_${index}`] = "Vui lòng chọn sản phẩm";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const adjustment = {
      adjustment_type: formData.adjustment_type,
      warehouse_id: formData.warehouse_id,
      note: formData.note,
      status: "draft",
      details: details.map(detail => ({
        ...detail,
        // Remove price if it's a decrease adjustment
        price: formData.adjustment_type === "increase" ? detail.price : null
      })),
    };

    onSubmit(adjustment);
    setFormData({ adjustment_type: "increase", warehouse_id: "", note: "" });
    setDetails([]);
  };

  const totalAmount = details.reduce(
    (sum, d) => sum + d.quantity * (d.price || 0),
    0
  );

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      render: (value, _, index) => (
        <Select
          value={value}
          onChange={(val) => handleProductChange(val, index)}
          style={{ width: "100%" }}
          placeholder="Chọn sản phẩm"
          status={errors[`product_${index}`] ? "error" : ""}
        >
          {products.map((p) => (
            <Option key={p.product_id} value={p.product_id}>
              {p.product_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (value, _, index) => (
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) =>
            handleDetailChange(Number(e.target.value), "quantity", index)
          }
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (value, _, index) => (
        <InputNumber
          min={0}
          step={1000}
          value={value}
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/,/g, "")}
          onChange={(val) => handleDetailChange(val, "price", index)}
        />
      ),
    },
    {
      title: "Thành tiền",
      render: (_, record) =>
        `${(record.quantity * record.price).toLocaleString()} VNĐ`,
    },
    {
      title: "",
      render: (_, __, index) => (
        <Button
          type="text"
          icon={<DeleteOutlined />}
          danger
          onClick={() => handleRemoveDetail(index)}
        />
      ),
    },
  ];

  return (
    <div className="p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">
              Phương thức điều chỉnh <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.adjustment_type}
              style={{ width: "100%" }}
            >
              <Option value="increase">Tăng kho</Option>
              <Option value="decrease">Giảm kho</Option>
            </Select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Kho điều chỉnh <span className="text-red-500">*</span>
            </label>
            <Select
              name="warehouse_id"
              value={formData.warehouse_id}
              onChange={(value) =>
                handleInputChange({ target: { name: "warehouse_id", value } })
              }
              placeholder="Chọn kho"
              style={{ width: "100%" }}
              status={errors.warehouse_id ? "error" : ""}
            >
              {warehouses?.map((w) => (
                <Option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.warehouse_name}
                </Option>
              ))}
            </Select>
            {errors.warehouse_id && (
              <Text type="danger">{errors.warehouse_id}</Text>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">
            Ghi chú <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
            placeholder="Nhập ghi chú (nếu có)"
          />
          {errors.note && <Text type="danger">{errors.note}</Text>}
        </div>

        <Divider orientation="left">Chi tiết điều chỉnh</Divider>

        <div className="mb-4">
          <Button icon={<PlusOutlined />} onClick={handleAddDetail}>
            Thêm sản phẩm
          </Button>
          {errors.details && (
            <Text type="danger" className="block mt-2">
              {errors.details}
            </Text>
          )}
        </div>

        <Table
          dataSource={details}
          columns={columns}
          pagination={false}
          rowKey={(_, index) => index}
          bordered
        />

        {formData.adjustment_type === "increase" && (
          <div className="text-right mt-6">
            <p className="text-gray-600">Tổng giá trị:</p>
            <Title level={3}>{totalAmount.toLocaleString()} VNĐ</Title>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            disabled={details.length === 0}
          >
            {initialValues ? "Cập nhật" : "Tạo phiếu điều chỉnh"}
          </Button>
        </div>
      </form>
    </div>
  );
}