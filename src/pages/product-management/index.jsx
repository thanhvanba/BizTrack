import { useState, useEffect } from "react"
import axios from "axios"
import { Card, Input, Button, Table, Tag, Space, Tooltip, Select, Typography, Image, Switch } from "antd"
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"
import productService from "../../service/productService"
import categoryService from "../../service/categoryService"
import ProductModal from "../../components/modals/ProductModal"
import useToastNotify from "../../utils/useToastNotify"
import searchService from "../../service/searchService"
import { debounce } from "lodash"
import formatPrice from '../../utils/formatPrice'
import LoadingLogo from "../../components/LoadingLogo"

const { Title } = Typography
const { Option } = Select

const ProductManagement = () => {
  const [searchText, setSearchText] = useState("")
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [productsData, setProductsData] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  })
  const [searchPagination, setSearchPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [categories, setCategories] = useState([])

  const fetchProducts = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await productService.getAllProducts({ page, limit })
      setProductsData(
        response.data.map((product) => ({
          ...product,
          key: product.product_id,
        }))
      )
      if (response.pagination) {
        setPagination({
          current: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Không thể tải danh sách sản phẩm.", 'error')
    } finally {
      setLoading(false);
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories({ page: 1, limit: 100 })
      setCategories(response.data)
    } catch (error) {
      useToastNotify("Không thể tải danh sách danh mục.", 'error')
    }
  }
  const handleSearch = debounce(async (value, page = 1, pageSize = 5) => {
    if (!value) {
      setIsSearching(false);
      setSearchValue("");
      fetchProducts(); // gọi lại toàn bộ sản phẩm
      return;
    }
    setIsSearching(true);
    setSearchValue(value);
    try {
      const response = await searchService.searchProducts(value, page, pageSize);
      const data = response.data || [];
      setProductsData(data.map(product => ({ ...product, key: product.product_id, })));
      if (response.pagination) {
        setSearchPagination({
          current: response.pagination.currentPage,
          pageSize: response.pagination.pageSize,
          total: response.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Không thể tìm sản phẩm.", 'error');
    }
  }, 500);

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Create product
  const handleCreateProduct = async (productData) => {
    try {
      const newProduct = {
        sku: productData.sku,
        product_name: productData.product_name,
        product_desc: productData.product_desc,
        product_retail_price: productData.product_retail_price,
        product_barcode: productData.product_barcode,
        product_image: productData.product_image || "/placeholder.svg",
        category_id: productData.category_id,
        is_active: productData.is_active || true
      }

      await productService.createProduct(newProduct)
      setCreateModalVisible(false)
      fetchProducts()
      useToastNotify(`Sản phẩm "${newProduct.product_name}" đã được thêm thành công!`, 'success')
    } catch (error) {
      useToastNotify("Thêm sản phẩm không thành công.", 'error')
    }
  }

  // Edit product
  const handleEditProduct = async (updatedProduct) => {
    try {
      await productService.updateProduct(updatedProduct.product_id, updatedProduct)
      setEditModalVisible(false)
      fetchProducts()
      useToastNotify(`Sản phẩm "${updatedProduct.product_name}" đã được cập nhật thành công!`, 'success')
    } catch (error) {
      useToastNotify("Cập nhật sản phẩm không thành công.", 'error')
    }
  }

  // Delete product
  const handleDeleteProduct = async () => {
    setLoading(true)
    try {
      await productService.deleteProduct(selectedProduct.product_id)
      setLoading(false)
      setDeleteModalVisible(false)
      setSelectedProduct(null)
      fetchProducts()
      useToastNotify(`Sản phẩm "${selectedProduct.product_name}" đã được xóa thành công!`, 'success')
    } catch (error) {
      setLoading(false)
      useToastNotify("Xóa sản phẩm không thành công.", 'error')
    }
  }

  const editProduct = (product) => {
    setSelectedProduct(product)
    setEditModalVisible(true)
  }

  const confirmDelete = (product) => {
    setSelectedProduct(product)
    setDeleteModalVisible(true)
  }

  const handleTableChange = (paginationInfo) => {
    if (isSearching) {
      handleSearch(searchValue, paginationInfo.current, paginationInfo.pageSize);
    } else {
      const { current, pageSize } = paginationInfo
      fetchProducts(current, pageSize)
    }
  }

  // Handle category created from ProductModal
  const handleCategoryCreated = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
  };

  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 120,
      render: (sku) => <span className="font-mono">{sku || '--'}</span>,
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      render: (text, record) => (
        <div className="flex items-center">
          <Image
            src={record.product_image || "/placeholder.svg"}
            alt={text}
            width={50}
            height={50}
            className="object-cover rounded"
            preview={false}
          />
          <div className="ml-3">
            <div className="font-medium">{text}</div>
            <div className="text-gray-500 text-xs">{record.product_barcode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "product_desc",
      key: "product_desc",
      render: (text) => (
        <Tooltip title={text}>
          <span className="line-clamp-1">{text || '--'}</span>
        </Tooltip>
      ),
      responsive: ["lg"],
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      render: (values) => {
        return values ? values : '--'
      },
      responsive: ["md"],
    },
    {
      title: "Giá bán",
      dataIndex: "product_retail_price",
      key: "product_retail_price",
      render: (price) => formatPrice(price),
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      render: (status) => {
        let color
        switch (status) {
          case 1:
            color = "success"
            break
          case "2":
            color = "warning"
            break
          default:
            color = "default"
        }
        return <Tag color={color}>{status === 1 ? 'Hoạt động' : 'Ẩn'}</Tag>
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {/* <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            />
          </Tooltip> */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editProduct(record)}
              className="text-green-500 hover:text-green-600 hover:bg-green-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => confirmDelete(record)}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title level={2} className="text-xl md:text-2xl font-bold m-0 text-gray-800">
          Quản lý sản phẩm
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Tìm kiếm sản phẩm theo tên/ theo sku"
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          {/* <Select
            defaultValue="all"
            style={{ minWidth: 180 }}
            onChange={(value) => setCategoryFilter(value)}
            placeholder="Lọc theo danh mục"
          >
            <Option value="all">Tất cả danh mục</Option>
            {categories.map(category => (
              <Option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </Option>
            ))}
          </Select> */}
        </div>

        <Table
          loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
          columns={columns}
          dataSource={productsData}
          pagination={{
            current: isSearching ? searchPagination.current : pagination.current,
            pageSize: isSearching ? searchPagination.pageSize : pagination.pageSize,
            total: isSearching ? searchPagination.total : pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          onChange={handleTableChange}
          bordered={false}
          size="middle"
          className="custom-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "Không có sản phẩm nào" }}
        />
      </Card>

      {/* Create Product Modal */}
      <ProductModal
        mode="create"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateProduct}
        categories={categories.filter(category => category.status === "active")}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* Edit Product Modal */}
      <ProductModal
        mode="edit"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditProduct}
        product={selectedProduct}
        categories={categories.filter(category => category.status === "active")}
        onCategoryCreated={handleCategoryCreated}
      />
      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteProduct}
        title="Xác nhận xóa sản phẩm"
        content={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.product_name}" không? Hành động này không thể hoàn tác.`}
        loading={loading}
      />
    </div>
  )
}

export default ProductManagement