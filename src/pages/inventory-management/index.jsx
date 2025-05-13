import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Space,
  Tooltip,
  Typography,
  Tag,
  message,
  Select,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import AddInventoryItemModal from "../../components/modals/AddInventoryItemModal";
import EditInventoryItemModal from "../../components/modals/EditInventoryItemModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";

import { fetchWarehouses } from "../../redux/warehouses/warehouses.slice";
import { useDispatch, useSelector } from "react-redux";

const { Title } = Typography;

const InventoryManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const loadingwh = useSelector((state) => state.warehouse.loading);
  const error = useSelector((state) => state.warehouse.error);

  // Sample data
  const [inventoryData, setInventoryData] = useState([
    {
      key: "1",
      name: "Laptop Dell XPS 13",
      category: "Điện tử",
      location: "Kho A - Kệ 1",
      quantity: 25,
      status: "Đủ hàng",
    },
    {
      key: "2",
      name: "iPhone 14 Pro",
      category: "Điện thoại",
      location: "Kho A - Kệ 2",
      quantity: 18,
      status: "Đủ hàng",
    },
    {
      key: "3",
      name: "Tai nghe Sony WH-1000XM4",
      category: "Phụ kiện",
      location: "Kho B - Kệ 3",
      quantity: 5,
      status: "Sắp hết",
    },
    {
      key: "4",
      name: "Samsung Galaxy S23",
      category: "Điện thoại",
      location: "Kho A - Kệ 2",
      quantity: 12,
      status: "Đủ hàng",
    },
    {
      key: "5",
      name: "iPad Pro 12.9",
      category: "Máy tính bảng",
      location: "Kho C - Kệ 1",
      quantity: 0,
      status: "Hết hàng",
    },
    {
      key: "6",
      name: "Chuột Logitech MX Master 3",
      category: "Phụ kiện",
      location: "Kho B - Kệ 4",
      quantity: 8,
      status: "Đủ hàng",
    },
  ]);

  // Filter data based on search text
  const filteredData = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Đủ hàng":
        return "success";
      case "Sắp hết":
        return "warning";
      case "Hết hàng":
        return "error";
      default:
        return "default";
    }
  };

  // Handle add inventory item
  const handleAddInventoryItem = (values) => {
    // Get product name based on productId
    const productName =
      values.productId === 1
        ? "Laptop Dell XPS 13"
        : values.productId === 2
        ? "iPhone 14 Pro"
        : values.productId === 3
        ? "Tai nghe Sony WH-1000XM4"
        : values.productId === 4
        ? "Samsung Galaxy S23"
        : values.productId === 5
        ? "iPad Pro 12.9"
        : "Chuột Logitech MX Master 3";

    // Get category based on productId
    const category =
      values.productId === 1
        ? "Điện tử"
        : values.productId === 2 || values.productId === 4
        ? "Điện thoại"
        : values.productId === 3 || values.productId === 6
        ? "Phụ kiện"
        : "Máy tính bảng";

    // Determine status based on quantity
    const status =
      values.quantity > 10
        ? "Đủ hàng"
        : values.quantity > 0
        ? "Sắp hết"
        : "Hết hàng";

    // Create new inventory item
    const newItem = {
      key: String(inventoryData.length + 1),
      name: productName,
      category: category,
      location: values.location,
      quantity: values.quantity,
      status: status,
      notes: values.notes,
    };

    // Add new item to the list
    setInventoryData([...inventoryData, newItem]);

    // Close modal and show success message
    setAddModalVisible(false);
    message.success(
      `Sản phẩm "${productName}" đã được thêm vào kho thành công!`
    );
  };

  // Handle edit inventory item
  const handleEditInventoryItem = (updatedItem) => {
    // Determine status based on quantity
    const status =
      updatedItem.quantity > 10
        ? "Đủ hàng"
        : updatedItem.quantity > 0
        ? "Sắp hết"
        : "Hết hàng";

    // Update item in the list
    const updatedData = inventoryData.map((item) =>
      item.key === updatedItem.key ? { ...updatedItem, status } : item
    );

    // Update state
    setInventoryData(updatedData);

    // Close modal and show success message
    setEditModalVisible(false);
    message.success(
      `Sản phẩm "${updatedItem.name}" đã được cập nhật thành công!`
    );
  };

  // Handle delete inventory item
  const handleDeleteInventoryItem = () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Remove item from the list
      setInventoryData(
        inventoryData.filter((item) => item.key !== selectedItem.key)
      );

      // Reset state and show success message
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedItem(null);
      message.success(
        `Sản phẩm "${selectedItem.name}" đã được xóa khỏi kho thành công!`
      );
    }, 1000);
  };

  // Edit inventory item
  const editItem = (item) => {
    setSelectedItem(item);
    setEditModalVisible(true);
  };

  // Confirm delete inventory item
  const confirmDelete = (item) => {
    setSelectedItem(item);
    setDeleteModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      className: "font-medium text-gray-800",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      filters: [
        { text: "Điện tử", value: "Điện tử" },
        { text: "Điện thoại", value: "Điện thoại" },
        { text: "Phụ kiện", value: "Phụ kiện" },
        { text: "Máy tính bảng", value: "Máy tính bảng" },
      ],
      onFilter: (value, record) => record.category === value,
      render: (text) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {text}
        </span>
      ),
      responsive: ["md"],
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      className: "text-gray-600",
      responsive: ["lg"],
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      align: "center",
      className: "font-medium text-gray-800",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        return <Tag color={getStatusColor(status)}>{status}</Tag>;
      },
      filters: [
        { text: "Đủ hàng", value: "Đủ hàng" },
        { text: "Sắp hết", value: "Sắp hết" },
        { text: "Hết hàng", value: "Hết hàng" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editItem(record)}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
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
  ];

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  console.log(warehouses.data);

  if (loading) {
    return <div>Loading warehouses...</div>;
  }

  if (error) {
    return <div>Error loading warehouses: {error}</div>;
  }

  const handleChange = (value) => {
    console.log(`Selected: ${value}`);
    // Xử lý logic khi người dùng chọn một warehouse
  };

  const options = warehouses.data.map((warehouse) => ({
    value: warehouse.warehouse_id,
    label: warehouse.warehouse_name,
  }));

  return (
    <div>
      <div>
        <h2>Select Warehouse</h2>
        <Select
          placeholder="Select a warehouse"
          onChange={handleChange}
          style={{ width: 300 }}
          loading={loading}
          options={options}
        />
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title
          level={2}
          className="text-xl md:text-2xl font-bold m-0 text-gray-800"
        >
          Quản lý kho
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
          size="middle"
        >
          Thêm sản phẩm
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="mb-4 md:mb-6">
          <div className="relative max-w-full md:max-w-md">
            <Input
              placeholder="Tìm kiếm sản phẩm, danh mục, vị trí..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="py-1.5 px-3 rounded-lg border-gray-200 hover:border-blue-400 focus:border-blue-500"
              size="middle"
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: "pt-4",
            size: "small",
          }}
          bordered={false}
          size="small"
          className="custom-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Add Inventory Item Modal */}
      <AddInventoryItemModal
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onSubmit={handleAddInventoryItem}
      />

      {/* Edit Inventory Item Modal */}
      <EditInventoryItemModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditInventoryItem}
        item={selectedItem}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteInventoryItem}
        title="Xác nhận xóa sản phẩm"
        content={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedItem?.name}" khỏi kho không? Hành động này không thể hoàn tác.`}
        loading={loading}
      />
    </div>
  );
};

export default InventoryManagement;
