import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  Table, Input, Select, Button, Typography, Divider, InputNumber
} from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import productService from "../../service/productService"
import supplierService from "../../service/supplierService"
import SupplierModal from "../modals/SupplierModal"

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

export default function PurchaseOrderForm({ onSubmit, initialValues, onCancel }) {
  const [products, setProducts] = useState([])
  const warehouses = useSelector(state => state.warehouse.warehouses.data)
  const [suppliers, setSuppliers] = useState([])
  const [createSupplierVisible, setCreateSupplierVisible] = useState(false)

  const [formData, setFormData] = useState({
    supplier_id: "",
    warehouse_id: "",
    note: "",
  })
  const [details, setDetails] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await productService.getAllProducts()
      if (res && res.data) {
        setProducts(res.data)
      }
    }
    fetchProduct()
  }, [])

  useEffect(() => {
    const fetchSuppliers = async () => {
      const res = await supplierService.getAllSuppliers()
      if (res && res.data) {
        setSuppliers(res.data)
      }
    }
    fetchSuppliers()
  }, [])

  useEffect(() => {
    if (initialValues) {
      setFormData({
        supplier_id: initialValues.supplier_id || "",
        warehouse_id: initialValues.warehouse_id || "",
        note: initialValues.note || "",
      })
      setDetails(initialValues.details || [])
    } else {
      setFormData({
        supplier_id: "",
        warehouse_id: "",
        note: "",
      })
      setDetails([])
    }
  }, [initialValues])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleAddDetail = () => {
    setDetails([...details, { product_id: "", quantity: 1, price: 0 }])
  }

  const handleRemoveDetail = (indexToRemove) => {
    setDetails(details.filter((_, index) => index !== indexToRemove))
  }

  const handleProductChange = (productId, index) => {
    const product = products.find(p => p.product_id === productId)
    if (product) {
      const newDetails = [...details]
      newDetails[index] = {
        ...newDetails[index],
        product_id: productId,
        price: product.product_retail_price || 0,
      }
      setDetails(newDetails)
    }
  }

  const handleDetailChange = (value, field, index) => {
    const newDetails = [...details]
    newDetails[index] = {
      ...newDetails[index],
      [field]: value || 0,
    }
    setDetails(newDetails)
  }

  const handleCreateSupplier = (newSupplier) => {
    setSuppliers(prev => [...prev, newSupplier])
    setFormData(prev => ({ ...prev, supplier_id: newSupplier.supplier_id }))
    setCreateSupplierVisible(false)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.supplier_id) {
      newErrors.supplier_id = "Vui lòng chọn nhà cung cấp"
    }
    if (!formData.warehouse_id) {
      newErrors.warehouse_id = "Vui lòng chọn kho"
    }
    if (details.length === 0) {
      newErrors.details = "Vui lòng thêm ít nhất một sản phẩm"
    } else {
      details.forEach((detail, index) => {
        if (!detail.product_id) {
          newErrors[`product_${index}`] = "Vui lòng chọn sản phẩm"
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const order = {
      supplier_id: formData.supplier_id,
      warehouse_id: formData.warehouse_id,
      note: formData.note,
      status: "draft",
      details,
    }

    onSubmit(order)
    setFormData({ supplier_id: "", warehouse_id: "", note: "" })
    setDetails([])
  }

  const totalAmount = details.reduce((sum, d) => sum + d.quantity * d.price, 0)

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
          {products.map(p => (
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
          onChange={(e) => handleDetailChange(Number(e.target.value), "quantity", index)}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (value, _, index) => (
        <InputNumber
          min={0}
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
  ]

  return (
    <div className="p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">
              Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Select
                className="w-full"
                value={formData.supplier_id}
                onChange={(value) =>
                  handleInputChange({ target: { name: "supplier_id", value } })
                }
                placeholder="Chọn nhà cung cấp"
                status={errors.supplier_id ? "error" : ""}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {suppliers.map((s) => (
                  <Option
                    key={s.supplier_id}
                    value={s.supplier_id}
                    label={`${s.supplier_name} - ${s.phone || ""}`}
                  >
                    {s.supplier_name} - {s.phone || ""}
                  </Option>
                ))}
              </Select>
              <Button type="primary" onClick={() => setCreateSupplierVisible(true)}>
                + Thêm
              </Button>
            </div>
            {errors.supplier_id && (
              <Text type="danger" className="block mt-1">
                {errors.supplier_id}
              </Text>
            )}
            <SupplierModal
              open={createSupplierVisible}
              onCancel={() => setCreateSupplierVisible(false)}
              onSubmit={handleCreateSupplier}
              mode="create"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Kho nhập hàng <span className="text-red-500">*</span>
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
          <label className="block font-medium mb-1">Ghi chú</label>
          <TextArea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        <Divider orientation="left">Chi tiết đơn hàng</Divider>

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

        <div className="text-right mt-6">
          <p className="text-gray-600">Tổng giá trị:</p>
          <Title level={3}>{totalAmount.toLocaleString()} VNĐ</Title>
        </div>

        <div className="flex justify-end space-x-4 mt-6 gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" disabled={details.length === 0}>
            {initialValues ? "Cập nhật" : "Tạo đơn nhập hàng"}
          </Button>
        </div>
      </form>
    </div>
  )
}
