import { useState, useEffect, useCallback } from "react"
import { Modal, Form, Input, Select, InputNumber, Upload, Button, message, Switch, Row, Col, Typography } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import CategoryModal from "./CategoryModal"
import categoryService from "../../service/categoryService"
import searchService from "../../service/searchService"
import useToastNotify from "../../utils/useToastNotify"
import { debounce } from "lodash"

const { Text } = Typography
const { Option } = Select
const { TextArea } = Input

const ProductModal = ({
  mode = 'create', // 'create' hoặc 'edit'
  open,
  onCancel,
  onSubmit,
  product = null,
  categories = [],
  onCategoryCreated = null // Callback để cập nhật categories từ component cha
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState([])
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null) // Thêm state để quản lý category đã chọn
  const [searchCategories, setSearchCategories] = useState([]) // State cho kết quả tìm kiếm danh mục
  const [searchLoading, setSearchLoading] = useState(false) // Loading state cho search

  // Thiết lập giá trị form khi mở modal hoặc product thay đổi
  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
      setSelectedCategoryId(null) // Reset selected category
      return
    }

    if (mode === 'edit' && product) {
      form.setFieldsValue({
        sku: product.sku,
        product_name: product.product_name,
        product_desc: product.product_desc,
        product_retail_price: product.product_retail_price,
        product_barcode: product.product_barcode,
        category_id: product.category_id,
        is_active: product.is_active
      })
      setSelectedCategoryId(product.category_id) // Set selected category

      if (product.product_image) {
        setFileList([{
          uid: '-1',
          name: 'product-image',
          status: 'done',
          url: product.product_image
        }])
      }
    }
  }, [open, product, mode, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const productData = {
        ...(mode === 'edit' ? product : {}),
        ...values,
        product_image: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : null
      }

      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        onSubmit(productData)
        if (mode === 'create') {
          form.resetFields()
          setFileList([])
        }
      }, 1000)
    } catch (error) {
      console.error("Validation failed:", error)
    }
  }

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handleCreateCategory = async (newCategory) => {
    try {
      const res = await categoryService.createCategory(newCategory)
      setCategoryModalVisible(false)

      // Gọi callback để cập nhật danh sách categories từ component cha
      if (onCategoryCreated && res?.data) {
        onCategoryCreated(res.data)
      }

      // Tự động chọn danh mục vừa tạo
      const newCategoryId = res?.data?.category_id
      setSelectedCategoryId(newCategoryId) // Cập nhật state
      form.setFieldsValue({ category_id: newCategoryId }) // Cập nhật form

      useToastNotify("Thêm danh mục thành công", "success")
    } catch (error) {
      useToastNotify("Thêm danh mục thất bại", "error")
    }
  }

  // Handler để tìm kiếm danh mục
  const handleSearchCategory = async (searchText) => {
    if (!searchText || searchText.trim() === '') {
      setSearchCategories([])
      return
    }

    try {
      setSearchLoading(true)
      const response = await searchService.searchCategoryByName(searchText.trim(), 1, 100)
      if (response?.data) {
        setSearchCategories(response.data)
      } else {
        setSearchCategories([])
      }
    } catch (error) {
      console.error('Error searching categories:', error)
      setSearchCategories([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Debounce search handler giống product-management
  const debouncedSearchCategory = useCallback(debounce(handleSearchCategory, 500), [])

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  )

  const title = mode === 'create' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'
  const submitText = mode === 'create' ? 'Thêm sản phẩm' : 'Cập nhật'

  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={onCancel}
        width={700}
        footer={[
          <Button key="back" onClick={onCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {submitText}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="sku"
              label="Mã SKU"
              rules={[
                { required: true, message: "Vui lòng nhập mã SKU" },
                { max: 100, message: "Mã SKU không được vượt quá 100 ký tự" }
              ]}
            >
              <Input
                placeholder="Nhập mã SKU sản phẩm"
                disabled={mode === 'edit'} // Disable khi chỉnh sửa
              />
            </Form.Item>

            <Form.Item
              name="product_name"
              label="Tên sản phẩm"
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
            >
              <Input placeholder="Nhập tên sản phẩm" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="category_id"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
            >
              <Row gutter={8}>
                <Col flex="auto">
                  <Select
                    placeholder="Chọn danh mục"
                    value={selectedCategoryId} // Sử dụng value prop trực tiếp
                    onChange={(value) => {
                      setSelectedCategoryId(value)
                      form.setFieldsValue({ category_id: value })
                      // Không reset searchCategories ở đây để dropdown không bị đóng
                    }}
                    showSearch
                    filterOption={false}
                    onSearch={debouncedSearchCategory}
                    notFoundContent={searchLoading ? "Đang tìm kiếm..." : "Không tìm thấy danh mục"}
                    loading={searchLoading}
                  >
                    {/* Hiển thị kết quả tìm kiếm nếu có */}
                    {searchCategories.length > 0 ? (
                      searchCategories.map((category) => (
                        <Option key={category.category_id} value={category.category_id}>
                          {category.category_name}
                        </Option>
                      ))
                    ) : (
                      // Hiển thị danh sách categories gốc nếu không có kết quả tìm kiếm
                      categories.map((category) => (
                        <Option key={category.category_id} value={category.category_id}>
                          {category.category_name}
                        </Option>
                      ))
                    )}
                  </Select>
                </Col>
              </Row>
              <div className="absolute -top-8 right-0">
                <Text
                  type="link"
                  className="text-sm cursor-pointer !text-blue-600"
                  onClick={() => setCategoryModalVisible(true)}
                >
                  + Thêm danh mục
                </Text>
              </div>
            </Form.Item>

            <Form.Item
              name="product_barcode"
              label="Mã vạch"
              rules={[{ max: 100, message: "Mã vạch không được vượt quá 100 ký tự" }]}
            >
              <Input placeholder="Nhập mã vạch sản phẩm" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="product_retail_price"
              label="Giá bán lẻ"
              rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
            >
              <InputNumber
                min={0}
                step={1000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                className="w-full"
                addonAfter="VNĐ"
              />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Trạng thái"
              valuePropName="checked"
              initialValue={mode === 'create' ? true : undefined}
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
            </Form.Item>
          </div>

          <Form.Item name="product_desc" label="Mô tả sản phẩm">
            <TextArea rows={4} placeholder="Nhập mô tả chi tiết sản phẩm" />
          </Form.Item>

          <Form.Item name="product_image" label="Hình ảnh sản phẩm">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/")
                if (!isImage) message.error("Chỉ có thể tải lên file hình ảnh!")
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isLt2M) message.error("Hình ảnh phải nhỏ hơn 2MB!")
                return false
              }}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Category Modal */}
      <CategoryModal
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        onSubmit={handleCreateCategory}
        mode="create"
      />
    </>
  )
}

export default ProductModal