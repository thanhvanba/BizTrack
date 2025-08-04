import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Input, Select, Button, Typography, Divider, InputNumber, Tooltip, Row, Col } from "antd";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import productService from "../../service/productService";
import LoadingLogo from "../LoadingLogo";
import searchService from "../../service/searchService";
import { debounce } from "lodash";
import inventoryService from "../../service/inventoryService";
import useToastNotify from "../../utils/useToastNotify";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function AdjustmentForm({ productId, warehouseId, onSuccess }) {
  const [formData, setFormData] = useState({
    adjustment_type: "increase",
    warehouse_id: warehouseId,
    product_id: productId,
    quantity: 0,
    reason: "",
  });
  console.log("🚀 ~ AdjustmentForm ~ formData:", formData)
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.reason || formData.reason.trim() === "") {
      newErrors.reason = "Vui lòng nhập ghi chú";
    }

    // if (!formData.adjustment_type) {
    //   newErrors.adjustment_type = "Vui lòng chọn phương thức điều chỉnh";
    // }

    if (formData.quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log("🚀 ~ handleSubmit ~ e:", e)
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {

      formData.adjustment_type === "increase"
        ? await inventoryService.increaseInventory(formData)
        : await inventoryService.decreaseInventory(formData)

      useToastNotify("Phiếu điều chỉnh kho đã được tạo thành công", "success");
      setFormData({
        adjustment_type: "increase",
        warehouse_id: warehouseId,
        product_id: productId,
        quantity: 0,
        reason: "",
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating adjustment:", error);
      useToastNotify("Có lỗi xảy ra khi tạo phiếu điều chỉnh", "error");
    }
    setLoading(false);
  };


  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">
            Phương thức điều chỉnh <span className="text-red-500">*</span>
          </label>
          <Select
            onChange={(value) =>
              handleInputChange({ target: { name: "adjustment_type", value } })
            }
            value={formData.adjustment_type}
            style={{ width: "100%" }}
          >
            <Option value="increase">Tăng kho</Option>
            <Option value="decrease">Giảm kho</Option>
          </Select>
        </div>
        <div>
          <label className="block font-medium mb-1">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <InputNumber
            min={0}
            value={formData.quantity}
            onChange={value =>
              handleInputChange({ target: { name: "quantity", value } })
            }
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">
          Ghi chú <span className="text-red-500">*</span>
        </label>
        <TextArea
          name="reason"
          value={formData.reason}
          onChange={handleInputChange}
          rows={3}
          placeholder="Nhập ghi chú (nếu có)"
        />
        {errors.reason && <Text type="danger">{errors.reason}</Text>}
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={formData.quantity === 0}
        >
          Tạo phiếu điều chỉnh
        </Button>
      </div>
    </div>
  );
}