import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Tooltip,
  Select,
  Typography,
  DatePicker,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  PrinterOutlined,
  DownloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import EditOrderModal from "../../components/modals/EditOrderModal";
import OrderDetailDrawer from "../../components/drawers/OrderDetailDrawer";
import { useNavigate } from "react-router-dom";
import orderService from "../../service/orderService";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAllOrder();
      setOrdersData(
        response.data.map((order) => ({
          ...order,
          key: order.order_id,
        }))
      );
    } catch (error) {
      useToastNotify("Không thể tải danh sách sản phẩm.", "error");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter data based on search text and status
  const filteredData = (ordersData || []).filter(
    (item) =>
      (statusFilter === "all" || item.order_status === statusFilter) &&
      (item.order_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.order_code?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.customer?.toLowerCase().includes(searchText.toLowerCase()))
  );
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle edit order
  const handleEditOrder = (updatedOrder) => {
    // Update order in the list
    const updatedData = ordersData.map((order) =>
      order.key === updatedOrder.key ? { ...updatedOrder } : order
    );

    // Update state
    setOrdersData(updatedData);

    // Close modal and show success message
    setEditModalVisible(false);
    message.success(
      `Đơn hàng ${updatedOrder.order_code} đã được cập nhật thành công!`
    );
  };

  // View order details
  const viewOrderDetails = (order) => {
    console.log(order)
    setSelectedOrder(order);
    setDetailDrawerVisible(true);
  };

  // Edit order
  const editOrder = (order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      key: "order_code",
      sorter: (a, b) => a.order_code.localeCompare(b.order_code),
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: customer => customer.customer_name,
      sorter: (a, b) => a.customer.customer_name.localeCompare(b.customer.customer_name),
    },
    {
      title: "Ngày giao",
      dataIndex: "order_date",
      key: "order_date",
      sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
      render: (date) => new Date(date).toLocaleDateString("vi-VN"), // hoặc định dạng tùy ý
      responsive: ["md"],
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (total) => formatPrice(total),
      sorter: (a, b) => a.total_amount - b.total_amount,
      align: "right",
      responsive: ["md"],
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_amount",
      key: "discount_amount",
      render: (discount) => formatPrice(discount),
      sorter: (a, b) => a.discount_amount - b.discount_amount,
      align: "right",
      responsive: ["lg"],
    },
    {
      title: "Thành tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (final) => formatPrice(final),
      sorter: (a, b) => a.final_amount - b.final_amount,
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "order_status",
      key: "order_status",
      align: "center",
      render: (status) => {
        let color;
        switch (status) {
          case "Đã giao":
            color = "success";
            break;
          case "Đang giao":
            color = "processing";
            break;
          case "Đang xử lý":
            color = "warning";
            break;
          case "Đã hủy":
            color = "error";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: "Đã giao", value: "Đã giao" },
        { text: "Đang giao", value: "Đang giao" },
        { text: "Đang xử lý", value: "Đang xử lý" },
        { text: "Đã hủy", value: "Đã hủy" },
      ],
      onFilter: (value, record) => record.order_status === value,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => viewOrderDetails(record.order_id)}
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editOrder(record)}
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="In hóa đơn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              size="small"
              className="hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              className="hover:bg-gray-100"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
        <Title
          level={2}
          className="text-xl md:text-2xl font-bold m-0 text-gray-800"
        >
          Quản lý đơn hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/create-order')}
          className="bg-blue-500 hover:bg-blue-600 border-0 shadow-md hover:shadow-lg transition-all flex items-center self-start md:self-auto"
        >
          Tạo đơn hàng
        </Button>
      </div>

      <Card
        className="rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
        bodyStyle={{ padding: "16px" }}
      >
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              prefix={<SearchOutlined className="text-gray-400" />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="md:max-w-md"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              defaultValue="all"
              style={{ minWidth: 150 }}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="Đã giao">Đã giao</Option>
              <Option value="Đang giao">Đang giao</Option>
              <Option value="Đang xử lý">Đang xử lý</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              className="w-full sm:w-auto"
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
          }}
          bordered={false}
          size="middle"
          className="custom-table"
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Create Order Modal */}
      {/* <CreateOrderModal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreateOrder}
      /> */}

      {/* Edit Order Modal */}
      <EditOrderModal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onSubmit={handleEditOrder}
        order={selectedOrder}
      />

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrderManagement;
