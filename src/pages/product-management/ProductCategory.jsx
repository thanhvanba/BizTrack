// ProductCategory.jsx
import { Typography, Table, Button, Space, Tooltip, Tag } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import CategoryModal from "../../components/modals/CategoryModal"
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal"
import categoryService from "../../service/categoryService"
import useToastNotify from "../../utils/useToastNotify"
import LoadingLogo from "../../components/LoadingLogo"

const { Title } = Typography

const ProductCategory = () => {
  const [categories, setCategories] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const fetchCategories = async (page = pagination.current, limit = pagination.pageSize) => {
    setLoading(true)
    try {
      const data = await categoryService.getAllCategories({ page, limit })
      setCategories(data.data)
      if (data.pagination) {
        setPagination({
          current: data.pagination.currentPage || data.pagination.page,
          pageSize: data.pagination.pageSize,
          total: data.pagination.total,
        });
      }
    } catch (error) {
      useToastNotify("Lỗi khi tải danh mục", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchCategories(current, pageSize);
  };

  const handleAddCategory = async (data) => {
    try {
      await categoryService.createCategory(data)
      fetchCategories()
      setIsCreateModalOpen(false)
      useToastNotify("Thêm danh mục thành công", "success")
    } catch (error) {
      useToastNotify("Thêm danh mục thất bại", "error")
    }
  }

  const handleUpdateCategory = async (updated) => {
    try {
      await categoryService.updateCategory(updated.category_id, updated)
      fetchCategories()
      setIsEditModalOpen(false)
      setSelectedCategory(null)
      useToastNotify("Cập nhật danh mục thành công", "success")
    } catch (error) {
      useToastNotify("Cập nhật danh mục thất bại", "error")
    }
  }

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return
    setDeleting(true)
    try {
      await categoryService.deleteCategory(selectedCategory.category_id)
      fetchCategories()
      useToastNotify('Xóa danh mục thành công', 'success')
    } catch (error) {
      useToastNotify("Xóa danh mục thất bại", "error")
    } finally {
      setDeleting(false)
      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
    }
  }

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "category_name",
      key: "category_name",
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Tạm ngưng", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "volcano"}>
          {status === "active" ? "Hoạt động" : "Tạm ngưng"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedCategory(record)
                setIsEditModalOpen(true)
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => {
                setSelectedCategory(record)
                setIsDeleteModalOpen(true)
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="!mb-0">Danh mục sản phẩm</Title>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setIsCreateModalOpen(true)}>
          Thêm danh mục
        </Button>
      </div>

      <Table
        loading={loading ? { indicator: <LoadingLogo size={40} className="mx-auto my-8" /> } : false}
        dataSource={categories}
        columns={columns}
        size="middle"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        onChange={handleTableChange}
        rowClassName="hover:bg-gray-50 transition-colors"
      />

      <CategoryModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleAddCategory}
        mode="create"
      />
      <CategoryModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        onSubmit={handleUpdateCategory}
        mode="edit"
        category={selectedCategory}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={handleDeleteCategory}
        title="Xác nhận xóa danh mục"
        content={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory?.category_name}" không?`}
        loading={deleting}
      />
    </div>
  )
}

export default ProductCategory
