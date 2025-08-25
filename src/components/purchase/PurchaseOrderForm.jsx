import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import {
  Input, Select, Button, Typography, Divider, InputNumber, Row, Col, Space, Spin,
  Tooltip
} from "antd"
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons"
import productService from "../../service/productService"
import searchService from "../../service/searchService"
import supplierService from "../../service/supplierService"
import SupplierModal from "../modals/SupplierModal"
import debounce from "lodash/debounce";
import useToastNotify from "../../utils/useToastNotify"
import ProductModal from "../modals/ProductModal";
import categoryService from "../../service/categoryService"
import LoadingLogo from "../LoadingLogo"

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

export default function PurchaseOrderForm({ onSubmit, initialValues, onCancel }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const warehouses = useSelector(state => state.warehouse.warehouses.data)
  const [suppliers, setSuppliers] = useState([])
  const [createSupplierVisible, setCreateSupplierVisible] = useState(false)
  const [createProductVisible, setCreateProductVisible] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: "",
    warehouse_id: "",
    note: "",
  })
  const [details, setDetails] = useState([])
  const [errors, setErrors] = useState({})

  // Thêm state cho select sản phẩm
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchOptions, setSearchOptions] = useState([]);
  const [fetching, setFetching] = useState(false);

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
      const res = await supplierService.getAllSuppliers({ page: 1, limit: 10000 })
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

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      setCategories(response.data)
    } catch (error) {
      useToastNotify("Không thể tải danh sách danh mục.", 'error')
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
  const handleCreateSupplier = async (data) => {
    try {
      const res = await supplierService.createSupplier(data)
      const newSupplier = res?.data || data
      setSuppliers(prev => [...prev, newSupplier])
      setFormData(prev => ({ ...prev, supplier_id: newSupplier.supplier_id }))
      setCreateSupplierVisible(false)
      useToastNotify(`Đã thêm nhà cung cấp "${newSupplier.supplier_name}" thành công!`, "success")
    } catch {
      useToastNotify("Thêm nhà cung cấp không thành công.", "error")
    }
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

  // Hàm search sản phẩm động
  const handleSearchProduct = debounce(async (value) => {
    if (!value) {
      setSearchOptions([]);
      return;
    }
    setFetching(true);
    try {
      const res = await searchService.searchProducts(value);
      setSearchOptions((res.data || []).filter(p => !details.some(d => d.product_id === p.product_id)));
    } finally {
      setFetching(false);
    }
  }, 400);

  // Thêm sản phẩm đã chọn vào details
  const handleAddProduct = (productId) => {
    if (!productId) return;
    if (details.some(d => d.product_id === productId)) return;
    const product = searchOptions.find(p => p.product_id === productId) || {};
    setDetails([
      ...details,
      {
        product_id: productId,
        quantity: 1,
        price: product?.product_retail_price || 0,
        product_name: product?.product_name || ""
      }
    ]);
    setSelectedProduct(null);
    setSearchOptions([]);
  };

  const handleCreateProduct = async (productData) => {
    try {
      await productService.createProduct(productData);
      // Hoặc reload lại danh sách sản phẩm:
      const res = await productService.getAllProducts();
      if (res && res.data) {
        setProducts(res.data);
      }
      setCreateProductVisible(false);
      useToastNotify(`Đã thêm sản phẩm "${productData.product_name}" thành công!`, "success");
    } catch {
      useToastNotify("Thêm sản phẩm không thành công.", "error");
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium mb-1">
              Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 relative">
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
                    label={`${s.supplier_name}${s.phone ? ' - ' + s.phone : ''}`}
                  >
                    {s.supplier_name}{s.phone ? ' - ' + s.phone : ''}
                  </Option>
                ))}
              </Select>
              <div className="absolute -top-7 right-0">
                <Text
                  type="link"
                  className="text-sm cursor-pointer !text-blue-600"
                  onClick={() => setCreateSupplierVisible(true)}
                >
                  + Thêm nhà cung cấp
                </Text>
              </div>
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
              Kho hàng <span className="text-red-500">*</span>
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

        {/* Thanh tìm kiếm và chọn sản phẩm động */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <Select
                showSearch
                value={selectedProduct}
                placeholder="Tìm kiếm và chọn sản phẩm theo tên/ theo sku"
                onSearch={handleSearchProduct}
                onChange={val => { setSelectedProduct(val); handleAddProduct(val); }}
                filterOption={false}
                notFoundContent={
                  fetching
                    ? <LoadingLogo size={40} className="mx-auto my-8" />
                    : <span style={{ color: '#888' }}>Không tìm thấy sản phẩm</span>
                }
                style={{ width: '100%' }}
                allowClear
              >
                {searchOptions.map(p => (
                  <Option key={p.product_id} value={p.product_id}>
                    {p.product_name}
                  </Option>
                ))}
              </Select>
            </div>
            <Button
              type="primary"
              onClick={() => {
                fetchCategories()
                setCreateProductVisible(true)
              }}
              className="whitespace-nowrap flex-shrink-0"
            >
              +
            </Button>
            <Tooltip
              title={`Chỉ hiển thị sản phẩm chưa được chọn vào đơn hàng`}
            >
              <InfoCircleOutlined style={{ color: "#1890ff" }} className="flex-shrink-0" />
            </Tooltip>
          </div>
          {errors.details && (
            <Text type="danger" className="block mt-2">
              {errors.details}
            </Text>
          )}
        </div>

        {/* Danh sách sản phẩm đã chọn */}
        <div className="mb-4">
          {details.length === 0 && (
            <Text type="secondary">Chưa có sản phẩm nào được chọn.</Text>
          )}

          {details.length > 0 && (
            <Row gutter={12} align="middle" className="mb-2 font-semibold text-gray-700 px-2">
              <Col flex="2 1 200px">
                <Text>Tên sản phẩm</Text>
              </Col>
              <Col flex="1 1 100px">
                <Text>Số lượng</Text>
              </Col>
              <Col flex="1 1 120px">
                <Text>Đơn giá</Text>
              </Col>
              <Col flex="1 1 120px">
                <Text>Thành tiền</Text>
              </Col>
              <Col style={{ width: 40 }}></Col> {/* Cột nút xoá */}
            </Row>
          )}

          {details.map((detail, index) => (
            <Row gutter={12} align="middle" key={detail.product_id} className="mb-2 bg-gray-50 p-2 rounded">
              <Col flex="2 1 200px">
                <Text>{detail.product_name}</Text>
              </Col>
              <Col flex="1 1 100px">
                <InputNumber
                  min={1}
                  value={detail.quantity}
                  onChange={val => handleDetailChange(val, "quantity", index)}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col flex="1 1 120px">
                <InputNumber
                  min={0}
                  step={1000}
                  value={detail.price}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={value => value.replace(/,/g, "")}
                  onChange={val => handleDetailChange(val, "price", index)}
                />
              </Col>
              <Col flex="1 1 120px">
                <Text strong>{(detail.quantity * detail.price).toLocaleString()} VNĐ</Text>
              </Col>
              <Col>
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleRemoveDetail(index)}
                />
              </Col>
            </Row>
          ))}
        </div>

        <div className="text-right mt-6">
          <p className="text-gray-600">Tổng giá trị:</p>
          <Title level={3}>{totalAmount.toLocaleString()} VNĐ</Title>
          <p className="text-red-800">Tính vào công nợ: {totalAmount.toLocaleString()}đ</p>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" disabled={details.length === 0}>
            {initialValues ? "Cập nhật" : "Tạo đơn hàng"}
          </Button>
        </div>
      </form>
      <ProductModal
        mode="create"
        open={createProductVisible}
        onCancel={() => setCreateProductVisible(false)}
        onSubmit={handleCreateProduct}
        categories={categories.filter(category => category.status === "active")}
      />
    </div>
  )
}
