import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import productService from "../../service/productService"

export default function PurchaseOrderForm({ onSubmit, initialValues, onCancel }) {
  const [products, setProducts] = useState([])
  const mockWarehouses = useSelector(state => state.warehouse.warehouses.data)

  const [formData, setFormData] = useState({
    supplier_name: "",
    warehouse_id: "",
    note: "",
  })
  const [details, setDetails] = useState([])
  const [errors, setErrors] = useState({})

useEffect(()=>{
  const fetchProduct = async () => {
    const res = await productService.getAllProducts()
    if (res && res.data) {
      setProducts(res.data)
    }
  }
  fetchProduct()
},[])
 
  useEffect(() => {
    if (initialValues) {
      setFormData({
        supplier_name: initialValues.supplier_name || "",
        warehouse_id: initialValues.warehouse_id || "",
        note: initialValues.note || "",
      })
      setDetails(initialValues.details || [])
    } else {
      setFormData({
        supplier_name: "",
        warehouse_id: "",
        note: "",
      })
      setDetails([])
    }
  }, [initialValues])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        product_id: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  const handleRemoveDetail = (detailId) => {
    setDetails(details.filter((detail) => detail.po_detail_id !== detailId))
  }

  const handleProductChange = (productId, index) => {
    const product = products.find((p) => p.product_id === productId)
    if (product) {
      const newDetails = [...details]
      newDetails[index] = {
        ...newDetails[index],
        product_id: productId,
        price: product.product_retail_price,
      }
      setDetails(newDetails)
    }
  }

  const handleDetailChange = (value, field, index) => {
    const newDetails = [...details]
    newDetails[index] = {
      ...newDetails[index],
      [field]: field === "quantity" ? Number.parseInt(value) || 1 : Number.parseFloat(value) || 0,
    }
    setDetails(newDetails)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = "Vui lòng nhập tên nhà cung cấp"
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

    if (!validateForm()) {
      return
    }

    const order = {
      supplier_name: formData.supplier_name,
      warehouse_id: formData.warehouse_id,
      note: formData.note,
      status: "draft",
      details: details,
    }

    onSubmit(order)
    setFormData({
      supplier_name: "",
      warehouse_id: "",
      note: "",
    })
    setDetails([])
  }

  const totalAmount = details.reduce((sum, detail) => sum + detail.quantity * detail.price, 0)

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.supplier_name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Nhập tên nhà cung cấp"
            />
            {errors.supplier_name && <p className="mt-1 text-sm text-red-500">{errors.supplier_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kho nhập hàng <span className="text-red-500">*</span>
            </label>
            <select
              name="warehouse_id"
              value={formData.warehouse_id}
              onChange={handleInputChange}
              className={`w-full p-2 border rounded-md ${errors.warehouse_id ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Chọn kho</option>
              {mockWarehouses.map((warehouse) => (
                <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                  {warehouse.warehouse_name}
                </option>
              ))}
            </select>
            {errors.warehouse_id && <p className="mt-1 text-sm text-red-500">{errors.warehouse_id}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Chi tiết đơn hàng</h3>
            <button
              type="button"
              onClick={handleAddDetail}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Thêm sản phẩm
            </button>
          </div>

          {errors.details && <p className="text-sm text-red-500">{errors.details}</p>}

          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="py-3 px-6">
                    Sản phẩm
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Số lượng
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Đơn giá
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Thành tiền
                  </th>
                  <th scope="col" className="py-3 px-6"></th>
                </tr>
              </thead>
              <tbody>
                {details.length > 0 ? (
                  details.map((detail, index) => (
                    <tr key={detail.po_detail_id} className="bg-white border-b">
                      <td className="py-4 px-6">
                        <select
                          value={detail.product_id}
                          onChange={(e) => handleProductChange(e.target.value, index)}
                          className={`w-full p-1.5 border rounded ${errors[`product_${index}`] ? "border-red-500" : "border-gray-300"}`}
                        >
                          <option value="">Chọn sản phẩm</option>
                          {products.map((product) => (
                            <option key={product.product_id} value={product.product_id}>
                              {product.product_name}
                            </option>
                          ))}
                        </select>
                        {errors[`product_${index}`] && (
                          <p className="mt-1 text-xs text-red-500">{errors[`product_${index}`]}</p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          min="1"
                          value={detail.quantity}
                          onChange={(e) => handleDetailChange(e.target.value, "quantity", index)}
                          className="w-full p-1.5 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="number"
                          min="0"
                          value={detail.price}
                          onChange={(e) => handleDetailChange(e.target.value, "price", index)}
                          className="w-full p-1.5 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="py-4 px-6">{(detail.quantity * detail.price).toLocaleString()} VNĐ</td>
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(detail.po_detail_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white border-b">
                    <td colSpan={5} className="py-4 px-6 text-center">
                      Chưa có sản phẩm nào. Vui lòng thêm sản phẩm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-gray-500">Tổng giá trị:</p>
                <p className="text-xl font-bold">{totalAmount.toLocaleString()} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={details.length === 0}
            >
              {initialValues ? "Cập nhật" : "Tạo đơn nhập hàng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
